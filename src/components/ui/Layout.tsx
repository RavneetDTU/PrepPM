import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Mic2, 
  Database, 
  Briefcase, 
  Users2, 
  TrendingUp, 
  Library, 
  Settings,
  LogOut,
  User as UserIcon,
  ChevronRight
} from 'lucide-react';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Mic2, label: 'Mock Interview', path: '/mock' },
  { icon: Database, label: 'Question Bank', path: '/questions' },
  { icon: Briefcase, label: 'Company Intel', path: '/intel' },
  { icon: Users2, label: 'Peer Mocks', path: '/peer' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  return (
    <aside className="w-[240px] bg-dark-bg border-r border-[#33334A] flex flex-col h-screen fixed left-0 top-0 z-50 py-6">
      <div className="px-6 mb-8">
        <h1 className="text-xl font-bold text-white tracking-tight">
          Prep <span className="text-primary font-extrabold">PM</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-6 py-3 transition-colors text-sm font-medium border-left-3 border-transparent",
              isActive 
                ? "bg-primary/10 text-white border-primary" 
                : "text-[#A0A0B0] hover:text-white"
            )}
          >
            <item.icon size={18} className="opacity-70" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 mt-auto pt-6 border-t border-[#33334A]">
        <NavLink 
          to="/profile"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-card group transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
            {profile?.fullName?.split(' ').map(n => n[0]).join('') || 'AJ'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-white truncate">{profile?.fullName || 'Alex Johnson'}</p>
            <p className="text-[11px] text-[#A0A0B0] truncate">{profile?.currentRole || 'Senior PM @ Techly'}</p>
          </div>
          <ChevronRight size={14} className="text-[#A0A0B0] group-hover:text-white" />
        </NavLink>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-950/20 rounded-lg transition-colors mt-2"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <main className="pl-[240px] min-h-screen">
        <div className="max-w-7xl mx-auto p-8 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
