import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Lock, ArrowLeft, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (password === 'admin123') {
      localStorage.setItem('simpy_authed', 'true');
      localStorage.setItem('simpy_token', 'mock_admin_token');
      localStorage.setItem('simpy_user', JSON.stringify({ email, role: 'admin' }));
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials. Access restricted to system administrators.');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.05)_0%,rgba(2,6,23,1)_100%)]" />
      <div 
        className="absolute inset-0 opacity-[0.02]" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px' 
        }} 
      />

      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-10 shadow-2xl overflow-hidden relative">
          {/* Subtle Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />
          
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-600/20 transition-transform hover:scale-110 duration-500">
              <LayoutDashboard className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Admin Dashboard</h2>
            <p className="text-slate-400 font-medium">System Administration Access</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Admin Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@simpy.ai"
                className="w-full px-5 py-4 bg-[#020617] border border-slate-800 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-medium text-white placeholder-slate-600"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Master Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-[#020617] border border-slate-800 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-medium text-white placeholder-slate-600"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-violet-600/25 flex items-center justify-center gap-2 mt-4 group"
            >
              Sign In <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </form>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full mt-8 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Portal Select
          </button>
        </div>

        <p className="mt-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
          Restricted Access — Admin Credentials Required
        </p>
      </div>
    </div>
  );
}
