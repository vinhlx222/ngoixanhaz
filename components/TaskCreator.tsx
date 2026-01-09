import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Profile } from '../types';

export const TaskCreator = ({ creatorEmail, onTaskCreated }: { creatorEmail: string, onTaskCreated: () => void }) => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // Ô nhập nội dung chi tiết
  const [assignedTo, setAssignedTo] = useState('');
  const [deadline, setDeadline] = useState('');

  // Lấy danh sách nhân viên bao gồm cả Email và Họ Tên
  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase.from('profiles').select('email, full_name');
      if (data) setProfiles(data);
    };
    fetchProfiles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Lưu công việc vào bảng tasks (có kèm description)
    const { error: taskError } = await supabase.from('tasks').insert([{
      title: title,
      description: description,
      assigned_to: assignedTo,
      created_by: creatorEmail,
      deadline: deadline,
      status: 'pending'
    }]);

    if (!taskError) {
      // Gửi thông báo rung chuông cho nhân viên
      await supabase.from('notifications').insert({
        to_user: assignedTo,
        message: `🔔 Việc mới: ${title}`
      });

      alert('Đã giao việc thành công!');
      
      // Xóa trắng form để giao việc tiếp theo
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setDeadline('');
      onTaskCreated(); 
    } else {
      alert('Lỗi: ' + taskError.message);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">🆕 Giao nhiệm vụ mới</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tên công việc */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Tên công việc</label>
            <input type="text" placeholder="Giao ngói, thu nợ..." className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-green-500" value={title} onChange={e => setTitle(e.target.value)} required />
          </div>

          {/* Chọn nhân viên (Hiển thị Tên đầy đủ) */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Người nhận việc</label>
            <select className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-green-500 font-bold" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} required>
              <option value="">-- Chọn nhân viên --</option>
              {profiles.map(p => (
                <option key={p.email} value={p.email}>
                  {p.full_name ? p.full_name : p.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ô nhập chi tiết công việc */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Mô tả chi tiết (Địa chỉ, lưu ý...)</label>
          <textarea 
            placeholder="Nhập hướng dẫn chi tiết cho anh em tại đây..." 
            className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-green-500 min-h-[80px]" 
            value={description} 
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap md:flex-nowrap gap-4 items-end">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Hạn hoàn thành</label>
            <input type="datetime-local" className="w-full p-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-green-500" value={deadline} onChange={e => setDeadline(e.target.value)} required />
          </div>
          <button type="submit" className="w-full md:w-auto bg-green-600 text-white font-black px-10 py-3.5 rounded-2xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all uppercase tracking-wider text-xs">
            Giao việc
          </button>
        </div>
      </form>
    </div>
  );
};