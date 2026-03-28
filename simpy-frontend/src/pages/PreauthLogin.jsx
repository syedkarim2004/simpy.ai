import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#1E293B] border border-slate-800 rounded-3xl p-10 shadow-2xl relative overflow-hidden group">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-blue-600/20 transition-colors duration-700" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/5 rounded-full blur-3xl -ml-24 -mb-24" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform duration-500">
            <Shield className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-3xl font-black text-white mb-2 tracking-tighter italic uppercase">Pre-Auth Portal</h2>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-10">Intelligent Audit Entry</p>
          
          <form className="w-full space-y-5" onSubmit={handleLogin}>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Operational ID</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="clinician@simpy.ai"
                className="w-full px-5 py-4 bg-[#0F172A] border border-slate-800 rounded-2xl text-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition-all font-medium placeholder-slate-700"
              />
            </div>
            
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Key</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-[#0F172A] border border-slate-800 rounded-2xl text-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/30 transition-all font-medium placeholder-slate-700"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 mt-6 active:scale-95"
            >
              Sign In to System <Lock className="w-4 h-4" />
            </button>
          </form>
          
          <button 
            onClick={() => navigate('/')}
            className="mt-10 flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors group/back"
          >
            <ArrowLeft className="w-4 h-4 group-hover/back:-translate-x-1 transition-transform" /> Back to Selection
          </button>
        </div>
      </div>
    </div>
  );
}
