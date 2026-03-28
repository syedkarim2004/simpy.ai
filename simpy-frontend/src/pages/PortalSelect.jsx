import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, LayoutDashboard, ArrowRight } from 'lucide-react';

const PortalCard = ({ title, description, icon: Icon, color, shadowColor, onClick }) => (
  <button 
    onClick={onClick}
    className="group relative bg-[#0F172A] border border-slate-800 rounded-3xl p-8 text-left transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(0,0,0,0.3)] hover:border-slate-700 hover:-translate-y-2 overflow-hidden flex flex-col h-full"
  >
    {/* Glow Effect */}
    <div className={`absolute -inset-px bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-sm`} />
    
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-2xl ${color} ${shadowColor}`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    
    <h3 className="text-2xl font-black text-white mb-3 tracking-tight group-hover:text-white/90 transition-colors">
      {title}
    </h3>
    
    <p className="text-slate-400 font-medium leading-relaxed mb-8 flex-1">
      {description}
    </p>
    
    <div className="flex items-center gap-2 text-white font-bold text-sm uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-all duration-300">
      Access Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </div>
  </button>
);

export default function PortalSelect() {
  const navigate = useNavigate();

  const portals = [
    {
      title: "Pre-Auth Audit System",
      description: "Upload & audit pre-authorization forms with AI-powered clinical validation.",
      icon: Shield,
      color: "bg-blue-600",
      shadowColor: "shadow-blue-900/40",
      path: "/preauth/login"
    },
    {
      title: "Medical Team Portal",
      description: "Manage patient records, billing discrepancies, and FHIR-compliant data streams.",
      icon: Activity,
      color: "bg-emerald-500",
      shadowColor: "shadow-emerald-900/40",
      path: "/medical/login"
    },
    {
      title: "Admin Dashboard",
      description: "System oversight, user permissions, and comprehensive enterprise audit logs.",
      icon: LayoutDashboard,
      color: "bg-purple-600",
      shadowColor: "shadow-purple-900/40",
      path: "/admin/login"
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,1)_0%,rgba(2,6,23,1)_100%)]" />
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px' 
        }} 
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Header Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <div className="w-5 h-5 border-4 border-white rounded-full border-t-transparent animate-spin-slow" />
            </div>
            <span className="text-3xl font-black tracking-tighter text-white">Simpy.ai</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Enterprise Intelligence Hub
          </h1>
          <p className="text-slate-400 text-lg font-medium tracking-wide">
            Intelligent Healthcare Billing Automation
          </p>
        </div>

        {/* Portal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {portals.map((portal, i) => (
            <div key={portal.title} className={`animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-${i * 200}`}>
              <PortalCard 
                {...portal}
                onClick={() => navigate(portal.path)}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-20 text-center animate-in fade-in duration-1000 delay-700">
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-slate-800" />
            Powered by Groq AI & FHIR R4
            <span className="w-8 h-px bg-slate-800" />
          </p>
          <div className="mt-6 flex gap-6 grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all duration-500 transform scale-90">
             {/* Subtle indicator of HIPAA/Encrypted status */}
             <span className="text-[10px] font-black border border-slate-700 px-2 py-1 rounded tracking-widest text-slate-500">HIPAA COMPLIANT</span>
             <span className="text-[10px] font-black border border-slate-700 px-2 py-1 rounded tracking-widest text-slate-500">SOC2 CERTIFIED</span>
             <span className="text-[10px] font-black border border-slate-700 px-2 py-1 rounded tracking-widest text-slate-500">E2E ENCRYPTED</span>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}} />
    </div>
  );
}
