import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Activity, Lock, ArrowRight } from 'lucide-react';

const PortalCard = ({ title, description, icon: Icon, color, onClick }) => (
  <button 
    onClick={onClick}
    className="group relative bg-white border border-slate-200 rounded-3xl p-8 text-left transition-all duration-300 hover:shadow-2xl hover:border-teal/30 hover:-translate-y-2 overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-full blur-3xl`} />
    
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg ${color}`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    
    <h3 className="text-2xl font-black text-navy mb-3 tracking-tight group-hover:text-teal transition-colors">
      {title}
    </h3>
    
    <p className="text-slate-500 font-medium leading-relaxed mb-8">
      {description}
    </p>
    
    <div className="flex items-center gap-2 text-teal font-bold text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x--4 group-hover:translate-x-0">
      Enter Portal <ArrowRight className="w-4 h-4" />
    </div>
  </button>
);

export default function PortalSelect() {
  const navigate = useNavigate();

  const portals = [
    {
      title: "Pre-Auth Portal",
      description: "Manage prior authorizations and clinical necessity documentation with AI assistance.",
      icon: Shield,
      color: "bg-blue-600",
      path: "/preauth/login"
    },
    {
      title: "Medical Portal",
      description: "Clinical data normalization, FHIR reconciliation, and RCM audit engine.",
      icon: Activity,
      color: "bg-teal",
      path: "/medical/login"
    },
    {
      title: "Admin Portal",
      description: "System configuration, user management, and enterprise-wide reporting.",
      icon: Lock,
      color: "bg-slate-800",
      path: "/admin/login"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F7F9F8] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full fhir-grid-bg opacity-40 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full mb-6 shadow-sm">
            <div className="w-2 h-2 bg-teal rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enterprise Intelligence</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black text-navy mb-6 tracking-tighter">
            Select Your <span className="text-teal">Intelligence</span> Hub
          </h1>
          
          <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">
            Welcome back. Please choose the portal you need to access today. Each workspace is secured and context-optimized.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {portals.map((portal) => (
            <PortalCard 
              key={portal.title}
              {...portal}
              onClick={() => navigate(portal.path)}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-400 text-sm font-bold flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" /> HIPAA Compliance Enabled & SOC2 Type II Certified
          </p>
        </div>
      </div>
    </div>
  );
}
