
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './services/supabaseClient';
import { UserProfile } from './types';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Logo } from './components/Logo';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [initLoading, setInitLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [showEscapeHatch, setShowEscapeHatch] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Production-ready Timeout: 5s to check connectivity
    const hatchTimeout = setTimeout(() => {
      if (initLoading) {
        setShowEscapeHatch(true);
      }
    }, 5000);

    const checkUserAndSubscribe = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, username, role_level, full_name')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profileError) throw profileError;

          if (profile) {
            setCurrentUser({
              ...profile,
              email: session.user.email || `${profile.username}@ngoi.com`
            } as UserProfile);
          }
        }
      } catch (err: any) {
        console.error("Initialization error:", err);
        setInitError("Hệ thống đang bảo trì hoặc mất kết nối internet. Vui lòng thử lại sau.");
      } finally {
        setInitLoading(false);
        clearTimeout(hatchTimeout);
      }
    };

    checkUserAndSubscribe();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, role_level, full_name')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (profile) {
            const newUser = {
              ...profile,
              email: session.user.email || `${profile.username}@ngoi.com`
            } as UserProfile;
            
            setCurrentUser(prev => {
              if (JSON.stringify(prev) === JSON.stringify(newUser)) return prev;
              return newUser;
            });
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setInitLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(hatchTimeout);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    }
    setCurrentUser(null);
  };

  const handleForceToLogin = () => {
    setInitLoading(false);
    setInitError(null);
    setShowEscapeHatch(false);
    setCurrentUser(null);
  };

  // Production Error State: Branded & Clear
  if (initError && !currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] p-8 text-center animate-in fade-in duration-700">
        <div className="bg-white p-16 rounded-[4rem] shadow-2xl max-w-lg w-full border border-red-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
          <div className="flex justify-center mb-10">
            <Logo size="sm" />
          </div>
          <div className="text-6xl mb-6">📡</div>
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">LỖI KẾT NỐI HỆ THỐNG</h2>
          <p className="text-gray-400 font-bold mb-12 leading-relaxed text-[10px] uppercase tracking-[0.2em] px-4">
            {initError}
          </p>
          <div className="space-y-4">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-5 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-100 hover:bg-green-700 active:scale-95 transition-all text-[11px] uppercase tracking-widest"
            >
              Thử kết nối lại ngay
            </button>
            <button 
              onClick={handleForceToLogin}
              className="w-full py-5 bg-gray-50 text-gray-400 font-black rounded-2xl hover:bg-gray-100 transition-all text-[10px] uppercase tracking-widest"
            >
              Về màn hình đăng nhập
            </button>
          </div>
          <p className="mt-10 text-[8px] text-gray-300 font-black uppercase tracking-[0.4em]">AZ Group Technical Support</p>
        </div>
      </div>
    );
  }

  // Production Loading State
  if (initLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 animate-in fade-in duration-500">
        <div className="mb-12">
          <Logo size="md" />
        </div>
        <div className="relative">
          <div className="w-20 h-20 border-4 border-green-50 border-t-green-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-green-600 tracking-tighter">SECURE</div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-900 font-black uppercase tracking-[0.4em] text-[10px] mb-2 animate-pulse">Đang đồng bộ dữ liệu Portal</p>
          <p className="text-gray-300 text-[8px] font-black uppercase tracking-[0.3em]">Hệ thống bảo mật bởi AZ Group</p>
        </div>
        
        {showEscapeHatch && (
          <div className="mt-20 animate-in slide-in-from-bottom-8 duration-1000">
            <button 
              onClick={handleForceToLogin}
              className="px-10 py-5 bg-white border border-gray-100 shadow-xl rounded-[2rem] text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
            >
              Bỏ qua & Đăng nhập
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="antialiased text-gray-900 selection:bg-green-100 selection:text-green-900">
      {!currentUser ? (
        <Login onLoginSuccess={(user) => setCurrentUser(user)} />
      ) : (
        <Dashboard user={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default App;
