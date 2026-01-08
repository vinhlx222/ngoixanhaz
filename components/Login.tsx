
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Logo } from './Logo';
import { UserProfile } from '../types';

interface LoginProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Step 1: Construct virtual email directly
      const virtualEmail = `${username.trim().toLowerCase()}@ngoi.com`;

      // Step 2: Sign in with the constructed email
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: virtualEmail,
        password: password,
      });

      if (authError) {
        throw new Error(`Đăng nhập thất bại: ${authError.message}`);
      }

      if (authData?.user) {
        // Step 3: Fetch profile data (excluding email column as it doesn't exist)
        const { data: fullProfile, error: profileFetchError } = await supabase
          .from('profiles')
          .select('id, username, role_level, full_name')
          .eq('id', authData.user.id)
          .single();

        if (profileFetchError || !fullProfile) {
          throw new Error('Đã xác thực nhưng không tìm thấy thông tin phân quyền trong bảng profiles.');
        }

        // Add email from auth user to the object for UI display
        onLoginSuccess({
          ...fullProfile,
          email: authData.user.email || virtualEmail
        } as UserProfile);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi đăng nhập không xác định.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-tr from-gray-100 via-white to-green-50 font-['Inter']">
      <div className="max-w-md w-full">
        <div className="mb-10 flex justify-center">
          <Logo size="lg" />
        </div>
        
        <div className="bg-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.12)] rounded-[3.5rem] p-8 sm:p-14 border border-gray-100">
          <div className="mb-12 text-center">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Hệ Thống AZ</h2>
            <p className="text-gray-400 mt-2 font-bold tracking-widest uppercase text-xs">Ngói Xanh AZ Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-7 py-5 rounded-3xl bg-gray-50 border-2 border-transparent focus:bg-white focus:ring-8 focus:ring-green-500/5 focus:border-green-500 transition-all text-gray-900 font-bold outline-none"
                placeholder="Ví dụ: admin"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 ml-2">Mật khẩu</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-7 py-5 rounded-3xl bg-gray-50 border-2 border-transparent focus:bg-white focus:ring-8 focus:ring-green-500/5 focus:border-green-500 transition-all text-gray-900 font-bold outline-none"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-5 rounded-[2rem] bg-red-50 text-red-600 text-sm font-black border border-red-100 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 px-8 rounded-[2rem] text-white font-black text-xl bg-green-600 hover:bg-green-700 shadow-[0_20px_40px_rgba(22,163,74,0.3)] hover:shadow-[0_25px_50px_rgba(22,163,74,0.4)] transition-all active:scale-[0.97] disabled:opacity-50 mt-6"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Đang kết nối...</span>
                </div>
              ) : 'Đăng Nhập Ngay'}
            </button>
          </form>
        </div>
        <p className="text-center mt-12 text-gray-400 text-xs font-black uppercase tracking-[0.3em] opacity-50">
          AZ Group Internal Only
        </p>
      </div>
    </div>
  );
};
