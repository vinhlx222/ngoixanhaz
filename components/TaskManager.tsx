
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Task, UserProfile } from '../types';
import { TaskCreator } from './TaskCreator';

interface TaskManagerProps {
  user: UserProfile;
  mode?: 'active' | 'history';
}

export const TaskManager: React.FC<TaskManagerProps> = ({ user, mode = 'active' }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  const isManager = user.role_level < 3;
  const isAdmin = user.role_level === 0;

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('tasks')
        .select(`*, profiles:assignee_id (full_name, username)`)
        .order('created_at', { ascending: false });

      if (user.role_level !== 0) {
        // Managers see tasks they created OR assigned to them
        query = query.or(`assignee_id.eq.${user.id},created_by.eq.${user.id}`);
      }

      if (mode === 'history') {
        query = query.eq('status', 'completed');
      } else {
        query = query.neq('status', 'completed');
      }

      const { data, error: taskError } = await query;
      if (taskError) throw taskError;
      setTasks(data || []);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user.id, mode]);

  const handleRemind = async (task: Task) => {
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: task.assignee_id,
        title: '🔔 Nhắc nhở công việc',
        message: `${user.full_name || user.username} đang nhắc nhở bạn hoàn thành: "${task.title}"`,
        type: 'reminder',
        is_read: false
      });

      if (error) throw error;
      alert(`🚀 Đã gửi lời nhắc tới nhân sự phụ trách!`);
    } catch (err: any) {
      alert('Lỗi gửi thông báo: ' + err.message);
    }
  };

  const handleUpdateStatus = async (taskId: string, newStatus: Task['status'], message: string, taskTitle: string, assigneeId?: string) => {
    try {
      const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
      if (error) throw error;
      
      // Notify about status changes
      if (newStatus === 'completed' && isAdmin) {
        await supabase.from('notifications').insert({
          user_id: assigneeId,
          title: '✅ Công việc được duyệt',
          message: `Quản trị viên đã phê duyệt hoàn thành: "${taskTitle}"`,
          type: 'task_approved'
        });
      }

      alert(`📢 ${message}`);
      fetchTasks();
    } catch (err: any) {
      alert('Lỗi hệ thống: ' + err.message);
    }
  };

  const getStatusStyle = (task: Task) => {
    if (task.status === 'completed') return { bg: 'bg-gray-100 text-gray-500 opacity-80', badgeBg: 'bg-green-100 text-green-700', label: 'Hoàn thành', icon: '✓', textMain: 'text-gray-800' };
    if (task.status === 'pending') return { bg: 'bg-gray-200 text-gray-600', badgeBg: 'bg-white/50 text-gray-700', label: 'Đang chờ duyệt', icon: '⏳', textMain: 'text-gray-900' };
    
    const diff = new Date(task.deadline).getTime() - new Date().getTime();
    if (diff < 0) return { bg: 'bg-[#ef4444] text-white', badgeBg: 'bg-white/20', label: 'Quá hạn', icon: '!', textMain: 'text-white' };
    if (diff < 172800000) return { bg: 'bg-[#f59e0b] text-black', badgeBg: 'bg-black/10', label: 'Gấp', icon: '🕒', textMain: 'text-black' };
    return { bg: 'bg-[#22c55e] text-white', badgeBg: 'bg-white/20', label: 'Tiến độ tốt', icon: '✓', textMain: 'text-white' };
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{mode === 'history' ? 'Lịch Sử Hồ Sơ' : 'Danh Sách Công Việc'}</h3>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1.5 flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${mode === 'history' ? 'bg-amber-500' : 'bg-green-500'} animate-pulse`}></span>
            <span>{isAdmin ? 'Quản lý toàn bộ AZ' : 'Tiến độ làm việc của bạn'}</span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isManager && mode === 'active' && (
            <button onClick={() => setIsCreatorOpen(true)} className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center space-x-3">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
              <span>Giao việc mới</span>
            </button>
          )}
          <button onClick={fetchTasks} className="p-4 bg-white border border-gray-100 rounded-2xl hover:bg-green-50 transition-all shadow-sm active:scale-90 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {tasks.map(task => {
          const style = getStatusStyle(task);
          const isTaskAssignee = task.assignee_id === user.id;
          const isTaskCreator = task.created_by === user.id;
          
          return (
            <div key={task.id} className={`${style.bg} rounded-[2.5rem] p-8 relative overflow-hidden transition-all shadow-sm group`}>
              <div className="absolute top-[-20px] right-[-10px] text-[120px] font-black opacity-10 pointer-events-none">{style.icon}</div>
              <div className="relative z-10 flex flex-col h-full">
                <div className={`${style.badgeBg} self-start px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-8`}>{style.label}</div>
                <h4 className={`text-2xl font-black mb-4 leading-tight tracking-tight ${style.textMain}`}>{task.title}</h4>
                <p className={`text-sm font-medium mb-10 line-clamp-3 opacity-80 ${style.textMain}`}>{task.description || "Nhiệm vụ AZ Group."}</p>
                
                <div className="mt-auto space-y-3 pt-6 border-t border-black/5">
                  <div className="flex items-center space-x-3 text-xs font-bold">
                    <span className="opacity-60 uppercase text-[8px] font-black">Nhân sự:</span>
                    <span>{task.profiles?.full_name || 'AZ Member'}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs font-bold">
                    <span className="opacity-60 uppercase text-[8px] font-black">Deadline:</span>
                    <span>{new Date(task.deadline).toLocaleString('vi-VN')}</span>
                  </div>
                </div>

                <div className="mt-8">
                  {/* User Báo cáo */}
                  {isTaskAssignee && task.status === 'new' && (
                    <button onClick={() => handleUpdateStatus(task.id, 'pending', 'Báo cáo hoàn thành đã gửi.', task.title)} className="w-full py-4 bg-white/20 hover:bg-white/30 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Gửi Báo Cáo</button>
                  )}

                  {/* Admin Phê duyệt */}
                  {isAdmin && task.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button onClick={() => handleUpdateStatus(task.id, 'completed', 'Đã duyệt xong.', task.title, task.assignee_id)} className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest">Đồng ý</button>
                      <button onClick={() => handleUpdateStatus(task.id, 'new', 'Đã từ chối.', task.title)} className="flex-1 py-4 bg-white text-red-500 rounded-2xl font-black text-[9px] uppercase tracking-widest">Từ chối</button>
                    </div>
                  )}

                  {/* Manager Nhắc việc */}
                  {isTaskCreator && task.status === 'new' && (
                    <button onClick={() => handleRemind(task)} className="w-full py-4 bg-white/20 hover:bg-white/30 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Nhắc việc ngay</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isCreatorOpen && (
        <TaskCreator currentUser={user} onSuccess={(name) => { alert(`✅ Đã giao việc cho ${name}`); setIsCreatorOpen(false); fetchTasks(); }} onCancel={() => setIsCreatorOpen(false)} />
      )}
    </div>
  );
};
