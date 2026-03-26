import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';

/* ── dropdown animation keyframe ────────────────────────────── */
const STYLES = `
  @keyframes dropIn {
    from { opacity: 0; transform: translateY(-6px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .drop-menu { animation: dropIn 0.15s cubic-bezier(.22,1,.36,1) both; }
  .menu-item:hover { background: #f8fafc; }
  .menu-item-danger:hover { background: #fef2f2; color: #dc2626 !important; }
`;

/* ── tiny icon helpers ───────────────────────────────────────── */
const Icon = ({ d, color = 'currentColor', size = 14 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const ICONS = {
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  security: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
  logout: 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9',
  monitor: 'M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 15V5.25m19.5 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 7.409A2.25 2.25 0 012.25 5.493V5.25',
  dot: 'M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0-2 0',
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [apiStatus, setApiStatus] = useState('checking');
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);
  
  const user = JSON.parse(localStorage.getItem('simpy_user') || '{}');
  const userName = user.name || 'Clinician';
  const userInitials = userName.substring(0, 2).toUpperCase();
  const userEmail = user.email || 'user@simpy.ai';

  /* API health check */
  useEffect(() => {
    fetch('http://localhost:8000/')
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('offline'));
  }, []);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/app':
      case '/app/': return 'Dashboard › Upload';
      case '/app/processing': return 'Dashboard › Processing Pipeline';
      case '/app/report': return 'Dashboard › Reconciliation Report';
      case '/app/history': return 'Dashboard › Document History';
      case '/app/multi-patient': return 'Dashboard › Multi-Patient Pipeline';
      default: return 'Dashboard Overview';
    }
  };

  return (
    <>
      <style>{STYLES}</style>
      <header className="h-[70px] w-full bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-8 shrink-0 z-40 relative">
        
        {/* Page title */}
        <h2 className="text-navy font-bold text-lg tracking-tight">{getPageTitle()}</h2>

        {/* Right side */}
        <div className="flex items-center gap-5">

          {/* API status badge */}
          <div className="hidden md:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">
            {apiStatus === 'connected' ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">API Connected</span>
              </>
            ) : apiStatus === 'offline' ? (
              <>
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-xs text-red-600 font-bold uppercase tracking-wider">API Offline</span>
              </>
            ) : (
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Checking...</span>
            )}
          </div>

          {/* Name chip */}
          <div className="bg-teal/10 text-teal px-3 py-1.5 rounded-md text-xs font-black uppercase tracking-widest border border-teal/20">
            {userName}
          </div>

          {/* Avatar + Dropdown */}
          <div ref={dropRef} style={{ position: 'relative' }}>
            {/* Avatar button */}
            <button
              onClick={() => setOpen(v => !v)}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: '#0A1628', color: '#fff',
                fontSize: 12, fontWeight: 800,
                border: open ? '2px solid #0D9488' : '2px solid transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'border-color 0.15s',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                fontFamily: 'Inter, sans-serif',
              }}>
              {userInitials}
            </button>

            {/* Dropdown */}
            {open && (
              <div className="drop-menu" style={{
                position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                width: 280, zIndex: 999,
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                boxShadow: '0 8px 30px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
                overflow: 'hidden',
              }}>

                {/* ① User info */}
                <div style={{ padding: '16px 18px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: '#0A1628', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 800, flexShrink: 0,
                    }}>{userInitials}</div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{userName}</p>
                      <p style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{userEmail}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontSize: 10, fontWeight: 600, color: '#22c55e', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Signed in</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#f1f5f9', margin: '0 0' }} />

                {/* ② Session info */}
                <div style={{ padding: '12px 18px', background: '#fafafa' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                    Active Session
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 0' }}>
                    {[
                      { l: 'Device', v: 'MacBook Pro' },
                      { l: 'Browser', v: 'Chrome' },
                      { l: 'Location', v: 'India' },
                      { l: 'Status', v: 'Active now', green: true },
                    ].map(({ l, v, green }) => (
                      <div key={l}>
                        <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginBottom: 1 }}>{l}</p>
                        <p style={{ fontSize: 12, fontWeight: 600, color: green ? '#16a34a' : '#334155' }}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#f1f5f9' }} />

                {/* ③ Actions */}
                <div style={{ padding: '6px 8px' }}>
                  {[
                    { icon: ICONS.settings, label: 'Account Settings' },
                    { icon: ICONS.security, label: 'Security' },
                  ].map(({ icon, label }) => (
                    <button key={label} className="menu-item" style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 10px', borderRadius: 8, border: 'none',
                      background: 'transparent', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600, color: '#374151',
                      fontFamily: 'Inter, sans-serif', textAlign: 'left',
                      transition: 'background 0.1s',
                    }}>
                      <Icon d={icon} color="#6b7280" size={15} />
                      {label}
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: '#f1f5f9', margin: '0 0' }} />

                {/* Logout */}
                <div style={{ padding: '6px 8px 8px' }}>
                  <button
                    className="menu-item-danger"
                    onClick={() => { 
                      setOpen(false); 
                      googleLogout();
                      localStorage.clear();
                      navigate('/login'); 
                    }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 10px', borderRadius: 8, border: 'none',
                      background: 'transparent', cursor: 'pointer',
                      fontSize: 13, fontWeight: 700, color: '#ef4444',
                      fontFamily: 'Inter, sans-serif', textAlign: 'left',
                      transition: 'background 0.1s, color 0.1s',
                    }}>
                    <Icon d={ICONS.logout} color="#ef4444" size={15} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
