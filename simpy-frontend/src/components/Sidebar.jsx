import { NavLink } from 'react-router-dom';
import { Upload, Activity, FileText, Clock, HeartPulse } from 'lucide-react';

export default function Sidebar() {
  const navLinks = [
    { name: 'Upload Document', path: '/app', icon: Upload },
    { name: 'Processing', path: '/app/processing', icon: Activity },
    { name: 'Report', path: '/app/report', icon: FileText },
    { name: 'History', path: '/app/history', icon: Clock },
  ];

  return (
    <div className="w-[260px] h-full flex-shrink-0 bg-navy border-r border-slate-800 flex flex-col z-50 transition-all">
      {/* 1. Logo at top */}
      <div className="p-6 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-6 h-6 text-teal" />
          <span className="text-white font-black text-xl tracking-wide">Simpy.ai</span>
        </div>
        <div className="text-slate-400 text-xs pl-8 mt-1 font-bold tracking-widest uppercase">
          Workspace
        </div>
      </div>

      {/* 2. Navigation links */}
      <nav className="flex-1 px-4 mt-6 space-y-2">
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              end={link.path === '/app'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-sm font-bold ${
                  isActive
                    ? 'bg-teal text-white shadow-[0_0_15px_rgba(13,148,136,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {link.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-6 pb-6">
        <div className="w-full h-px bg-slate-800 mb-6"></div>
        {/* 4. Bottom section */}
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Powered By</p>
        <p className="text-white font-medium text-sm mt-1.5 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> MedGemma AI</p>
        <p className="text-slate-600 text-[10px] mt-2 font-mono">v2.0.0-beta</p>
      </div>
    </div>
  );
}
