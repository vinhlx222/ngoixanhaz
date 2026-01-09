import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Task } from '../types';

export const TaskManager = ({ userEmail, refreshTrigger, viewMode }: { userEmail: string, refreshTrigger: number, viewMode: 'current' | 'history' }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userRole, setUserRole] = useState<number>(3);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [nameMap, setNameMap] = useState<{[key: string]: string}>({});
  const [expanded, setExpanded] = useState({ New: false, Urgent: false, Overdue: false });

  useEffect(() => {
    fetchUserData();
    fetchTasks();
  }, [userEmail, refreshTrigger, viewMode]);

  const fetchUserData = async () => {
    const { data } = await supabase.from('profiles').select('role_level').eq('email', userEmail).single();
    if (data) setUserRole(data.role_level);
  };

  const fetchTasks = async () => {
    const { data: tasksData } = await supabase.from('tasks').select('*').order('deadline', { ascending: false });
    const { data: profilesData } = await supabase.from('profiles').select('email, full_name');
    if (profilesData) {
      const mapping = profilesData.reduce((acc: any, p: any) => ({ ...acc, [p.email]: p.full_name }), {});
      setNameMap(mapping);
    }
    if (tasksData) setTasks(tasksData);
    setLoading(false);
  };

  // BẢN MỚI: BẤM LÀ XÓA LUÔN, KHÔNG HỎI RƯỜM RÀ
  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) {
      alert("✅ ĐÃ XÓA XONG!");
      fetchTasks();
    } else {
      alert("❌ LỖI XÓA: " + error.message);
    }
  };

  const remindTask = async (task: Task) => {
    const { error } = await supabase.from('notifications').insert({ to_user: task.assigned_to, message: `🚨 NHẮC VIỆC KHẨN CẤP: ${task.title}` });
    if (!error) alert('🔔 ĐÃ RUNG CHUÔNG XONG!');
    else alert("❌ LỖI GỬI: " + error.message);
  };

  const updateStatus = async (id: string, newStatus: string, taskTitle?: string) => {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
    if (newStatus === 'completed') await supabase.from('notifications').insert({ to_user: 'admin@ngoi.com', message: `📢 Việc xong: ${taskTitle}` });
    fetchTasks();
  };

  const getTaskCategory = (task: Task) => {
    if (task.status === 'approved') return 'History';
    const now = new Date();
    const deadline = new Date(task.deadline);
    if (now > deadline) return 'Overdue';
    if ((deadline.getTime() - now.getTime()) / (1000 * 60 * 60) <= 48) return 'Urgent';
    return 'New';
  };

  if (loading) return <div className="p-10 text-center font-bold uppercase animate-pulse">Đang nạp dữ liệu...</div>;

  return (
    <div className="w-full">
      {viewMode === 'current' ? (
        <div className="flex flex-col gap-6">
          {(['New', 'Urgent', 'Overdue'] as const).map((cat) => {
            const filtered = tasks.filter(t => getTaskCategory(t) === cat);
            const isExpanded = expanded[cat];
            const displayTasks = isExpanded ? filtered : filtered.slice(0, 2);
            return (
              <div key={cat} className="space-y-3">
                <h3 className={`font-black text-[11px] uppercase p-2.5 rounded-xl flex justify-between items-center ${cat === 'New' ? 'bg-blue-50 text-blue-600' : cat === 'Urgent' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                  <span>{cat === 'New' ? '🆕 Việc mới' : cat === 'Urgent' ? '⏳ Gần hạn' : '⚠️ Quá hạn'} ({filtered.length})</span>
                  {filtered.length > 2 && <button onClick={() => setExpanded({...expanded, [cat]: !isExpanded})} className="text-[10px] bg-white px-3 py-1 rounded-lg border font-bold shadow-sm"> {isExpanded ? '▲ Thu gọn' : '▼ Hiện thêm'} </button>}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {displayTasks.map(task => (
                    <div key={task.id} className="bg-white rounded-[22px] shadow-sm border border-slate-100 relative overflow-hidden active:scale-[0.98] transition-all">
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${task.status === 'completed' ? 'bg-amber-400' : getTaskCategory(task) === 'Overdue' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 onClick={() => setSelectedTask(task)} className="font-black text-slate-800 text-[13px] uppercase truncate flex-1 pr-4 cursor-pointer">{task.title}</h4>
                          {/* NÚT BẤM TO HƠN, TÁCH BIỆT */}
                          <div className="flex gap-4">
                            <button onClick={(e) => { e.stopPropagation(); remindTask(task); }} className="bg-amber-50 p-2 rounded-xl text-xl shadow-sm border border-amber-100">🔔</button>
                            <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} className="bg-red-50 p-2 rounded-xl text-xl shadow-sm border border-red-100 text-red-400">🗑️</button>
                          </div>
                        </div>
                        <div onClick={() => setSelectedTask(task)} className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase pt-2 border-t border-slate-50 cursor-pointer">
                          <span>👤 {nameMap[task.assigned_to] || task.assigned_to}</span>
                          <span className={getTaskCategory(task) === 'Overdue' ? 'text-red-500' : ''}>⏰ {new Date(task.deadline).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                      <div className="px-3 pb-3">
                        {userRole === 3 && task.status === 'pending' && <button onClick={(e) => { e.stopPropagation(); updateStatus(task.id, 'completed', task.title); }} className="w-full bg-slate-900 text-white text-[10px] py-2.5 rounded-xl uppercase">Báo cáo xong</button>}
                        {userRole === 1 && task.status === 'completed' && (
                          <div className="flex gap-2">
                            <button onClick={(e) => { e.stopPropagation(); updateStatus(task.id, 'approved', task.title); }} className="flex-1 bg-green-600 text-white text-[9px] py-2.5 rounded-xl uppercase">Duyệt</button>
                            <button onClick={(e) => { e.stopPropagation(); updateStatus(task.id, 'pending', task.title); }} className="flex-1 bg-white text-red-500 border border-red-100 text-[9px] py-2.5 rounded-xl uppercase">Làm lại</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Lịch sử */
        <div className="bg-white p-5 rounded-3xl border border-slate-100">
           <h2 className="text-sm font-black mb-4 uppercase border-b pb-4">📂 Nhật ký hoàn thành</h2>
           {tasks.filter(t => getTaskCategory(t) === 'History').map(task => (
             <div key={task.id} className="p-4 bg-slate-50 rounded-2xl mb-3 flex justify-between items-center">
               <div onClick={() => setSelectedTask(task)} className="flex-1 cursor-pointer">
                  <p className="text-sm font-bold uppercase">{task.title}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">👤 {nameMap[task.assigned_to] || task.assigned_to}</p>
               </div>
               {userRole === 1 && <button onClick={() => deleteTask(task.id)} className="p-2 text-red-400 text-lg">🗑️</button>}
             </div>
           ))}
        </div>
      )}

      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[100] p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[35px] p-8">
            <h2 className="text-xl font-black uppercase mb-4">{selectedTask.title}</h2>
            <div className="bg-slate-50 p-4 rounded-2xl text-sm italic mb-4">{selectedTask.description || "Không có mô tả."}</div>
            <button onClick={() => setSelectedTask(null)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-xs">Đóng lại</button>
          </div>
        </div>
      )}
    </div>
  );
};