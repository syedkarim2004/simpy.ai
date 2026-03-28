import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Hammer } from 'lucide-react';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&display=swap');
  .login-card { font-family: 'Sora', sans-serif; }
`;

export default function AdminLogin() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('simpy_authed', 'true');
    localStorage.setItem('simpy_token', 'mock_token');
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex items-center justify-center p-6 login-card">
      <style>{STYLES}</style>
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-slate-800/5 rounded-full blur-2xl" />
        
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-slate-800/20">
            <Lock className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-3xl font-black text-navy mb-2 tracking-tight">Admin Portal</h2>
          <p className="text-slate-500 font-medium mb-8">System Administration</p>
          
          <form className="w-full space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin ID</label>
              <input 
                type="text" 
                required
                placeholder="admin-01"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all font-medium"
              />
            </div>
            
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Master Password</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all font-medium"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-slate-800/30 flex items-center justify-center gap-2 mt-4"
            >
              Access System <Hammer className="w-4 h-4" />
            </button>
          </form>
          
          <button 
            onClick={() => navigate('/')}
            className="mt-8 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-navy transition-colors"
          >
            ← Back to Portal Select
          </button>
        </div>
      </div>
    </div>
  );
}
