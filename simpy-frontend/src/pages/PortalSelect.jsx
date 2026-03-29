import React from 'react';
import { useNavigate } from 'react-router-dom';

const PortalCard = ({ id, tag, title, description, onClick }) => (
  <button 
    onClick={onClick}
    className="group relative bg-[#111318] border border-[#1E2128] p-8 text-left transition-all duration-150 hover:border-[#00E5C3] hover:bg-[#0D1A18] flex flex-col h-full rounded-[4px]"
  >
    <span className="font-mono text-[10px] text-[#5A6070] mb-6 uppercase tracking-widest">{tag}</span>
    
    <h3 className="font-display font-bold text-[22px] text-white mb-3">
      {title}
    </h3>
    
    <p className="font-body text-[14px] text-[#5A6070] leading-snug mb-8 flex-1">
      {description}
    </p>
    
    <div className="w-full h-px bg-[#1E2128] mb-6" />
    
    <div className="font-mono text-[11px] text-[#00E5C3] font-bold uppercase tracking-[0.15em] flex items-center gap-2 group-hover:translate-x-1 transition-transform">
      ACCESS PORTAL <span className="text-lg">→</span>
    </div>
  </button>
);

export default function PortalSelect() {
  const navigate = useNavigate();

  const portals = [
    {
      tag: "01 / PRE-AUTH",
      title: "Pre-Auth Audit System",
      description: "Upload & audit pre-authorization forms with AI-powered clinical validation against 32 billing rules.",
      path: "/preauth/login"
    },
    {
      tag: "02 / MEDICAL",
      title: "Medical Team Portal",
      description: "Manage patient records, billing discrepancies, and FHIR-compliant data streams.",
      path: "/medical/login"
    },
    {
      tag: "03 / ADMIN",
      title: "Admin Dashboard",
      description: "System oversight, user permissions, and comprehensive enterprise audit logs.",
      path: "/admin/login"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0C0F] text-[#E8EAF0] flex flex-col font-body">
      {/* Header Strip */}
      <header className="h-[48px] border-b border-[#1E2128] flex items-center justify-between px-8 bg-[#0A0C0F] z-20">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-[#00E5C3] text-[14px]">SIMPY.AI</span>
          <div className="w-2 h-2 rounded-full bg-[#00E5C3] animate-pulse shadow-[0_0_8px_#00E5C3]" />
        </div>
        <div className="font-mono text-[10px] text-[#5A6070] tracking-widest flex items-center gap-3">
          <span>HIPAA</span>
          <span className="text-[#1E2128]">•</span>
          <span>SOC2</span>
          <span className="text-[#1E2128]">•</span>
          <span>FHIR R4</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 relative overflow-hidden">
        {/* Hero Section */}
        <section className="pt-[18vh] text-center w-full max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-700">
          <span className="font-mono text-[11px] text-[#5A6070] uppercase tracking-[0.2em] mb-4 block">
            ENTERPRISE HEALTHCARE INTELLIGENCE
          </span>
          <h1 className="font-display font-extrabold text-[80px] text-white leading-none mb-10">
            Simpy.ai
          </h1>
          <p className="font-body text-[18px] text-[#5A6070] mb-8">
            Billing automation. Pre-auth audit. Clinical intelligence.
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-20">
            {[
              "GROQ AI",
              "FHIR R4",
              "MedGemma V3"
            ].map(item => (
              <div key={item} className="flex items-center gap-2 px-3 py-1 border border-[#00E5C3] bg-[#00E5C3]/5 rounded-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5C3]" />
                <span className="font-mono text-[10px] text-[#00E5C3] font-bold tracking-wider">{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Portal Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-[1100px] mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {portals.map((portal) => (
            <PortalCard 
              key={portal.tag}
              {...portal}
              onClick={() => navigate(portal.path)}
            />
          ))}
        </section>
      </main>

      {/* Footer Strip */}
      <footer className="h-[40px] border-t border-[#1E2128] flex items-center justify-center bg-[#0A0C0F] z-10">
        <span className="font-mono text-[10px] text-[#5A6070] tracking-[0.1em] uppercase">
          POWERED BY GROQ AI & FHIR R4
        </span>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-in {
          animation-fill-mode: forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInFromBottom {
          from { transform: translateY(4px); }
          to { transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.5s ease-out; }
        .slide-in-from-bottom-2 { animation: slideInFromBottom 0.5s ease-out; }
        .slide-in-from-bottom-4 { animation: slideInFromBottom 0.7s ease-out; }
      `}} />
    </div>
  );
}
