
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { Notification, UserProfile } from '../types';

export const NotificationCenter: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!error && data) {
      setNotifications(data);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Real-time subscription for new notifications
    const channel = supabase
      .channel(`user-notifications-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications(prev => [newNotif, ...prev]);
          setHasNew(true);
          
          // Haptic feedback & Toast
          if ('vibrate' in navigator) navigator.vibrate(200);
          
          // Auto-hide new indicator after some time if drawer is closed
          setTimeout(() => setHasNew(false), 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => { setIsOpen(!isOpen); setHasNew(false); }}
        className={`p-3 rounded-2xl transition-all relative ${isOpen ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-gray-400 hover:bg-green-50 hover:text-green-600 border border-gray-100'}`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full ring-4 ring-white">
            {unreadCount}
          </span>
        )}

        {hasNew && !isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden z-[110] animate-in slide-in-from-top-2 duration-200">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Thông báo mới</h4>
            {unreadCount > 0 && <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{unreadCount} tin chưa đọc</span>}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-gray-300 text-xs font-bold italic">Không có thông báo nào.</p>
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => !n.is_read && markAsRead(n.id)}
                  className={`p-5 border-b border-gray-50 cursor-pointer transition-colors ${n.is_read ? 'opacity-50' : 'bg-green-50/30 hover:bg-green-50/50'}`}
                >
                  <div className="flex space-x-3">
                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.is_read ? 'bg-gray-300' : 'bg-green-500'}`}></div>
                    <div>
                      <p className="text-xs font-black text-gray-900 leading-tight mb-1">{n.title}</p>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{n.message}</p>
                      <p className="text-[8px] font-black text-gray-300 uppercase mt-2 tracking-widest">
                        {new Date(n.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {new Date(n.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 bg-gray-50/50 text-center">
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
            >
              Đóng lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
