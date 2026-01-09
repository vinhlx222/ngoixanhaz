import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { TaskManager } from './components/TaskManager';
import { TaskCreator } from './components/TaskCreator';
import { UserManagement } from './components/UserManagement';
import { supabase } from './services/supabaseClient';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<'tasks' | 'users' | 'history'>('tasks');
  const [notifCount, setNotifCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const channel = supabase.channel('notif-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `to_user=eq.${user.email}` }, (payload) => { 
        fetchNotifications();
        if (payload.new.message.includes('🚨')) alert(payload.new.message);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, refreshTrigger]);

  const fetchNotifications = async () => {
    const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('to_user', user.email).eq('is_read', false);
    if (count !== null) setNotifCount(count);
  };

  const handleRefresh = () => { setRefreshTrigger(prev => prev + 1); };

  if (!user) return <Login onLoginSuccess={(u) => setUser(u)} />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pb-20 font-sans text-slate-800">
      <header className="w-full bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-100">
              <span className="text-white font-black text-xl">AZ</span>
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-800 leading-none tracking-tight uppercase">Ngói Xanh AZ</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Management System</p>
            </div>
          </div>
          <button onClick={() => setUser(null)} className="bg-slate-100 text-slate-500 p-2 rounded-full transition-all active:bg-red-50 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
        <nav className="flex justify-center bg-white border-t border-slate-100">
          <div className="flex gap-2 p-1">
            {[{ id: 'tasks', label: 'CÔNG VIỆC', icon: '📋' }, { id: 'history', label: 'LỊCH SỬ', icon: '📂' }, { id: 'users', label: 'NHÂN SỰ', icon: '👥' }].map((t) => (
              <button key={t.id} onClick={() => setTab(t.id as any)} className={`relative px-5 py-3 text-xs font-black rounded-lg transition-all flex items-center gap-2 ${tab === t.id ? 'bg-green-50 text-green-700' : 'text-slate-400'}`}>
                <span>{t.icon}</span> {t.label}
                {t.id === 'tasks' && notifCount > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border-2 border-white animate-bounce">{notifCount}</span>}
                {tab === t.id && <div className="absolute bottom-0 left-2 right-2 h-1 bg-green-600 rounded-t-full"></div>}
              </button>
            ))}
          </div>
        </nav>
      </header>
      
      <main className="w-full max-w-6xl px-4 mt-6">
        {tab === 'tasks' && (
          <div className="flex flex-col gap-10">
            <TaskManager userEmail={user.email} refreshTrigger={refreshTrigger} viewMode="current" />
            <div className="border-t pt-10 border-slate-200 border-dashed pb-10">
               <TaskCreator creatorEmail={user.email} onTaskCreated={handleRefresh} />
            </div>
          </div>
        )}
        {tab === 'history' && <TaskManager userEmail={user.email} refreshTrigger={refreshTrigger} viewMode="history" />}
        {tab === 'users' && <UserManagement />}
      </main>
    </div>
  );
}