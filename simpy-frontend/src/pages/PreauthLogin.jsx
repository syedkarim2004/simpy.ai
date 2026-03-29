import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PreauthLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('clinician@simpy.ai');
  const [password, setPassword] = useState('demo-bypass');

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('simpy_authed', 'true');
    localStorage.setItem('simpy_token', 'mock_token');
    localStorage.setItem('simpy_user', JSON.stringify({ name: 'Demo Clinician', email, role: 'clinician' }));
    localStorage.setItem('simpy_portal', 'preauth');
    navigate('/preauth/dashboard');
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6 font-body">
      <div className="w-full max-w-[440px] bg-white border border-[var(--border)] p-10 rounded-[8px] shadow-sm relative overflow-hidden">
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-[48px] h-[48px] bg-[var(--accent)] rounded-[10px] flex items-center justify-center mb-6">
            <Shield size={24} className="text-white" />
          </div>
          <h2 className="font-serif text-[26px] text-[var(--text)] leading-tight mb-2 tracking-[-0.5px]">
            PRE-AUTH PORTAL
          </h2>
          <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.15em]">
            INTELLIGENT AUDIT ENTRY
          </p>
        </div>

        <div className="w-full h-px bg-[var(--border)] mb-10" />
        
        <form className="w-full space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-[0.12em] block">
              OPERATIONAL ID
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="clinician@simpy.ai"
              className="w-full bg-[var(--surface-alt)] border border-[var(--border)] rounded-[4px] px-[14px] py-[11px] text-[var(--text)] font-body text-[14px] focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--mid)]"
            />
          </div>
          
          <div className="space-y-2">
            <label className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-[0.12em] block">
              ACCESS KEY
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[var(--surface-alt)] border border-[var(--border)] rounded-[4px] px-[14px] py-[11px] text-[var(--text)] font-body text-[14px] focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--mid)]"
            />
          </div>

          <button 
            type="submit"
            className="w-full h-[46px] bg-[var(--accent)] hover:opacity-90 text-white font-mono font-bold text-[11px] uppercase tracking-wider rounded-[4px] transition-all mt-4"
          >
            SIGN IN TO SYSTEM
          </button>
        </form>
        
        <button 
          onClick={() => navigate('/')}
          className="w-full mt-10 font-mono text-[9px] text-[var(--muted)] uppercase tracking-widest hover:text-[var(--text)] transition-colors text-center flex items-center justify-center gap-2"
        >
          <ArrowLeft size={12} /> BACK TO SELECTION
        </button>
      </div>
    </div>
  );
}
