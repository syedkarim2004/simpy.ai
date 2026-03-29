import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  Plus, LayoutGrid, Clock, CheckCircle2, XCircle, 
  Upload, Scissors, FileText, Database, ShieldAlert, 
  Settings, LogOut, Activity, BarChart3, Layers, Menu
} from 'lucide-react';

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isPreauth = location.pathname.includes('/preauth');

  const user = JSON.parse(localStorage.getItem('simpy_user') || '{}');
  const userInitials = (user.name || 'DE').substring(0, 2).toUpperCase();

  const navItems = isPreauth ? [
    { name: 'Dashboard', path: '/app/preauth?tab=new-case', icon: LayoutGrid },
    { name: 'All Cases', path: '/app/preauth?tab=all-cases', icon: Database },
    { name: 'Pending Review', path: '/app/preauth?tab=pending', icon: Clock },
    { name: 'Compliance Tech', path: '/app/preauth?tab=compliance', icon: Activity },
  ] : [
    { name: 'Upload Document', path: '/app', icon: Upload },
    { name: 'Processing', path: '/app/processing', icon: Activity },
    { name: 'Report', path: '/app/report', icon: FileText },
    { name: 'History', path: '/app/history', icon: Database },
    { name: 'Multi-Patient', path: '/app/multi-patient', icon: Layers },
    { name: 'PDF Auto-Extract', path: '/app/pdf-upload', icon: Scissors },
    { name: 'Discharge Audit', path: '/app/discharge', icon: ShieldAlert },
    { name: 'Final Settlement', path: '/app/settlement', icon: BarChart3 },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className={`${isOpen ? 'w-[240px]' : 'w-[80px]'} h-screen bg-white border-r border-[var(--border)] flex flex-col fixed left-0 top-0 z-50 transition-all duration-300 overflow-hidden`}>
      {/* ── LOGO AREA ── */}
      <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 bg-[var(--accent)] rounded-[6px] flex items-center justify-center shrink-0">
            <Activity size={18} className="text-white" />
          </div>
          {isOpen && (
            <div className="animate-in fade-in duration-500">
              <h1 className="font-serif text-[16px] text-[var(--text)] leading-none font-bold">Simpy.ai</h1>
              <p className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-wider mt-1">
                {isPreauth ? 'PRE-AUTH AUDIT' : 'WORKSPACE'}
              </p>
            </div>
          )}
        </div>
        <button 
          onClick={onToggle}
          className="p-1.5 hover:bg-[var(--surface-alt)] rounded-md text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* ── NEW CASE BUTTON ── */}
      <div className="px-4 py-4">
        <button 
          onClick={() => navigate('/app/preauth?tab=new-case')}
          className={`flex items-center justify-center gap-2 bg-[var(--accent)] text-white p-[10px] rounded-[6px] font-body text-[13px] font-semibold hover:opacity-90 transition-all ${isOpen ? 'w-full' : 'w-10 mx-auto'}`}
        >
          <Plus size={16} /> 
          {isOpen && <span className="animate-in fade-in duration-300">New Case</span>}
        </button>
      </div>

      {/* ── NAVIGATION ── */}
      <nav className="flex-1 overflow-y-auto pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-[18px] py-[11px] text-[13px] font-medium transition-all border-l-2 ${
                  isActive 
                    ? 'text-[var(--text)] bg-[var(--accent-light)] border-[var(--accent)] font-semibold' 
                    : 'text-[var(--muted)] border-transparent hover:text-[var(--text)] hover:bg-[var(--surface-alt)]'
                } ${!isOpen ? 'justify-center px-0' : ''}`
              }
              title={!isOpen ? item.name : ''}
            >
              <Icon size={18} className={!isOpen ? 'shrink-0' : ''} />
              {isOpen && <span className="animate-in fade-in slide-in-from-left-2 duration-300">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* ── BOTTOM AREA ── */}
      <div className="p-4 border-t border-[var(--border)] mt-auto">
        {!isPreauth && isOpen && (
          <div className="mb-6 animate-in fade-in duration-500">
            <p className="font-mono text-[8px] text-[var(--mid)] uppercase tracking-widest mb-1">POWERED BY</p>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium flex items-center gap-1.5">
                <div className="w-1 h-1 bg-[var(--accent)] rounded-full animate-pulse" />
                MedGemma AI
              </span>
              <span className="font-mono text-[9px] text-[var(--muted)]">v2.0.0</span>
            </div>
          </div>
        )}

        <div className={`flex items-center gap-3 p-2 mb-4 bg-[var(--surface-alt)] rounded-[6px] transition-all ${!isOpen ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-[var(--accent)] rounded-full flex items-center justify-center text-white font-mono text-[11px] font-bold shrink-0">
            {userInitials}
          </div>
          {isOpen && (
            <div className="overflow-hidden animate-in fade-in duration-500">
              <p className="text-[12px] font-semibold text-[var(--text)] truncate">{user.name || 'Demo Physician'}</p>
              <p className="font-mono text-[9px] text-[var(--muted)] truncate">cli.uid.0932</p>
            </div>
          )}
        </div>

        <button 
          onClick={handleLogout}
          className={`flex items-center justify-center gap-2 py-2.5 border border-[var(--border)] rounded-[4px] font-mono text-[9px] font-bold text-[var(--text)] uppercase hover:bg-[var(--surface-alt)] transition-all ${isOpen ? 'w-full' : 'w-10 mx-auto'}`}
          title={!isOpen ? 'Logout System' : ''}
        >
          <LogOut size={14} /> 
          {isOpen && <span className="animate-in fade-in duration-300 text-nowrap">LOGOUT SYSTEM</span>}
        </button>
      </div>
    </div>
  );
}
