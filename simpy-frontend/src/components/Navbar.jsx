import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    fetch('http://localhost:8000/')
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('offline'));
  }, []);

  const getBreadcrumb = () => {
    const isPreauth = location.pathname.includes('/preauth');
    const base = isPreauth ? 'WORKSPACE' : 'DASHBOARD';
    const sub = isPreauth ? 'PRE-AUTH AUDIT SYSTEM' : 'MEDICAL WORKSPACE';
    return { base, sub };
  };

  const { base, sub } = getBreadcrumb();

  return (
    <header className="h-[52px] w-full bg-white border-b border-[var(--border)] flex items-center justify-between px-6 sticky top-0 z-[49] font-body shrink-0">
      {/* ── BREADCRUMB ── */}
      <div className="flex items-center gap-2 font-mono text-[10px] tracking-tight">
        <span className="text-[var(--muted)] font-bold">{base}</span>
        <ChevronRight size={12} className="text-[var(--mid)]" />
        <span className="text-[var(--accent)] font-bold">{sub}</span>
      </div>

      {/* ── SEARCH & TOOLS ── */}
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--mid)] group-focus-within:text-[var(--accent)] transition-colors" />
          <input 
            type="text" 
            placeholder="Search Cases, IDs..."
            className="w-[280px] h-[32px] bg-[var(--surface-alt)] border border-[var(--border)] rounded-[4px] pl-9 pr-4 text-[13px] focus:outline-none focus:border-[var(--accent)] transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* API Status */}
          <div className={`flex items-center gap-2 px-3 py-1 border rounded-[4px] ${
            apiStatus === 'connected' 
              ? 'bg-[var(--accent-light)] border-[var(--accent-border)] text-[var(--accent)]' 
              : 'bg-[var(--red-light)] border-red-200 text-[var(--red)]'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${apiStatus === 'connected' ? 'bg-[var(--accent)] animate-pulse-green' : 'bg-[var(--red)]'}`} />
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider leading-none">
              API {apiStatus === 'connected' ? 'CONNECTED' : 'OFFLINE'}
            </span>
          </div>

          <button className="w-8 h-8 border border-[var(--border)] rounded-[4px] flex items-center justify-center text-[var(--muted)] hover:bg-[var(--surface-alt)] transition-colors relative">
            <Bell size={16} />
            <div className="absolute top-[6px] right-[6px] w-[5px] h-[5px] bg-[var(--red)] rounded-full border border-white" />
          </button>
        </div>
      </div>
    </header>
  );
}
