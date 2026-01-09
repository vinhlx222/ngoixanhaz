// Nội dung mới cho components/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export const UserManagement = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState(''); // Ô nhập Họ tên
  const [id, setId] = useState(''); 
  const [level, setLevel] = useState<number>(3);

  useEffect(() => { fetchProfiles(); }, []);

  const fetchProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*').order('role_level', { ascending: true });
    if (data) setProfiles(data);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('profiles').upsert({ 
      id: id, 
      email: email, 
      full_name: fullName, 
      role_level: level 
    });

    if (!error) {
      alert('Đã cập nhật: ' + fullName);
      setEmail(''); setFullName(''); setId('');
      fetchProfiles();
    }
  };

  return (
    <div className="w-full max-w-5xl bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      <h2 className="text-lg font-black text-slate-700 mb-6 uppercase border-b pb-4">👥 Danh sách nhân sự Ngói Xanh AZ</h2>
      <form onSubmit={handleUpdateUser} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-8 bg-slate-50 p-4 rounded-2xl">
        <input type="text" placeholder="ID (từ Auth)" className="p-3 bg-white rounded-xl text-xs border-none" value={id} onChange={e => setId(e.target.value)} required />
        <input type="email" placeholder="Email" className="p-3 bg-white rounded-xl text-xs border-none" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="text" placeholder="Nhập Họ và Tên..." className="p-3 bg-white rounded-xl text-xs border-none font-bold text-green-700" value={fullName} onChange={e => setFullName(e.target.value)} required />
        <select className="p-3 bg-white rounded-xl text-xs border-none font-bold" value={level} onChange={e => setLevel(Number(e.target.value))}>
          <option value={1}>Cấp 1 (Admin)</option>
          <option value={3}>Cấp 3 (Nhân viên)</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white font-black py-3 rounded-xl text-[10px] uppercase">Cập nhật tên</button>
      </form>

      <table className="w-full text-left">
        <thead><tr className="text-[10px] uppercase text-slate-400 border-b"><th className="pb-3 px-2">Họ và Tên</th><th className="pb-3 px-2">Email liên kết</th><th className="pb-3 text-center">Cấp bậc</th></tr></thead>
        <tbody>
          {profiles.map(p => (
            <tr key={p.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => { setId(p.id); setEmail(p.email); setFullName(p.full_name || ''); setLevel(p.role_level); }}>
              <td className="py-4 px-2 font-black text-slate-800 text-sm">{p.full_name || 'Chưa đặt tên'}</td>
              <td className="py-4 px-2 text-xs text-slate-500">{p.email}</td>
              <td className="py-4 text-center"><span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${p.role_level === 1 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>Cấp {p.role_level}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};