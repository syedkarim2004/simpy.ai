import React from 'react';
import { 
  ShieldCheck, 
  Shield, 
  ShieldAlert, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileDown, 
  Lightbulb,
  User,
  FileText,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function AuditResult({ result }) {
  if (!result) return null;

  const decisionConfig = {
    'Approve': {
      bg: 'bg-emerald-500',
      text: 'text-white',
      icon: CheckCircle,
      label: '✓ APPROVED'
    },
    'Review': {
      bg: 'bg-amber-500',
      text: 'text-white',
      icon: AlertTriangle,
      label: '⚠ REVIEW REQUIRED'
    },
    'Reject': {
      bg: 'bg-red-500',
      text: 'text-white',
      icon: XCircle,
      label: '✗ REJECTED'
    }
  };

  const riskConfig = {
    'Low': { color: 'text-emerald-400', border: 'border-emerald-500/50', icon: ShieldCheck, label: 'LOW RISK' },
    'Medium': { color: 'text-amber-400', border: 'border-amber-500/50', icon: Shield, label: 'MEDIUM RISK' },
    'High': { color: 'text-red-400', border: 'border-red-500/50', icon: ShieldAlert, label: 'HIGH RISK' }
  };

  const config = decisionConfig[result.decision] || decisionConfig['Review'];
  const risk = riskConfig[result.risk_level] || riskConfig['Medium'];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
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
    <div className="bg-[#0F172A] p-2 space-y-6 animate-in fade-in duration-700">
      {/* ROW 1 — Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${config.bg} ${config.text} rounded-3xl p-8 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden group`}>
          <config.icon className="w-12 h-12 mb-4 animate-pulse" />
          <h3 className="text-3xl font-black italic tracking-tighter mb-2">{config.label}</h3>
          <p className="text-xs font-medium opacity-80 max-w-[200px] leading-relaxed">{result.reasoning}</p>
        </div>

        <div className={`bg-[#1E293B] border-2 ${risk.border} rounded-3xl p-8 shadow-xl flex flex-col items-center justify-center text-center`}>
          <risk.icon className={`w-12 h-12 mb-4 ${risk.color}`} />
          <h3 className={`text-2xl font-black tracking-tighter ${risk.color}`}>{risk.label}</h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Clinical Vulnerability</p>
        </div>

        <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-8 shadow-xl flex flex-col items-center justify-center text-center">
          <h3 className={`text-5xl font-black italic tracking-tighter mb-2 ${getScoreColor(result.completeness_score)}`}>
            {result.completeness_score}%
          </h3>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Form Completeness</p>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${
                result.completeness_score >= 80 ? 'bg-emerald-500' : 
                result.completeness_score >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${result.completeness_score}%` }}
            />
          </div>
        </div>
      </div>

      {/* ROW 2 — Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1E293B] rounded-3xl p-8 border border-slate-700 shadow-xl">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
            <User className="w-5 h-5 text-blue-500" />
            <h4 className="text-lg font-black text-white uppercase tracking-tight">Patient & Case Details</h4>
          </div>
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Patient ID</p>
              <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-black">{result.patient_id}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Admission ID</p>
              <span className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-lg text-xs font-black">{result.admission_id}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Name / Age / Gender</p>
              <p className="text-sm font-bold text-white uppercase tracking-tight">{result.patient_name} / {result.age}Y / {result.gender}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Insurance Provider</p>
              <p className="text-sm font-bold text-emerald-400">{result.insurance_provider}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">TPA / Policy Number</p>
              <p className="text-sm font-bold text-white">{result.tpa_name} / {result.policy_number}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-3xl p-8 border border-slate-700 shadow-xl">
          <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h4 className="text-lg font-black text-white uppercase tracking-tight">Clinical Findings</h4>
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Diagnosis</p>
                <p className="text-sm font-bold text-white">{result.diagnosis}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">ICD Code</p>
                <span className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-black">{result.icd_code}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Proposed Treatment</p>
              <p className="text-sm font-medium text-slate-300 italic">{result.proposed_treatment}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">AI Reasoning</p>
              <p className="text-xs font-medium text-slate-400 leading-relaxed italic border-l-2 border-slate-700 pl-4">"{result.reasoning}"</p>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3 — Intelligence Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1E293B] rounded-3xl p-8 border border-slate-700 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h4 className="text-lg font-black text-white uppercase tracking-tight">Missing Fields</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.missing_fields && result.missing_fields.length > 0 ? (
              result.missing_fields.map((field, idx) => (
                <span key={idx} className="px-3 py-1 bg-red-900/40 border border-red-500/30 text-red-300 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {field.replace(/_/g, ' ')}
                </span>
              ))
            ) : (
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-widest">All required fields present</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-3xl p-8 border border-slate-700 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h4 className="text-lg font-black text-white uppercase tracking-tight">AI Suggestions</h4>
          </div>
          <div className="space-y-3">
            {result.suggestions && result.suggestions.length > 0 ? (
              result.suggestions.map((s, idx) => (
                <div key={idx} className={`flex items-start gap-3 pb-3 ${idx < result.suggestions.length - 1 ? 'border-b border-slate-800' : ''}`}>
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-slate-400">{s}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-600 italic">No additional suggestions generated</p>
            )}
          </div>
        </div>
      </div>

      {/* ROW 4 — Actions */}
      <button 
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-3 py-5 bg-[#10B981] hover:bg-[#059669] text-white font-black rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-[0.98] uppercase tracking-[0.2em]"
      >
        <FileDown className="w-6 h-6" /> Download Excel Audit Report
      </button>
    </div>
  );
}
