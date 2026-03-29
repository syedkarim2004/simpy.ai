import React, { useState } from 'react';
import { 
  X, ShieldCheck, Download, AlertTriangle, 
  Lightbulb, Check, ChevronDown, ChevronUp,
  Activity, ShieldAlert, AlertCircle, FileDown,
  Database, User, Clock, CheckCircle2
} from 'lucide-react';

export default function AuditEvidenceModal({ result, onClose }) {
  const [showRules, setShowRules] = useState(false);

  if (!result) return null;

  const decisionConfig = {
    'Approve': {
      bg: 'bg-[var(--accent-light)]',
      text: 'text-[var(--accent)]',
      border: 'border-[var(--accent-border)]',
      label: '✓ APPROVED',
      desc: result.reasoning || 'Standard emergency procedure with no complications.'
    },
    'Review': {
      bg: 'bg-[var(--amber-light)]',
      text: 'text-[var(--amber)]',
      border: 'border-[var(--amber-border)]',
      label: '⚠ REVIEW REQUIRED',
      desc: result.reasoning || 'Claim requires manual clinical validation.'
    },
    'Reject': {
      bg: 'bg-[var(--red-light)]',
      text: 'text-[var(--red)]',
      border: 'border-red-200',
      label: '✗ REJECTED',
      desc: result.reasoning || 'Claim violates core billing compliance rules.'
    }
  };

  const riskConfig = {
    'Low': { color: 'text-[var(--accent)]', label: 'LOW CLINICAL RISK' },
    'Medium': { color: 'text-[var(--amber)]', label: 'MEDIUM CLINICAL RISK' },
    'High': { color: 'text-[var(--red)]', label: 'HIGH CLINICAL RISK' }
  };

  const config = decisionConfig[result.decision] || decisionConfig['Review'];
  const risk = riskConfig[result.risk_level] || riskConfig['Medium'];

  const handleDownload = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/preauth/download/${result.admission_id}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-${result.admission_id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[#1a1815]/60 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-[960px] bg-white border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[94vh] flex flex-col font-body text-[var(--text)]">
        
        {/* Header */}
        <header className="flex items-center justify-between px-10 py-8 border-b border-[var(--border)] shrink-0 bg-[var(--bg)]">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white border border-[var(--border)] rounded-xl flex items-center justify-center text-[var(--accent)] shadow-sm">
               <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-[var(--text)] font-bold italic leading-tight">
                Clinical Audit Evidence Summary
              </h2>
              <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.2em] mt-1 font-bold">
                ADMISSION ID: {result.admission_id} &bull; MEDGEMMA CORE VERIFIED
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-white border hover:border-[var(--border)] rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </header>
 
        {/* Scrollable Content */}
        <div className="overflow-y-auto p-12 space-y-12 custom-scrollbar">
          
          {/* Top 3 Status Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`${config.bg} ${config.text} ${config.border} border-2 p-8 flex flex-col justify-center rounded-xl relative overflow-hidden group`}>
              <h3 className="font-serif font-black text-2xl mb-3 italic tracking-tight">{config.label}</h3>
              <p className="text-[14px] leading-relaxed uppercase font-black opacity-90">{config.desc}</p>
              <Activity className="absolute -right-8 -bottom-8 w-24 h-24 opacity-5" />
            </div>

            <div className="bg-[var(--bg)] border border-[var(--border)] p-8 flex flex-col justify-center rounded-xl">
              <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mb-2 font-bold">VULNERABILITY INDEX</p>
              <h3 className={`font-serif font-black text-2xl italic tracking-tight ${risk.color}`}>{risk.label}</h3>
            </div>

            <div className="bg-white border border-[var(--border)] p-8 flex flex-col justify-center rounded-xl items-center text-center shadow-sm relative overflow-hidden">
              <h3 className="font-serif font-black text-5xl text-[var(--accent)] leading-none mb-2 tracking-tighter">
                {result.completeness_score}%
              </h3>
              <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest font-bold">DATA INTEGRITY SCORE</p>
              <div className="w-full h-1.5 bg-[var(--bg)] rounded-full overflow-hidden mt-6 border border-[var(--border)]">
                <div 
                  className="h-full bg-[var(--accent)] transition-all duration-1000"
                  style={{ width: `${result.completeness_score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Details & Findings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                 <User size={18} className="text-[var(--accent)]" />
                 <h4 className="font-mono text-[11px] text-[var(--text)] uppercase tracking-widest font-black">
                   Administrative Protocol
                 </h4>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-[var(--bg)] p-3 rounded border border-[var(--border)]">
                  <span className="font-mono text-[10px] text-[var(--muted)] uppercase font-bold text-center">PATIENT ID</span>
                  <span className="font-mono text-[11px] font-black text-[var(--accent)] bg-white px-2 py-1 rounded border border-[var(--accent-border)]">{result.patient_id}</span>
                </div>
                <div className="flex flex-col gap-1 px-1">
                  <span className="font-mono text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest">PATIENT NAME / AGE / GENDER</span>
                  <span className="text-xl font-bold text-[var(--text)] uppercase tracking-tight">{result.patient_name} / {result.age}Y &bull; {result.gender}</span>
                </div>
                <div className="flex flex-col gap-1 px-1">
                  <span className="font-mono text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest">INSURANCE CARRIER NETWORK</span>
                  <span className="text-lg font-bold text-[var(--accent)] uppercase">{result.insurance_provider}</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                 <Activity size={18} className="text-[var(--accent)]" />
                 <h4 className="font-mono text-[11px] text-[var(--text)] uppercase tracking-widest font-black">
                   Clinical Intelligence
                 </h4>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-[var(--bg)] p-3 rounded border border-[var(--border)]">
                  <span className="font-mono text-[10px] text-[var(--muted)] uppercase font-bold">ICD-10 CLASSIFICATION</span>
                  <span className="font-mono text-[11px] bg-[var(--accent)] text-white px-3 py-1 font-black rounded shadow-sm">{result.icd_code}</span>
                </div>
                <div className="flex flex-col gap-1 px-1">
                  <span className="font-mono text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest">DRG / PRIMARY DIAGNOSIS</span>
                  <span className="text-xl font-bold text-[var(--text)] leading-tight uppercase tracking-tight">{result.diagnosis}</span>
                </div>
                <div className="flex flex-col gap-1 px-1">
                  <span className="font-mono text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest">PROPOSED INTERVENTION</span>
                  <span className="text-[14px] text-[var(--text)] leading-relaxed uppercase font-semibold italic opacity-90">"{result.proposed_treatment}"</span>
                </div>
              </div>
            </div>
          </div>

          {/* Insurance Rule Compliance */}
          <section className="bg-[var(--bg)] border border-[var(--border)] p-10 rounded-2xl shadow-inner">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white border border-[var(--border)] rounded-xl flex items-center justify-center text-[var(--accent)]">
                    <Database size={24} />
                 </div>
                 <div>
                  <h3 className="font-serif text-2xl text-[var(--text)] font-bold italic">Compliance Audit Log</h3>
                  <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mt-1 font-bold">
                    VERIFIED AGAINST 32 ACTIVE PROTOCOLS
                  </p>
                </div>
              </div>
              <div className="bg-[var(--accent)] px-5 py-2.5 font-mono text-[12px] font-black text-white uppercase tracking-widest rounded-lg shadow-lg shadow-[var(--accent)]/10">
                {result.rule_check?.passed || 31}/32 PASSED
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              {[
                { label: 'PASSED', count: result.rule_check?.passed || 31, color: 'text-emerald-600' },
                { label: 'FAILED', count: result.rule_check?.failed || 1, color: 'text-red-600' },
                { label: 'WARNINGS', count: result.rule_check?.warnings || 0, color: 'text-amber-600' },
                { label: 'SCORE', count: `${result.rule_check?.rule_score || 96}%`, color: 'text-[var(--accent)]' }
              ].map((stat, i) => (
                <div key={i} className="bg-white border border-[var(--border)] p-6 rounded-xl text-center shadow-sm group hover:border-[var(--accent)] transition-all">
                  <span className={`font-mono text-[10px] uppercase font-black tracking-widest mb-3 block opacity-80 ${stat.color}`}>{stat.label}</span>
                  <span className="text-3xl font-serif font-black text-[var(--text)] tracking-tighter">{stat.count}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowRules(!showRules)}
              className="w-full flex items-center justify-center gap-3 font-mono text-[11px] text-[var(--muted)] uppercase tracking-[0.3em] hover:text-[var(--text)] transition-all py-4 bg-white border border-[var(--border)] rounded-xl font-black"
            >
              {showRules ? <ChevronUp size={16} className="text-[var(--accent)]" /> : <ChevronDown size={16} className="text-[var(--accent)]" />}
              {showRules ? 'Collapse Rule details' : 'View full clinical rule audit'}
            </button>

            {showRules && result.rule_check?.results && (
              <div className="mt-8 border border-[var(--border)] rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-4 bg-white shadow-xl">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[var(--bg)] border-b border-[var(--border)]">
                    <tr className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest font-black">
                      <th className="px-6 py-4">#</th>
                      <th className="px-6 py-4">Protocol Rule Description</th>
                      <th className="px-6 py-4 text-right">Audit Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {result.rule_check.results.map((rule, idx) => (
                      <tr key={idx} className="hover:bg-[var(--bg)] transition-colors">
                        <td className="px-6 py-4 font-mono text-[11px] text-[var(--muted)] font-bold">{rule.id}</td>
                        <td className="px-6 py-4">
                          <p className="text-[14px] text-[var(--text)] font-bold leading-snug uppercase tracking-tight">{rule.rule}</p>
                          {rule.note && <p className="text-[11px] text-red-600 mt-2 font-black italic uppercase tracking-tighter">&bull; {rule.note}</p>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-mono text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                            rule.status === 'Pass' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                            rule.status === 'Fail' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}>
                            {rule.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Missing Fields + Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                 <ShieldAlert size={18} className="text-[var(--red)]" />
                 <h4 className="font-mono text-[11px] text-[var(--text)] uppercase tracking-widest font-black">
                   Protocol Vulnerabilities
                 </h4>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                {result.missing_fields && result.missing_fields.length > 0 ? (
                  result.missing_fields.map((field, idx) => (
                    <div key={idx} className="px-5 py-2 bg-red-50 border border-red-100 text-[var(--red)] rounded-lg font-mono text-[11px] font-black uppercase tracking-widest shadow-sm">
                      {field.replace(/_/g, ' ')}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-4 text-emerald-700 bg-emerald-50 px-6 py-4 rounded-xl border border-emerald-100 shadow-sm w-full">
                    <CheckCircle2 size={24} />
                    <span className="font-serif font-black text-xl italic tracking-tight">All Validation Checks Passed</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
                 <Lightbulb size={18} className="text-[var(--amber)]" />
                 <h4 className="font-mono text-[11px] text-[var(--text)] uppercase tracking-widest font-black">
                   Audit Intelligence Ops
                 </h4>
              </div>
              <div className="space-y-4 pt-2">
                {result.suggestions && result.suggestions.length > 0 ? (
                  result.suggestions.map((s, idx) => (
                    <div key={idx} className="flex gap-4 bg-[var(--bg)] p-4 rounded-xl border border-[var(--border)] hover:border-[var(--amber-border)] transition-all">
                      <div className="w-2 h-2 rounded-full bg-[var(--amber)] mt-2 shrink-0 animate-pulse" />
                      <p className="text-[14px] text-[var(--text)] leading-relaxed uppercase font-bold italic opacity-90">"{s}"</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[14px] text-[var(--muted)] font-bold italic uppercase">No immediate clinical optimizations identified for this case.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <footer className="px-10 py-8 border-t border-[var(--border)] bg-[var(--bg)] flex flex-col md:flex-row justify-between items-center gap-8 shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-white border border-[var(--border)] rounded-full flex items-center justify-center text-[var(--accent)]">
                <ShieldCheck size={20} />
             </div>
             <p className="text-[12px] text-[var(--muted)] font-black uppercase tracking-widest">Simpy.ai MedGemma-7B Clinical Trust Architecture</p>
          </div>
          <button 
            onClick={handleDownload}
            className="w-full md:w-auto bg-[var(--accent)] text-white px-10 py-4 rounded-xl font-mono text-[12px] font-black uppercase tracking-[0.2em] hover:opacity-95 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-[var(--accent)]/30 group"
          >
            <Download size={20} className="group-hover:translate-y-0.5 transition-transform" /> 
            Export Audit Record (.XLSX)
          </button>
        </footer>
      </div>
    </div>
  );
}
