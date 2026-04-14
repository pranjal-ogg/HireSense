import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, LayoutDashboard, Upload, Target, LogOut, Sparkles, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/upload', icon: Upload, label: 'Analyze Resume' },
  { to: '/jobs', icon: Target, label: 'Job Matches' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-72 glass border-r border-white/5 hidden lg:flex flex-col p-8 z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-9 h-9 bg-accent-violet rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(124,58,237,0.4)]">
          <BarChart3 size={18} />
        </div>
        <span className="font-display text-xl font-bold tracking-tight">HireSense</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                isActive
                  ? 'bg-accent-violet text-white shadow-[0_0_18px_rgba(124,58,237,0.35)]'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="mt-auto space-y-4">
        <div className="glass rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent-cyan/20 text-accent-cyan flex items-center justify-center flex-shrink-0">
            <User size={18} />
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-sm truncate">{user?.name || 'User'}</p>
            <p className="text-white/40 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
