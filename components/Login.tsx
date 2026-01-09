import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export const Login = ({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Hỗ trợ sếp đăng nhập bằng cả email đầy đủ hoặc chỉ tên đăng nhập 'admin'
    const finalEmail = email.includes('@') ? email : `${email}@ngoi.com`;
    const { data, error } = await supabase.auth.signInWithPassword({ email: finalEmail, password });
    
    if (error) { alert("Sai tài khoản hoặc mật khẩu sếp ơi!"); } 
    else { onLoginSuccess(data.user); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-6 font-sans">
      {/* PHẦN LOGO VÀ CHÂM NGÔN CỦA SẾP */}
      <div className="mb-12 text-center animate-in fade-in slide-in-from-top-10 duration-700">
        <div className="w-24 h-24 bg-green-600 rounded-[30px] flex items-center justify-center shadow-2xl shadow-green-200 mx-auto mb-6 transform rotate-6 border-4 border-white">
          <span className="text-white font-black text-4xl">AZ</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Ngói Xanh AZ</h1>
        
        {/* Câu châm ngôn cách điệu nghệ thuật */}
        <div className="relative inline-block">
          <p className="text-xl font-serif italic text-green-700 font-semibold tracking-tight px-8 py-2">
            "Việc hôm nay chớ để ngày mai"
          </p>
          <div className="absolute left-0 top-0 text-5xl text-green-100 opacity-60 font-serif leading-none">“</div>
          <div className="absolute right-0 bottom-0 text-5xl text-green-100 opacity-60 font-serif leading-none">”</div>
        </div>
      </div>

      {/* KHỐI ĐĂNG NHẬP */}
      <div className="w-full max-w-sm bg-white p-10 rounded-[45px] shadow-2xl shadow-slate-200 border border-white">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Tài khoản</label>
            <input type="text" placeholder="Tên đăng nhập hoặc Email..." className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-green-500 transition-all shadow-inner" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-400 uppercase ml-3 tracking-widest">Mật khẩu</label>
            <input type="password" placeholder="••••••••" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-green-500 transition-all shadow-inner" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-black py-4.5 rounded-[22px] uppercase text-xs tracking-widest shadow-xl shadow-slate-200 hover:bg-green-700 active:scale-95 transition-all">
            {loading ? 'Đang xác thực...' : 'Đăng nhập ngay'}
          </button>
        </form>
      </div>
      
      <p className="mt-12 text-[10px] text-slate-300 font-bold uppercase tracking-[0.4em]">Ngoixanhaz Co., Ltd</p>
    </div>
  );
};