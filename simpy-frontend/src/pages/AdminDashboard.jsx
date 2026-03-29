import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hammer, LogOut, ShieldAlert, Cpu, Database, Zap } from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('simpy_authed');
    localStorage.removeItem('simpy_token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0A0C0F] flex flex-col items-center justify-center p-8 text-center font-body animate-in fade-in duration-700">
      
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00E5C3 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      
      <div className="relative z-10 max-w-2xl w-full">
        <div className="flex justify-center mb-12">
          <div className="w-24 h-24 bg-[#111318] border border-[#1E2128] flex items-center justify-center relative group">
            <ShieldAlert className="w-12 h-12 text-[#FF4D4D] group-hover:scale-110 transition-transform" strokeWidth={2.5} />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#FF4D4D] flex items-center justify-center">
               <Zap size={12} className="text-[#0A0C0F] fill-[#0A0C0F]" />
            </div>
          </div>
        </div>
        
        <div className="space-y-6 mb-16">
          <div className="flex items-center justify-center gap-3">
             <div className="w-1.5 h-6 bg-[#FF4D4D]" />
             <h4 className="font-mono text-[10px] text-[#FF4D4D] font-black uppercase tracking-[0.4em]">ADMIN_STATUS: PROVISIONING</h4>
          </div>
          <h1 className="text-[64px] font-display font-black text-white italic leading-none uppercase tracking-tighter">
            Admin Portal
          </h1>
          <p className="font-mono text-[12px] text-[#5A6070] uppercase leading-relaxed max-w-md mx-auto tracking-widest border-t border-b border-[#1E2128] py-8">
            DASHBOARD_UNDER_CONSTRUCTION. <br/> 
            SYSTEM ADMINISTRATION AND ENTERPRISE CONTROLS ARE BEING PROVISIONED FOR AUTHENTICATED PROTOCOLS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
           <div className="bg-[#111318] border border-[#1E2128] p-8 text-left group hover:border-[#FF4D4D] transition-all">
              <Cpu className="text-[#5A6070] group-hover:text-[#FF4D4D] mb-4 transition-colors" size={24} />
              <h5 className="text-white font-display font-black text-[14px] uppercase tracking-widest mb-2">SYSTEM_MODULES</h5>
              <p className="font-mono text-[9px] text-[#5A6070] uppercase">HYPER_VISOR ACTIVE</p>
           </div>
           <div className="bg-[#111318] border border-[#1E2128] p-8 text-left group hover:border-[#FF4D4D] transition-all">
              <Database className="text-[#5A6070] group-hover:text-[#FF4D4D] mb-4 transition-colors" size={24} />
              <h5 className="text-white font-display font-black text-[14px] uppercase tracking-widest mb-2">DB_CONNECT</h5>
              <p className="font-mono text-[9px] text-[#5A6070] uppercase">V4_SHARDING PENDING</p>
           </div>
        </div>

        <button 
          onClick={handleLogout}
          className="h-[64px] px-12 bg-[#111318] border border-[#1E2128] hover:border-[#FF4D4D] text-[#5A6070] hover:text-[#FF4D4D] font-mono text-[12px] font-black uppercase tracking-[0.3em] flex items-center gap-6 mx-auto transition-all transition-all duration-300"
        >
          <LogOut className="w-5 h-5" />
          TERMINATE_SESSION
        </button>
      </div>

    </div>
  );
}
