
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { UserProfile } from '../types';

export const EmployeeManager: React.FC = () => {
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    roleLevel: 1
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, role_level, full_name')
        .order('role_level', { ascending: true });
      
      if (error) throw error;
      if (data) {
        const mapped = data.map(emp => ({
          ...emp,
          email: `${emp.username}@ngoi.com`
        }));
        setEmployees(mapped as UserProfile[]);
      }
    } catch (err: any) {
      console.error("Lỗi tải danh sách:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const username = formData.username.trim().toLowerCase();
      const virtualEmail = `${username}@ngoi.com`;
      
      // Step 1: Create Auth User
      // Note: In client-side SDK, this might sign the admin out if not configured correctly on Supabase side.
      // Usually requires an Edge Function for "Admin creates users", but we follow requested logic.
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: virtualEmail,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            username: username,
            role_level: formData.roleLevel
          }
        }
      });

      if (authError) throw authError;

      // Step 2: Insert into profiles table
      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          username: username,
          full_name: formData.fullName,
          role_level: formData.roleLevel
        });
        
        if (profileError) {
          throw new Error(`Auth đã tạo nhưng lỗi tạo Profile: ${profileError.message}`);
        }
      }

      // Success notification
      alert('Đã tạo nhân sự thành công!');
      
      // Reset & Refresh
      setShowModal(false);
      setFormData({ username: '', password: '', fullName: '', roleLevel: 1 });
      fetchEmployees();
      
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo nhân viên. Username có thể đã tồn tại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header section with refined button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Hồ Sơ Nhân Sự</h3>
          <p className="text-gray-400 font-bold tracking-widest uppercase text-[9px] mt-1">Danh sách đội ngũ AZ</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-black flex items-center space-x-2 transition-all shadow-md shadow-green-50 active:scale-95 text-xs"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>Thêm nhân viên</span>
        </button>
      </div>

      {/* Refined compact table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[8px] uppercase font-black tracking-[0.2em]">
                <th className="px-8 py-4">Họ và tên</th>
                <th className="px-8 py-4">Tài khoản</th>
                <th className="px-8 py-4 text-center">Cấp bậc</th>
                <th className="px-8 py-4 text-right">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-16">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 border-2 border-green-50 border-t-green-600 rounded-full animate-spin mb-3"></div>
                      <p className="text-gray-400 font-bold uppercase tracking-widest text-[8px]">Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16 text-gray-400 font-bold text-xs">Chưa có dữ liệu.</td>
                </tr>
              ) : employees.map(emp => (
                <tr key={emp.id} className="group hover:bg-green-50/20 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-700 font-black text-xs">
                        {(emp.full_name || emp.username).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-xs">{emp.full_name || 'Hồ sơ mới'}</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase">{emp.username}@ngoi.com</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <code className="bg-gray-50 px-2 py-0.5 rounded-lg text-gray-500 text-[8px] font-black">{emp.username}</code>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${
                      emp.role_level === 0 ? 'bg-purple-100 text-purple-700' : 
                      emp.role_level === 1 ? 'bg-blue-50 text-blue-600' :
                      emp.role_level === 2 ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {emp.role_level === 0 ? 'Admin' : `Level ${emp.role_level}`}
                    </span>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                       <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                       <span className="text-[8px] font-black text-gray-400 uppercase">Hoạt động</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-8 sm:p-10 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Thêm Nhân Sự</h3>
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Khởi tạo tài khoản AZ</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-300 hover:text-gray-900 p-2 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Họ và Tên</label>
                  <input
                    required
                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white border focus:border-green-500 rounded-xl outline-none transition-all font-bold text-gray-900 text-sm"
                    value={formData.fullName}
                    onChange={e => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Nguyễn Văn An"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Username</label>
                  <input
                    required
                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white border focus:border-green-500 rounded-xl outline-none transition-all font-bold text-gray-900 text-sm"
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    placeholder="an_nv"
                  />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Cấp bậc</label>
                  <select
                    className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white border focus:border-green-500 rounded-xl outline-none transition-all font-black text-gray-700 text-sm"
                    value={formData.roleLevel}
                    onChange={e => setFormData({...formData, roleLevel: parseInt(e.target.value)})}
                  >
                    <option value={1}>Cấp bậc 1</option>
                    <option value={2}>Cấp bậc 2</option>
                    <option value={3}>Cấp bậc 3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mật khẩu</label>
                <input
                  required
                  type="password"
                  className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:bg-white border focus:border-green-500 rounded-xl outline-none transition-all font-bold text-gray-900 text-sm"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-[10px] font-black border border-red-100 flex items-center space-x-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                  <span>{error}</span>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold rounded-xl transition-all text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl transition-all shadow-lg shadow-green-100 active:scale-95 disabled:opacity-50 text-xs"
                >
                  {saving ? 'Đang tạo...' : 'Xác nhận lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
