import React from 'react';
import { ArrowRight, Grid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PlaceholderPage({ title }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col font-body">
      {/* Shared Navbar */}
      <nav className="h-[60px] bg-white border-b border-[var(--border)] flex items-center justify-between px-8">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-7 h-7 bg-[var(--accent)] rounded-[6px] flex items-center justify-center">
            <Grid size={16} className="text-white" />
          </div>
          <span className="font-heading text-xl text-[var(--text-dark)] font-bold">Simpy.ai</span>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest border border-[var(--accent)] px-4 py-2 rounded-[6px] hover:bg-[var(--accent)] hover:text-white transition-all"
        >
          Return Home
        </button>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
           <span className="inline-block px-3 py-1 bg-[var(--accent-light)] text-[var(--accent)] text-[10px] font-black uppercase tracking-widest rounded-full">Coming Soon</span>
           <h1 className="text-[48px] font-heading text-[var(--text-dark)] leading-tight italic">{title}</h1>
           <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">
             This portal is currently under active development as part of the Mediversal Healthcare ledger integration protocol.
           </p>
           <div className="pt-6">
              <button 
                onClick={() => navigate('/')} 
                className="btn-dark inline-flex items-center gap-2"
              >
                Back to Landing <ArrowRight size={18} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
