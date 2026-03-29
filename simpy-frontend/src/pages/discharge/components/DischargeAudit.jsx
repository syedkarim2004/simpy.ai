import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, TrendingUp, Sparkles, Activity } from 'lucide-react';

export default function DischargeAudit({ audit, insights }) {
  if (!audit) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return '#1d6b4f'; // accent
    if (score >= 50) return '#b85c2a'; // amber
    return '#c0392b'; // red
  };

  const getRiskLabel = (score) => {
    if (score >= 80) return { label: 'Low Risk', color: 'text-[var(--accent)]', bg: 'bg-[var(--accent-light)] border-[var(--accent-border)]' };
    if (score >= 50) return { label: 'Medium Risk', color: 'text-[var(--amber)]', bg: 'bg-[var(--amber-light)] border-[var(--amber-border)]' };
    return { label: 'High Risk', color: 'text-[var(--red)]', bg: 'bg-[var(--red-light)] border-red-100' };
  };

  const risk = getRiskLabel(audit?.risk_score ?? 0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - ((audit?.risk_score ?? 0) / 100) * circumference;

  return (
    <div className="space-y-10 animate-in fade-in zoom-in duration-700">
      
      {/* Audit Compliance Section */}
      <div className="bg-white border border-[var(--border)] p-8 rounded-[12px] shadow-sm relative overflow-hidden group/audit">
        
        {/* Risk Badge */}
        <div className="absolute top-8 right-8">
           <div className={`px-3 py-1.5 border ${risk.bg} flex items-center gap-2 rounded-[6px]`}>
              <div className={`w-1.5 h-1.5 rounded-full ${risk.color.replace('text-', 'bg-')} animate-pulse`} />
              <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${risk.color}`}>{risk.label} Profile</span>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-center relative z-10">
          {/* Circular Progress */}
          <div className="relative flex items-center justify-center p-6 bg-[var(--surface-alt)] border border-[var(--border)] rounded-[12px]">
            <svg className="w-40 h-40 transform -rotate-90">
              <circle
                cx="80" cy="80" r={radius}
                fill="transparent"
                stroke="var(--border)"
                strokeWidth="10"
              />
              <circle
                cx="80" cy="80" r={radius}
                fill="transparent"
                stroke={getScoreColor((audit?.risk_score ?? 0))}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-in-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[44px] font-serif font-bold text-[var(--text)] leading-none">{(audit?.risk_score ?? 0)}</span>
              <span className="font-mono text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest mt-1">Audit Score</span>
            </div>
          </div>
          
          <div className="flex-1 space-y-6 w-full">
            <div>
              <div className="flex items-center gap-2 mb-3">
                 <Activity size={16} className="text-[var(--accent)]" />
                 <h3 className="text-[24px] font-serif font-bold text-[var(--text)]">Compliance Analysis</h3>
              </div>
              <p className="text-[14px] text-[var(--muted)] leading-relaxed border-l-2 border-[var(--border)] pl-4 py-1">
                System evaluation complete. Verified billing patterns against claim history and pre-auth directives.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {audit?.flags?.length > 0 ? (
                audit.flags.map((flag, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-[var(--surface-alt)] border border-[var(--border)] border-l-4 border-l-[var(--red)] group/flag transition-all hover:bg-white rounded-[6px]">
                    <div className="w-8 h-8 bg-white border border-[var(--border)] flex items-center justify-center text-[var(--red)] rounded-[4px]">
                      <ShieldAlert size={14} />
                    </div>
                    <span className="text-[13px] font-bold text-[var(--text)] leading-snug">{flag}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-6 p-8 bg-[var(--accent-light)] border border-[var(--accent-border)] border-l-4 border-l-[var(--accent)] rounded-[8px]">
                  <div className="w-12 h-12 bg-white border border-[var(--accent-border)] flex items-center justify-center text-[var(--accent)] rounded-[10px]">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                     <span className="text-[18px] font-serif font-bold text-[var(--accent)] leading-none">Audit Cleared</span>
                     <p className="text-[12px] text-[var(--accent)] font-medium mt-1">Claim satisfies all major policy requirements.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {audit?.warnings?.length > 0 && (
          <div className="mt-10 pt-8 border-t border-[var(--border)]">
             <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={14} className="text-[var(--amber)]" />
                <span className="font-mono text-[9px] text-[var(--muted)] font-bold uppercase tracking-widest">Clinical Audit Log [{audit.warnings.length}]</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {audit.warnings.map((warning, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-[var(--surface-alt)] border border-[var(--border)] hover:bg-white transition-colors rounded-[8px]">
                    <div className="w-1.5 h-1.5 bg-[var(--amber)] rounded-full shrink-0 mt-1.5" />
                    <p className="text-[12px] font-medium text-[var(--text)] leading-relaxed">{warning}</p>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* Insight Cards */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { label: 'Approval Probability', val: insights.approval_rate, suffix: '%', color: 'text-[var(--accent)]', progress: 'bg-[var(--accent)]' },
             { label: 'Deduction Ratio', val: insights.deduction_ratio, suffix: '%', color: 'text-[var(--amber)]', progress: 'bg-[var(--amber)]' },
             { label: 'Patient Liability', val: insights.loss_to_patient, prefix: '₹', color: 'text-[var(--red)]', progress: 'bg-[var(--red)]' }
           ].map((card, i) => (
             <div key={i} className="bg-white border border-[var(--border)] p-8 rounded-[12px] shadow-sm relative overflow-hidden group hover:border-[var(--mid)] transition-all animate-in slide-in-from-bottom-6 duration-700" style={{ animationDelay: `${i * 100}ms` }}>
                <p className="font-mono text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider mb-4">{card.label}</p>
                <h2 className={`text-[36px] font-bold text-[var(--text)] tracking-tight mb-5 flex items-baseline gap-1 ${card.color}`}>
                   {card.prefix && <span className="text-[18px] font-mono mr-1">{card.prefix}</span>}
                   {card.val?.toLocaleString()}
                   {card.suffix && <span className="text-[18px] font-mono ml-1">{card.suffix}</span>}
                </h2>
                <div className="w-full bg-[var(--surface-alt)] h-1.5 rounded-full overflow-hidden border border-[var(--border)]">
                   <div className={`${card.progress} h-full transition-all duration-1000`} style={{ width: `${card.val > 100 ? 100 : card.val}%` }}></div>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
}
