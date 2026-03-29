import React, { useState } from 'react';
import { 
  CheckCircle2, AlertCircle, FileText, Download, 
  ChevronDown, ChevronUp, ShieldCheck, Shield, 
  ShieldAlert, CheckCircle, AlertTriangle, XCircle, 
  FileDown, Lightbulb, User, Clock, TrendingUp,
  Database, Activity
} from 'lucide-react';
import EnhancementModal from './EnhancementModal';

export default function AuditResult({ result }) {
  const [showRules, setShowRules] = useState(false);
  const [showEnhancement, setShowEnhancement] = useState(false);

  if (!result) return null;

  const decisionConfig = {
    'Approve': {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      label: '✓ APPROVED',
      icon: CheckCircle2
    },
    'Review': {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      label: '⚠ REVIEW REQUIRED',
      icon: Clock
    },
    'Reject': {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      label: '✗ REJECTED',
      icon: XCircle
    }
  };

  const riskConfig = {
    'Low': { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'LOW RISK' },
    'Medium': { color: 'text-amber-600', bg: 'bg-amber-50', label: 'MEDIUM RISK' },
    'High': { color: 'text-red-600', bg: 'bg-red-50', label: 'HIGH RISK' }
  };

  const config = decisionConfig[result.decision] || decisionConfig['Review'];
  const risk = riskConfig[result.risk_level] || riskConfig['Medium'];
  const StatusIcon = config.icon;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-[var(--accent)]';
    if (score >= 50) return 'text-[var(--amber)]';
    return 'text-red-600';
  };

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
    <div className="space-y-10 animate-in fade-in duration-700 font-body p-2">
      {/* ROW 1 — Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${config.bg} ${config.text} ${config.border} border p-10 flex flex-col justify-center rounded-xl relative overflow-hidden group shadow-sm`}>
          <div className="font-serif font-black text-3xl tracking-tight mb-3 italic">{config.label}</div>
          <p className="font-body text-[14px] leading-relaxed uppercase font-semibold opacity-90">{result.reasoning}</p>
          <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <StatusIcon size={56} />
          </div>
        </div>

        <div className="bg-white border border-[var(--border)] p-10 flex flex-col justify-center rounded-xl shadow-sm">
           <div className={`font-serif font-black text-2xl tracking-tight ${risk.color} uppercase italic`}>{risk.label}</div>
           <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mt-2 font-bold">CLINICAL VULNERABILITY INDEX</p>
        </div>

        <div className="bg-white border border-[var(--border)] p-10 flex flex-col justify-center rounded-xl items-center text-center shadow-sm">
          <h3 className={`font-serif font-black text-5xl tracking-tighter leading-none mb-2 ${getScoreColor(result.completeness_score)}`}>
            {result.completeness_score}%
          </h3>
          <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mb-6 font-bold">FORM COMPLETENESS</p>
          <div className="w-full h-2 bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)]">
            <div 
              className={`h-full transition-all duration-1000 ${
                result.completeness_score >= 80 ? 'bg-[var(--accent)]' : 
                result.completeness_score >= 50 ? 'bg-[var(--amber)]' : 'bg-red-500'
              }`}
              style={{ width: `${result.completeness_score}%` }}
            />
          </div>
        </div>
      </div>

      {/* ROW 2 — Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-[var(--border)] pt-12">
        <div className="space-y-10">
          <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6">
            <div className="w-10 h-10 bg-[var(--bg)] rounded-lg flex items-center justify-center text-[var(--accent)] border border-[var(--border)]">
              <User size={20} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-lg text-[var(--text)] italic">Case Record Metadata</h4>
              <p className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-widest">VERIFIED CLINICAL IDENTITY</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-8">
            <div>
              <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mb-3 font-bold">IDENTIFIER / PATIENT</p>
              <span className="font-mono text-[12px] bg-[var(--bg)] border border-[var(--border)] px-4 py-2 text-[var(--accent)] font-bold rounded-lg">{result.patient_id}</span>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mb-3 font-bold">IDENTIFIER / ADMISSION</p>
              <span className="font-mono text-[12px] bg-[var(--bg)] border border-[var(--border)] px-4 py-2 text-[var(--text)] font-bold rounded-lg">{result.admission_id}</span>
            </div>
            <div className="col-span-2">
              <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mb-3 font-bold">FULL NAME / AGE / GENDER</p>
              <p className="font-serif font-bold text-2xl text-[var(--text)] uppercase tracking-tight">{result.patient_name} / {result.age}Y / {result.gender}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mb-3 font-bold">INSURANCE CARRIER</p>
              <p className="font-serif font-bold text-xl text-[var(--accent)] uppercase">{result.insurance_provider}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mb-3 font-bold">TPA / POLICY</p>
              <p className="font-serif font-bold text-lg text-[var(--text)] uppercase">{result.tpa_name} / {result.policy_number}</p>
            </div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6">
            <div className="w-10 h-10 bg-[var(--bg)] rounded-lg flex items-center justify-center text-[var(--accent)] border border-[var(--border)]">
              <Activity size={20} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-lg text-[var(--text)] italic">Clinical Observations</h4>
              <p className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-widest">REAL-TIME DIAGNOSTIC AUDIT</p>
            </div>
          </div>
          <div className="space-y-8">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mb-3 font-bold">PRIMARY DIAGNOSIS</p>
                <p className="font-serif font-bold text-2xl text-[var(--text)] uppercase tracking-tight leading-tight">{result.diagnosis}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mb-3 font-bold">ICD-10 CODE</p>
                <span className="font-mono text-[12px] bg-[var(--accent)] text-white px-4 py-2 font-black uppercase rounded-lg shadow-sm">{result.icd_code}</span>
              </div>
            </div>
            <div>
              <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mb-3 font-bold">TREATMENT PROTOCOL</p>
              <p className="text-[14px] text-[var(--text)] leading-relaxed uppercase font-medium">{result.proposed_treatment}</p>
            </div>
            <div className="bg-[var(--bg)] border-l-4 border-[var(--accent)] p-6 rounded-r-lg">
              <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mb-3 font-bold">AI DECISION REASONING</p>
              <p className="text-[14px] text-[var(--text)] leading-relaxed italic opacity-90 uppercase font-medium">"{result.reasoning}"</p>
            </div>
            <button
              onClick={() => setShowEnhancement(true)}
              className="w-full h-14 bg-white border border-[var(--amber-border)] hover:bg-[var(--amber-light)] text-[var(--amber)] font-mono font-bold text-[11px] uppercase tracking-widest transition-all rounded-lg flex items-center justify-center gap-3 shadow-sm"
            >
              <TrendingUp size={18} />
              Raise Enhancement Request
            </button>
          </div>
        </div>
      </div>

      {/* Rule Compliance Section */}
      <section className="bg-white border border-[var(--border)] p-10 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center rounded-xl">
              <Database size={28} className="text-[var(--accent)]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-2xl text-[var(--text)] italic uppercase">Insurance Rule Compliance</h3>
              <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mt-1 font-bold">AUDIT ACROSS 32 CLINICAL & BILLING RULES</p>
            </div>
          </div>
          
          <div className={`px-6 py-3 rounded-lg font-mono font-black text-[12px] tracking-widest border border-l-4 ${
            (result.rule_check?.rule_score || 0) > 80 ? 'bg-emerald-50 border-emerald-500 text-emerald-700' :
            (result.rule_check?.rule_score || 0) > 50 ? 'bg-amber-50 border-amber-500 text-amber-700' :
            'bg-red-50 border-red-500 text-red-700'
          }`}>
            {result.rule_check?.passed || 0}/32 PROTOCOLS PASSED
          </div>
        </div>

        {result.rule_check && (
          <div className="space-y-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'PASSED', count: result.rule_check.passed, color: 'text-emerald-600' },
                { label: 'FAILED', count: result.rule_check.failed, color: 'text-red-600' },
                { label: 'WARNINGS', count: result.rule_check.warnings, color: 'text-amber-600' },
                { label: 'SCORE', count: `${result.rule_check.rule_score}%`, color: 'text-[var(--accent)]' }
              ].map((stat, i) => (
                <div key={i} className="bg-[var(--bg)] border border-[var(--border)] p-6 text-center rounded-xl group hover:border-[var(--accent)] transition-all">
                  <span className={`font-mono text-[10px] uppercase tracking-widest mb-3 block font-bold ${stat.color}`}>{stat.label}</span>
                  <span className="font-serif font-bold text-3xl text-[var(--text)] tracking-tight">{stat.count}</span>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <button 
                onClick={() => setShowRules(!showRules)}
                className="w-full flex items-center justify-center gap-4 py-4 font-mono text-[11px] text-[var(--muted)] uppercase tracking-widest hover:text-[var(--text)] transition-all bg-[var(--bg)] rounded-lg border border-[var(--border)] font-bold"
              >
                {showRules ? (
                  <><ChevronUp className="w-4 h-4 text-[var(--accent)]" /> Hide Compliance Details</>
                ) : (
                  <><ChevronDown className="w-4 h-4 text-[var(--accent)]" /> View Full Rule Audit Log (32 Rules)</>
                )}
              </button>

              {showRules && (
                <div className="border border-[var(--border)] rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 shadow-xl">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-[var(--bg)] border-b border-[var(--border)]">
                      <tr className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest font-bold">
                        <th className="px-8 py-5">ID</th>
                        <th className="px-8 py-5">CATEGORY</th>
                        <th className="px-8 py-5">PROTOCOL DESCRIPTION</th>
                        <th className="px-8 py-5">SEVERITY</th>
                        <th className="px-8 py-5 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {result.rule_check.results.map((rule, idx) => (
                        <tr key={idx} className="bg-white hover:bg-[var(--bg)] transition-colors">
                          <td className="px-8 py-5 font-mono text-[11px] text-[var(--muted)] font-bold">{rule.id}</td>
                          <td className="px-8 py-5">
                            <span className="font-mono text-[9px] bg-[var(--bg)] border border-[var(--border)] px-3 py-1 text-[var(--text)] uppercase font-bold rounded">
                              {rule.category}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <p className="text-[14px] text-[var(--text)] uppercase font-medium">{rule.rule}</p>
                            {rule.note && <p className="font-body text-[11px] text-red-600 mt-2 italic uppercase font-bold">{rule.note}</p>}
                          </td>
                          <td className="px-8 py-5">
                            <span className={`font-mono text-[10px] uppercase font-black tracking-widest ${
                              rule.severity === 'Critical' ? 'text-red-600' :
                              rule.severity === 'High' ? 'text-amber-600' :
                              'text-[var(--muted)]'
                            }`}>
                              {rule.severity}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span className={`font-mono text-[11px] font-black tracking-widest uppercase px-3 py-1.5 rounded-lg border ${
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
            </div>
          </div>
        )}
      </section>

      {/* MISSING FIELDS + SUGGESTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-[var(--border)] pt-12">
        <div className="space-y-8">
          <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600 border border-red-100">
               <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-lg text-[var(--text)] italic">Data Deficiencies</h4>
              <p className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-widest">CRITICAL CLINICAL GAPS</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            {result.missing_fields && result.missing_fields.length > 0 ? (
              result.missing_fields.map((field, idx) => (
                <span key={idx} className="px-5 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg font-mono text-[11px] uppercase font-bold tracking-widest shadow-sm">
                  {field.replace(/_/g, ' ')}
                </span>
              ))
            ) : (
              <div className="flex items-center gap-4 text-emerald-600 font-serif font-bold text-lg bg-emerald-50 px-6 py-4 rounded-xl border border-emerald-100 w-full shadow-sm">
                <CheckCircle className="w-6 h-6" />
                <span>All Required Clinical Data Fields Validated</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6">
             <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 border border-amber-100">
               <Lightbulb size={20} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-lg text-[var(--text)] italic">System Optimizations</h4>
              <p className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-widest">AI GENERATED RECOMMENDATIONS</p>
            </div>
          </div>
          <div className="space-y-5 pt-2">
            {result.suggestions && result.suggestions.length > 0 ? (
              result.suggestions.map((s, idx) => (
                <div key={idx} className="flex items-start gap-4 bg-[var(--bg)] p-4 rounded-lg border border-[var(--border)] hover:border-[var(--amber-border)] transition-colors">
                   <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 shrink-0" />
                   <p className="text-[14px] text-[var(--text)] uppercase leading-relaxed font-semibold opacity-90 italic">"{s}"</p>
                </div>
              ))
            ) : (
              <p className="text-[14px] text-[var(--muted)] italic uppercase font-medium">No additional optimization suggested by Audit Engine</p>
            )}
          </div>
        </div>
      </div>

      {/* FINAL ACTION */}
      <div className="pt-8">
        <button 
          onClick={handleDownload}
          className="w-full h-20 bg-[var(--accent)] hover:opacity-95 text-white font-serif font-black text-xl uppercase tracking-[0.15em] transition-all rounded-xl shadow-2xl shadow-[var(--accent)]/30 flex items-center justify-center gap-6 group"
        >
          <FileDown className="w-7 h-7 group-hover:scale-110 transition-transform" /> 
          Generate Full Clinical Audit Report (.xlsx)
        </button>
      </div>

      {showEnhancement && (
        <EnhancementModal
          isOpen={showEnhancement}
          onClose={() => setShowEnhancement(false)}
          baseCase={result}
        />
      )}
    </div>
  );
}
