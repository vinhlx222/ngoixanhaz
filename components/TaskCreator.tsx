
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { UserProfile } from '../types';

interface TaskCreatorProps {
  currentUser: UserProfile;
  onSuccess: (assigneeName: string) => void;
  onCancel: () => void;
}

export const TaskCreator: React.FC<TaskCreatorProps> = ({ currentUser, onSuccess, onCancel }) => {
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: '',
    assignee_id: ''
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // Hierarchical Logic: Fetch users with role_level GREATER than current user
        // Admin (0) sees 1, 2, 3. Level 1 sees 2, 3. Level 2 sees 3.
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, full_name, role_level')
          .gt('role_level', currentUser.role_level)
          .order('full_name', { ascending: true });
        
        if (error) throw error;
        setEmployees(data as UserProfile[]);
      } catch (err: any) {
        console.error("Lỗi tải nhân viên:", err);
        setError("Không thể liệt kê danh sách nhân sự cấp dưới.");
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, [currentUser.role_level]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assignee_id) {
      setError("Vui lòng chọn nhân sự phụ trách.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const selectedEmployee = employees.find(emp => emp.id === formData.assignee_id);
      const assigneeName = selectedEmployee?.full_name || selectedEmployee?.username || 'nhân viên';

      // 1. Create the Task
      const { data: taskData, error: insertError } = await supabase
        .from('tasks')
        .insert({
          title: formData.title,
          description: formData.description,
          deadline: formData.deadline,
          assignee_id: formData.assignee_id,
          created_by: currentUser.id,
          status: 'new'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 2. Send Notification to Employee
      await supabase.from('notifications').insert({
        user_id: formData.assignee_id,
        title: '💼 Công việc mới được giao',
        message: `${currentUser.full_name || currentUser.username} đã giao cho bạn: "${formData.title}"`,
        type: 'task_new',
        is_read: false
      });

      onSuccess(assigneeName);
    } catch (err: any) {
      setError(err.message || "Lỗi hệ thống khi khởi tạo nhiệm vụ.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onCancel}></div>
      
      <div className="relative bg-white rounded-[3.5rem] w-full max-w-xl overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        <div className="p-8 sm:p-14">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tighter">Bàn Giao Nhiệm Vụ</h3>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] mt-2 flex items-center space-x-2">
                 <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                 <span>Quản lý tiến độ AZ Group</span>
              </p>
            </div>
            <button onClick={onCancel} className="p-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-2xl transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2">Tên công việc</label>
                <input
                  required
                  type="text"
                  placeholder="Ghi vắn tắt tiêu đề..."
                  className="w-full px-7 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-green-500 transition-all text-gray-900 font-bold outline-none text-sm"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2">Mô tả chi tiết</label>
                <textarea
                  placeholder="Yêu cầu chi tiết..."
                  className="w-full px-7 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-green-500 transition-all text-gray-900 font-bold outline-none text-sm min-h-[100px] resize-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2">Người thực hiện</label>
                  <select
                    required
                    className="w-full px-7 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-green-500 transition-all text-gray-900 font-bold outline-none text-sm cursor-pointer"
                    value={formData.assignee_id}
                    onChange={e => setFormData({ ...formData, assignee_id: e.target.value })}
                  >
                    <option value="">Cấp dưới...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name || emp.username} (L{emp.role_level})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2">Hạn hoàn tất</label>
                  <input
                    required
                    type="datetime-local"
                    className="w-full px-7 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-green-500 transition-all text-gray-900 font-bold outline-none text-sm"
                    value={formData.deadline}
                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {error && <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-[10px] font-black border border-red-100">{error}</div>}

            <div className="flex space-x-4 pt-4">
              <button type="button" onClick={onCancel} className="flex-1 py-5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-500 font-black text-[10px] uppercase tracking-widest transition-all">Hủy</button>
              <button type="submit" disabled={saving} className="flex-[2] py-5 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50">
                {saving ? 'Đang gửi...' : 'Xác nhận giao việc'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
