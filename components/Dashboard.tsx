
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Logo } from './Logo';
import { EmployeeManager } from './EmployeeManager';
import { TaskManager } from './TaskManager';
import { NotificationCenter } from './NotificationCenter';

interface DashboardProps {
  user: UserProfile;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const isAdmin = user.role_level === 0;

  const getRoleTitle = (level: number) => {
    if (level === 0) return 'QUẢN TRỊ VIÊN';
    if (level >= 1 && level <= 3) return `NHÂN VIÊN CẤP ${level}`;
    return 'NGƯỜI DÙNG';
  };

  const navItems = [
    { id: 'overview', label: 'Bảng chính', icon: '🏠' },
    { id: 'employees', label: 'Quản lý nhân viên', adminOnly: true, icon: '👥' },
    { id: 'tasks', label: 'Việc hiện tại', icon: '📝' },
    { id: 'history', label: 'Lịch sử hoàn tất', icon: '📜' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-['Inter'] text-gray-900">
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-72 bg-white border-r border-gray-100 flex flex-col p-6 space-y-10 z-20">
          <div className="py-2 flex justify-center lg:justify-start">
            <Logo size="sm" />
          </div>

          <div className="flex-1 space-y-1">
            <p className="px-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Hệ Thống</p>
            {navItems.filter(item => !item.adminOnly || isAdmin).map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl flex items-center space-x-4 transition-all group ${
                  activeTab === item.id 
                  ? 'bg-green-600 text-white shadow-lg shadow-green-100' 
                  : 'text-gray-500 hover:bg-green-50 hover:text-green-700'
                }`}
              >
                <span className={`text-lg transition-transform group-hover:scale-110 ${activeTab === item.id ? 'opacity-100' : 'opacity-50'}`}>
                  {item.icon}
                </span>
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-green-600 shadow-md flex items-center justify-center text-white font-black text-sm uppercase">
                {user.username.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-gray-900 truncate tracking-tight">{user.full_name || user.username}</p>
                <p className="text-[9px] text-green-600 font-black uppercase tracking-widest mt-0.5">{getRoleTitle(user.role_level)}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="w-full py-3 px-4 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-200 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Đăng xuất</span>
            </button>
          </div>
        </aside>

        {/* Dynamic Main Area */}
        <main className="flex-1 p-6 lg:p-12 overflow-y-auto relative">
          <div className="absolute top-6 right-6 lg:top-12 lg:right-12 z-50">
            <NotificationCenter user={user} />
          </div>

          <div className="max-w-6xl mx-auto">
            {activeTab === 'overview' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-12">
                  <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-3">
                    Bảng Điều Khiển
                  </h1>
                  <p className="text-gray-400 text-lg font-medium tracking-tight">Cổng quản trị tối ưu của Ngói Xanh AZ Group.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {isAdmin && (
                    <button onClick={() => setActiveTab('employees')} className="group bg-white p-10 rounded-[3rem] border-2 border-transparent hover:border-green-500 shadow-xl shadow-gray-200/40 flex flex-col items-center text-center transition-all hover:-translate-y-1 active:scale-98">
                      <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center text-4xl mb-6 group-hover:bg-green-600 group-hover:text-white transition-all shadow-sm">👥</div>
                      <h3 className="text-2xl font-black text-gray-900 mb-2">Nhân sự</h3>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Quản lý đội ngũ AZ</p>
                    </button>
                  )}
                  <button onClick={() => setActiveTab('tasks')} className="group bg-white p-10 rounded-[3rem] border-2 border-transparent hover:border-blue-500 shadow-xl shadow-gray-200/40 flex flex-col items-center text-center transition-all hover:-translate-y-1 active:scale-98">
                    <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-4xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">📋</div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Việc AZ</h3>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Tiến độ nhiệm vụ</p>
                  </button>
                  <button onClick={() => setActiveTab('history')} className="group bg-white p-10 rounded-[3rem] border-2 border-transparent hover:border-amber-500 shadow-xl shadow-gray-200/40 flex flex-col items-center text-center transition-all hover:-translate-y-1 active:scale-98">
                    <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center text-4xl mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">📜</div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Hồ sơ</h3>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Lịch sử hoàn tất</p>
                  </button>
                </div>
              </div>
            )}

            {isAdmin && activeTab === 'employees' && <EmployeeManager />}
            {(activeTab === 'tasks' || activeTab === 'history') && <TaskManager user={user} mode={activeTab === 'history' ? 'history' : 'active'} />}
          </div>
        </main>
      </div>

      <footer className="bg-white border-t border-gray-100 py-6 px-12 text-center flex flex-col lg:flex-row justify-between items-center text-gray-400 text-[9px] font-black uppercase tracking-[0.4em]">
        <p>&copy; 2024 Ngói Xanh AZ Group. Verified System.</p>
        <div className="flex space-x-10">
          <span className="text-green-600">Stable Connection</span>
          <span>Security Protocol 1.0</span>
        </div>
      </footer>
    </div>
  );
};
