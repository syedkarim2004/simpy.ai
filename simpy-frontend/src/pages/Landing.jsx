import React, { useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { 
  ShieldCheck, 
  Activity, 
  Lock, 
  ArrowUpRight, 
  ChevronRight, 
  CheckCircle2, 
  Search, 
  FileText, 
  Zap,
  Globe,
  Database,
  BarChart3,
  Terminal,
  Server
} from 'lucide-react';

/* ── Animation Wrapper ─────────────── */
const Reveal = ({ children, delay = 0, y = 20 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
};

export default function Landing() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3] text-[#1a1815] font-body selection:bg-[#1d6b4f]/10 selection:text-[#1d6b4f]">
      
      {/* ── NAV BAR ── */}
      <nav className="fixed top-0 w-full h-16 bg-[#f7f6f3]/80 backdrop-blur-md border-b border-[#e2dfd9] z-[100] px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div className="w-8 h-8 bg-[#1d6b4f] rounded-lg flex items-center justify-center text-white shadow-lg shadow-[#1d6b4f]/10">
            <Database size={18} />
          </div>
          <span className="font-serif font-bold text-xl tracking-tight">Simpy.ai</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          {['How it works', 'Ledger', 'Audit', 'Compliance'].map((item) => (
            <button 
              key={item}
              onClick={() => scrollToSection(item.toLowerCase().replace(/ /g, '-'))}
              className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#8a857c] hover:text-[#1d6b4f] transition-colors"
            >
              {item}
            </button>
          ))}
        </div>

        <button 
          onClick={() => navigate('/medical/login')}
          className="h-9 px-5 bg-[#1a1815] text-white font-mono text-[10px] font-bold uppercase tracking-widest rounded-md hover:bg-[#2a2825] transition-all shadow-sm flex items-center gap-2"
        >
          Access Portal <ArrowUpRight size={14} />
        </button>
      </nav>

      {/* ── HERO SECTION ── */}
      <header className="pt-40 pb-20 px-6 md:px-12 max-w-[1200px] mx-auto text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e8f2ed] border border-[#c5dfd3] rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-[#1d6b4f] rounded-full animate-pulse" />
            <span className="font-mono text-[9px] font-bold text-[#1d6b4f] uppercase tracking-widest">System Live: FHIR R4 Compliant</span>
          </div>
          
          <h1 className="font-serif text-[60px] md:text-[88px] leading-[0.95] tracking-[-3px] mb-8 font-bold">
            Billing accuracy,<br />
            <span className="text-[#1d6b4f] italic">verified</span> at the source.
          </h1>
          
          <p className="text-[#8a857c] text-lg md:text-xl max-w-[640px] mx-auto mb-12 leading-relaxed font-light">
            Immutable ledger-based validation for healthcare claims. Simpy.ai automates audit intelligence from service logging to final settlement.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <button 
               onClick={() => scrollToSection('portals')}
               className="h-14 px-10 bg-[#1d6b4f] text-white font-bold uppercase tracking-widest text-[12px] rounded-lg shadow-xl shadow-[#1d6b4f]/20 hover:translate-y-[-2px] transition-all flex items-center gap-3"
             >
               Access Portals <ChevronRight size={18} />
             </button>
             <button 
               onClick={() => scrollToSection('how-it-works')}
               className="h-14 px-10 bg-white border border-[#e2dfd9] text-[#1a1815] font-bold uppercase tracking-widest text-[12px] rounded-lg hover:border-[#1d6b4f] hover:bg-[#f7f6f3] transition-all"
             >
               How it works
             </button>
          </div>
        </Reveal>
      </header>

      {/* ── PORTAL SECTION ── */}
      <section id="portals" className="py-24 px-6 md:px-12 max-w-[1200px] mx-auto border-t border-[#e2dfd9]">
        <Reveal>
          <div className="flex items-center gap-4 mb-16">
            <p className="font-mono text-[11px] font-bold text-[#8a857c] uppercase tracking-[0.3em]">Access Entrypoints</p>
            <div className="h-px flex-1 bg-[#e2dfd9]" />
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Pre-Auth Audit System",
              desc: "AI validation for insurance approvals. Ensuring clinical necessity before service delivery.",
              icon: ShieldCheck,
              path: "/preauth/login",
              delay: 0.1
            },
            {
              title: "Medical Team Portal",
              desc: "Clinical data entry and service logging. Immutable records for ward-level service tracking.",
              icon: Activity,
              path: "/medical/login",
              delay: 0.2
            },
            {
              title: "Admin Dashboard",
              desc: "Final settlement auditing and institutional reports. Complete financial-clinical reconciliation.",
              icon: Lock,
              path: "/admin/login",
              delay: 0.3
            }
          ].map((portal, i) => (
            <Reveal key={i} delay={portal.delay}>
              <button 
                onClick={() => navigate(portal.path)}
                className="w-full text-left group bg-white border border-[#e2dfd9] p-10 rounded-xl hover:border-[#1d6b4f] transition-all hover:shadow-2xl hover:shadow-[#1d6b4f]/5 cursor-pointer flex flex-col h-full min-h-[340px]"
              >
                <div className="w-12 h-12 bg-[#f7f6f3] border border-[#e2dfd9] rounded-lg flex items-center justify-center text-[#1d6b4f] group-hover:bg-[#1d6b4f] group-hover:text-white transition-all duration-500">
                  <portal.icon size={24} />
                </div>
                <h3 className="font-serif text-2xl font-bold mb-4">{portal.title}</h3>
                <p className="text-[#8a857c] text-sm leading-relaxed mb-10">
                  {portal.desc}
                </p>
                <div className="mt-auto flex items-center gap-2 group/btn">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#1d6b4f]">Access Portal</span>
                  <ArrowUpRight size={14} className="text-[#1d6b4f] group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-32 bg-[#1a1815] text-white px-6 md:px-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#1d6b4f]/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="max-w-[1200px] mx-auto relative z-10">
          <Reveal>
            <h2 className="font-serif text-[42px] md:text-[64px] leading-tight mb-20 max-w-[800px]">
              A continuous loop of <span className="text-[#1d6b4f] italic">integrity</span>.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
              { id: '01', title: 'Service Logged', desc: 'Medical staff logs service at point of care.', icon: Terminal },
              { id: '02', title: 'Ledger Created', desc: 'Service timestamped in an immutable audit trail.', icon: Server },
              { id: '03', title: 'AI Audit', desc: 'Protocol cross-referenced against policy in real-time.', icon: Zap },
              { id: '04', title: 'Settlement', desc: 'Transparent, verified claim finalized for payment.', icon: CheckCircle2 },
            ].map((step, i) => (
              <Reveal key={i} delay={i * 0.1} y={30}>
                <div className="space-y-6 group">
                  <div className="font-mono text-[#1d6b4f] font-bold text-5xl opacity-40 group-hover:opacity-100 transition-opacity">
                    {step.id}
                  </div>
                  <div className="h-px bg-white/10 w-full" />
                  <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-[#1d6b4f] mb-4">
                    <step.icon size={20} />
                  </div>
                  <h4 className="text-xl font-bold">{step.title}</h4>
                  <p className="text-[#8a857c] text-sm leading-relaxed font-light">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── LIVE LEDGER UI ── */}
      <section id="ledger" className="py-32 px-6 md:px-12 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <Reveal>
            <p className="font-mono text-[10px] font-bold text-[#1d6b4f] uppercase tracking-widest mb-4">Core Infrastructure</p>
            <h2 className="font-serif text-[48px] md:text-[56px] leading-[1.1] mb-8 font-bold">
              The Live Ledger <br />System.
            </h2>
            <p className="text-[#8a857c] text-lg leading-relaxed mb-10 font-light">
              Every clinical action generates a cryptographic ledger entry. No more unverified line items. Total traceability from admission to discharge.
            </p>
            <ul className="space-y-4">
              {[
                "Immutable service timestamps",
                "Automated mismatch detection",
                "Real-time cost vectoring",
                "Standardized FHIR logging"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-[#1a1815]">
                  <CheckCircle2 size={16} className="text-[#1d6b4f]" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="bg-white border border-[#e2dfd9] rounded-2xl shadow-2xl overflow-hidden shadow-[#1d6b4f]/5">
              <div className="h-12 bg-[#f7f6f3] border-b border-[#e2dfd9] px-6 flex items-center justify-between">
                <div className="flex gap-1.5">
                  {[1,2,3].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-[#e2dfd9]" />)}
                </div>
                <span className="font-mono text-[9px] text-[#8a857c] font-bold uppercase tracking-widest">ledger_status: live_v4.2</span>
              </div>
              <div className="p-8">
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-[#e2dfd9] font-mono text-[#8a857c] uppercase tracking-wider">
                      <th className="pb-4 font-bold">Service Descriptor</th>
                      <th className="pb-4 font-bold text-right">Cost</th>
                      <th className="pb-4 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-bold">
                    {[
                      { s: 'ICU Critical Care Log #992', c: '₹42,000', st: 'VERIFIED', active: true },
                      { s: 'Clinical Lab Analysis (LFT)', c: '₹2,400', st: 'VERIFIED', active: true },
                      { s: 'Medication Administration', c: '₹1,150', st: 'VERIFIED', active: true },
                      { s: 'Unregistered Service Item', c: '₹8,900', st: 'FLAGGED', alert: true },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-[#f7f6f3] last:border-0 hover:bg-[#f7f6f3]/50 transition-colors">
                        <td className="py-4 text-[#1a1815]">{row.s}</td>
                        <td className="py-4 text-right font-mono">{row.c}</td>
                        <td className="py-4 text-right">
                          <span className={`px-2 py-0.5 rounded-[4px] text-[9px] font-bold font-mono ${row.alert ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-[#e8f2ed] text-[#1d6b4f] border border-[#c5dfd3]'}`}>
                            {row.st}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── AUDIT ENGINE ── */}
      <section id="audit" className="py-32 bg-[#f7f6f3] border-t border-[#e2dfd9] px-6 md:px-12">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-24">
            <Reveal>
              <p className="font-mono text-[10px] font-bold text-[#1d6b4f] uppercase tracking-widest mb-4">Intelligent Verification</p>
              <h2 className="font-serif text-[48px] md:text-[64px] font-bold mb-6">Autonomous Audit <span className="italic text-[#1d6b4f]">Engine</span></h2>
              <p className="text-[#8a857c] text-lg max-w-[640px] mx-auto font-light">Simpy cross-references every bill item against insurance policies and clinical pre-auth limits in under 50ms.</p>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'AI Validation', desc: 'Predictive modeling checks clinical necessity and protocol adherence.', icon: Zap },
              { title: 'Policy Compliance', desc: 'Real-time mapping against insurance master policy datasets.', icon: FileText },
              { title: 'Risk Detection', desc: 'Heuristic-based flagging for billing anomalies or duplication.', icon: Search },
            ].map((box, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="bg-white border border-[#e2dfd9] p-10 rounded-xl hover:shadow-xl transition-all h-full">
                  <div className="w-10 h-10 bg-[#e8f2ed] flex items-center justify-center text-[#1d6b4f] rounded-lg mb-6">
                    <box.icon size={20} />
                  </div>
                  <h4 className="text-xl font-bold mb-4">{box.title}</h4>
                  <p className="text-[#8a857c] text-sm leading-relaxed">{box.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL BILL WITH PROOF ── */}
      <section id="compliance" className="py-32 px-6 md:px-12 max-w-[1100px] mx-auto text-center">
        <Reveal>
          <h2 className="font-serif text-[42px] leading-tight mb-8 font-bold">The Settlement Proof Sheet.</h2>
          <p className="text-[#8a857c] text-lg max-w-[640px] mx-auto mb-16 font-light">Every invoice comes with verified ledger anchors, providing absolute confidence to insurance payors and patients.</p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="bg-white border border-[#e2dfd9] rounded-xl overflow-hidden shadow-2xl shadow-[#1d6b4f]/5 text-left mb-20">
            <div className="p-8 overflow-x-auto">
              <table className="w-full text-[12px] min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#e2dfd9] font-mono text-[#8a857c] uppercase tracking-wider">
                    <th className="pb-6 font-bold">Bill Component</th>
                    <th className="pb-6 font-bold text-right">Amount</th>
                    <th className="pb-6 font-bold text-right">Ledger Proof</th>
                    <th className="pb-6 font-bold text-right">Compliance</th>
                  </tr>
                </thead>
                <tbody className="font-bold">
                   {[
                     { item: 'Surgical Set (OT Care)', amt: '₹12,400', proof: 'L#4421-AX', status: 'PASS' },
                     { item: 'Ward Bed Charge (Semi-P)', amt: '₹4,500', proof: 'L#4422-BT', status: 'PASS' },
                     { item: 'Nursing Care Admin.', amt: '₹2,200', proof: 'L#4423-NV', status: 'PASS' },
                     { item: 'Non-Payable Consumable', amt: '₹650', proof: 'Manual Entry', status: 'DEDUCTED', alert: true },
                   ].map((r, i) => (
                     <tr key={i} className="border-b border-[#f7f6f3] last:border-0 hover:bg-[#f7f6f3]/50 transition-colors">
                       <td className="py-5 flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${r.alert ? 'bg-red-400' : 'bg-[#1d6b4f]'}`} />
                          {r.item}
                       </td>
                       <td className="py-5 text-right font-mono">{r.amt}</td>
                       <td className="py-5 text-right"><span className="underline text-[#8a857c] cursor-pointer hover:text-[#1d6b4f]">{r.proof}</span></td>
                       <td className="py-5 text-right">
                          <span className={`text-[10px] font-bold ${r.alert ? 'text-red-600' : 'text-[#1d6b4f]'}`}>{r.status}</span>
                       </td>
                     </tr>
                   ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>

        {/* ── WHY SIMPY SECTION ── */}
        <div id="why-simpy" className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-20 border-t border-[#e2dfd9]">
          {[
            { val: '₹0', label: 'Unverified Charges' },
            { val: '100%', label: 'Traceable Billing' },
            { val: 'FHIR R4', label: 'Compliant' },
            { val: 'Real-time', label: 'Audit Result' },
          ].map((kpi, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="space-y-2">
                <p className="text-[#1d6b4f] font-serif text-5xl font-bold leading-none">{kpi.val}</p>
                <p className="font-mono text-[9px] font-bold text-[#8a857c] uppercase tracking-widest">{kpi.label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-40 bg-white border-y border-[#e2dfd9] px-6 text-center">
        <Reveal>
          <h2 className="font-serif text-[48px] md:text-[60px] font-bold mb-10 leading-tight">Ready to audit the future?</h2>
          <div className="flex justify-center flex-wrap gap-4">
            <button 
              onClick={() => navigate('/medical/login')}
              className="h-16 px-12 bg-[#1d6b4f] text-white font-bold uppercase tracking-widest text-[13px] rounded-lg shadow-2xl shadow-[#1d6b4f]/20 hover:scale-[1.02] transition-all"
            >
              Get Started Now
            </button>
            <button 
              className="h-16 px-12 bg-white border border-[#e2dfd9] text-[#1a1815] font-bold uppercase tracking-widest text-[13px] rounded-lg hover:border-[#1d6b4f] transition-all"
            >
              Contact Solutions
            </button>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-20 px-6 md:px-12 bg-[#f7f6f3] border-t border-[#e2dfd9]">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#1d6b4f] rounded flex items-center justify-center text-white">
                <Database size={14} />
              </div>
              <span className="font-serif font-bold text-lg tracking-tight">Simpy.ai</span>
            </div>
            <p className="text-[#8a857c] text-xs max-w-[300px] leading-relaxed">
              Clinical intelligence and billing verification infrastructure for modern healthcare institutions.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-16">
            <div className="space-y-4">
              <h5 className="font-mono text-[9px] font-bold uppercase text-[#1a1815] tracking-widest">Platform</h5>
              <div className="flex flex-col gap-2 text-xs text-[#8a857c] font-medium">
                <a href="#" className="hover:text-[#1d6b4f]">Pre-Auth Audit</a>
                <a href="#" className="hover:text-[#1d6b4f]">Medical Portal</a>
                <a href="#" className="hover:text-[#1d6b4f]">Admin Console</a>
                <a href="#" className="hover:text-[#1d6b4f]">Integrations</a>
              </div>
            </div>
            <div className="space-y-4">
              <h5 className="font-mono text-[9px] font-bold uppercase text-[#1a1815] tracking-widest">Company</h5>
              <div className="flex flex-col gap-2 text-xs text-[#8a857c] font-medium">
                <a href="#" className="hover:text-[#1d6b4f]">Documentation</a>
                <a href="#" className="hover:text-[#1d6b4f]">Privacy Policy</a>
                <a href="#" className="hover:text-[#1d6b4f]">Terms of Service</a>
                <a href="#" className="hover:text-[#1d6b4f]">Support</a>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto mt-20 pt-8 border-t border-[#e2dfd9] flex justify-between items-center bg-transparent">
          <span className="font-mono text-[8px] text-[#8a857c] uppercase tracking-widest">© 2026 Simpy.ai Infrastructure</span>
          <div className="flex gap-4 opacity-50">
            <Globe size={14} />
            <Server size={14} />
            <Database size={14} />
          </div>
        </div>
      </footer>
    </div>
  );
}
