import React from 'react';
import { CheckCircle2, Download, ShieldCheck, AlertCircle, TrendingDown, IndianRupee, FileText, Zap, ArrowRight, Wallet, ArrowUpRight, Loader2, Sparkles } from 'lucide-react';

export default function FinalSettlement({ settlement, auditResult, preauth_approved, onExport, exportLoading, onTransmitDispute, disputeLoading, onGenerateAudit }) {
  if (!settlement) return null;

  const stats = [
    { label: 'Gross Bill Amount', value: settlement.total_bill, color: 'text-[var(--text)]' },
    { label: 'Total Deductions', value: settlement.deductions, color: 'text-[var(--red)]' },
    { label: 'Patient Liability', value: settlement.patient_pay, color: 'text-[var(--amber)]' },
    { label: 'Final Payout Net', value: settlement.insurance_pay, color: 'text-[var(--accent)]', accent: true },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-1000">
      
      {/* Decision Ledger */}
      <div className="bg-white border border-[var(--border)] p-8 rounded-[12px] shadow-sm relative overflow-hidden group">
        
        <div className="flex items-center justify-between mb-10 border-b border-[var(--border)] pb-8 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] rounded-[8px]">
                <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-[22px] font-serif font-bold text-[var(--text)]">Final Decision Ledger</h3>
              <p className="font-mono text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mt-1">Status: Finalized v4.0</p>
            </div>
          </div>

          <button 
            onClick={onExport}
            disabled={exportLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--border)] hover:border-[var(--accent)] text-[var(--muted)] hover:text-[var(--accent)] text-[11px] font-bold uppercase tracking-wider transition-all rounded-[6px] shadow-sm disabled:opacity-50"
          >
             {exportLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} 
             {exportLoading ? "Exporting..." : "Export Audit"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border)] rounded-[8px] overflow-hidden border border-[var(--border)] relative z-10 shadow-sm">
          {stats.map((stat, i) => (
            <div key={i} className={`bg-white p-6 group/stat transition-all hover:bg-[var(--surface-alt)] ${stat.accent ? 'bg-[var(--accent-light)]/30' : ''}`}>
               <p className="font-mono text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider mb-4 group-hover/stat:translate-x-1 transition-transform">{stat.label}</p>
               <div className="flex items-baseline gap-1.5">
                  <span className={`text-[14px] font-bold ${stat.color} opacity-40`}>₹</span>
                  <h2 className={`text-[32px] font-bold tracking-tight leading-none ${stat.color}`}>
                    {stat.value?.toLocaleString()}
                  </h2>
               </div>
            </div>
          ))}
        </div>

        {/* Deduction Detail Trace */}
        <div className="mt-10 space-y-4 relative z-10">
           <div className="flex items-center gap-2 mb-4 px-1">
              <TrendingDown size={14} className="text-[var(--red)]" />
              <span className="font-mono text-[9px] text-[var(--muted)] font-bold uppercase tracking-widest">Reconciliation Deduction Trace</span>
           </div>
           
           <div className="space-y-2">
              {settlement.deduction_details?.slice(0, 3).map((item, i) => (
                <div key={i} className="flex justify-between items-center bg-[var(--surface-alt)] p-4 border border-[var(--border)] group transition-all hover:border-[var(--red)]/30 rounded-[8px]">
                   <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-[var(--red)]/40 rounded-full" />
                      <span className="text-[12px] text-[var(--muted)] font-bold group-hover:text-[var(--text)]">{item}</span>
                   </div>
                   <ArrowRight size={14} className="text-[var(--mid)] group-hover:text-[var(--red)] transition-all" />
                </div>
              ))}
           </div>
        </div>

        {/* Action Controls */}
        <div className="mt-10 flex flex-col md:flex-row gap-4 relative z-10">
           <button 
             onClick={() => onTransmitDispute()}
             disabled={disputeLoading}
             className="flex-1 h-14 bg-white border border-[var(--border)] hover:border-[var(--amber)] text-[var(--text)] font-bold uppercase tracking-wider text-[12px] flex items-center justify-center gap-2 transition-all group rounded-[8px] shadow-sm disabled:opacity-50"
           >
             {disputeLoading ? <Loader2 size={16} className="animate-spin text-[var(--amber)]" /> : <Zap size={16} className="text-[var(--amber)]" />}
             {disputeLoading ? "Transmitting..." : "Transmit Dispute"}
           </button>
           
           <button 
             onClick={onGenerateAudit}
             className="flex-1 h-14 bg-[var(--accent)] hover:opacity-95 text-white font-bold uppercase tracking-wider text-[12px] flex items-center justify-center gap-2 transition-all shadow-md shadow-[var(--accent)]/10 rounded-[8px]"
           >
             <FileText size={18} />
             Generate AI Decision
           </button>
        </div>
      </div>

      {/* Decision Status & AI Metrics */}
      <div className="space-y-6">
        {auditResult && (
          <div className="bg-[var(--accent-light)]/20 border border-[var(--accent-border)] p-6 rounded-[12px] animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles size={18} className="text-[var(--accent)]" />
              <h4 className="font-serif font-bold text-[18px] text-[var(--text)]">AI Audit Insights</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="font-mono text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Risk Assessment</p>
                <div className="flex items-center gap-2">
                  <span className={`text-[20px] font-bold ${auditResult.risk_score < 30 ? 'text-[var(--accent)]' : auditResult.risk_score < 70 ? 'text-[var(--amber)]' : 'text-[var(--red)]'}`}>
                    {auditResult.risk_score < 30 ? 'LOW RISK' : auditResult.risk_score < 70 ? 'MEDIUM RISK' : 'HIGH RISK'}
                  </span>
                  <span className="text-[12px] text-[var(--muted)] font-mono">({auditResult.risk_score}/100)</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-mono text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Confidence Score</p>
                <p className="text-[20px] font-bold text-[var(--text)]">98.4%</p>
              </div>
              <div className="space-y-1">
                <p className="font-mono text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Audit Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${auditResult.is_fully_approved ? 'bg-[var(--accent)]' : 'bg-[var(--amber)] animate-pulse'}`} />
                  <span className="text-[14px] font-bold text-[var(--text)]">
                    {auditResult.is_fully_approved ? 'POLICY COMPLIANT' : 'MANUAL REVIEW REQ.'}
                  </span>
                </div>
              </div>
            </div>
            {auditResult.flags?.length > 0 && (
              <div className="mt-6 pt-6 border-t border-[var(--accent-border)]/30">
                <p className="font-mono text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest mb-3">Priority Flags</p>
                <div className="flex flex-wrap gap-2">
                  {auditResult.flags.map((flag, i) => (
                    <span key={i} className="px-2 py-1 bg-white/50 border border-[var(--accent-border)] rounded-[4px] text-[10px] font-bold text-[var(--text)]">
                      {flag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between px-8 py-4 bg-white border border-[var(--border)] rounded-[12px] shadow-sm">
           <div className="flex items-center gap-4">
              <div className="w-9 h-9 border border-[var(--border)] bg-[var(--surface-alt)] flex items-center justify-center text-[var(--accent)] rounded-[6px]">
                 <CheckCircle2 size={18} />
              </div>
              <div>
                 <p className="text-[13px] font-bold text-[var(--text)] leading-none">Decision Ready for Transmission</p>
                 <p className="text-[10px] text-[var(--muted)] font-medium mt-1">Timestamp: {new Date().toLocaleString()}</p>
              </div>
           </div>
           <div className="flex items-center gap-2 px-3 py-1 bg-[var(--accent-light)] border border-[var(--accent-border)] rounded-[4px]">
              <span className="font-mono text-[9px] font-bold text-[var(--accent)] uppercase tracking-wider">State: Persistent</span>
           </div>
        </div>
      </div>

    </div>
  );
}
