import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hammer, LogOut } from 'lucide-react';

export default function PreauthDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('simpy_authed');
    localStorage.removeItem('simpy_token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-8 animate-bounce">
        <Hammer className="w-10 h-10 text-blue-600" />
      </div>
      
      <h1 className="text-4xl font-black text-navy mb-4 tracking-tight">Pre-Auth Portal</h1>
      <p className="text-slate-500 font-medium text-lg mb-12 max-w-md">
        Dashboard under construction. We are building the next generation of prior authorization intelligence.
      </p>

      <button 
        onClick={handleLogout}
        className="flex items-center gap-2 px-8 py-4 bg-white border border-slate-200 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all shadow-sm group"
      >
        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Sign Out and Return
      </button>
    </div>
  );
}
