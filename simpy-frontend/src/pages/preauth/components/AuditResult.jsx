import React from 'react';
import { 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileDown, 
  Lightbulb,
  User,
  Activity,
  Stethoscope,
  ChevronRight,
  Info
} from 'lucide-react';

export default function AuditResult({ result }) {
  if (!result) return null;

  const decisionColors = {
    'Approve': 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400',
    'Review': 'bg-amber-500/20 border-amber-500/50 text-amber-400',
    'Reject': 'bg-red-500/20 border-red-500/50 text-red-400'
  };

  const riskColors = {
    'Low': 'text-emerald-400',
    'Medium': 'text-amber-400',
    'High': 'text-red-400'
  };

  const scoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/preauth/download/${result.admission_id}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-${result.admission_id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Top Row — Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Decision Badge */}
        <div className={`rounded-3xl border-2 p-8 flex flex-col items-center justify-center text-center shadow-xl ${decisionColors[result.decision]}`}>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Audit Decision</p>
          <div className="flex items-center gap-3">
            {result.decision === 'Approve' && <CheckCircle2 className="w-8 h-8" />}
            {result.decision === 'Review' && <AlertTriangle className="w-8 h-8" />}
            {result.decision === 'Reject' && <XCircle className="w-8 h-8" />}
            <h3 className="text-4xl font-black uppercase tracking-tighter italic">{result.decision}D</h3>
          </div>
        </div>

        {/* Risk Level */}
        <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Clinical Risk Assessment</p>
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 ${riskColors[result.risk_level]}`}>
              <Shield className="w-8 h-8" />
            </div>
            <div className="text-left">
              <h4 className={`text-3xl font-black ${riskColors[result.risk_level]}`}>{result.risk_level}</h4>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Risk Category</p>
            </div>
          </div>
        </div>

        {/* Completeness Score */}
        <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Activity className="w-24 h-24" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Documentation Integrity</p>
          <div className="relative inline-flex items-center justify-center">
            <span className={`text-5xl font-black italic tracking-tighter ${scoreColor(result.completeness_score)}`}>
              {result.completeness_score}%
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Completeness Score</p>
        </div>
      </div>

      {/* Middle Row — Patient Details */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-8 py-6 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-black text-white tracking-tight">Patient Clinical Profile</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Case ID:</span>
            <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-bold">{result.patient_id}</span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Admission ID:</span>
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs font-bold">{result.admission_id}</span>
          </div>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</p>
            <p className="text-sm font-bold text-white">{result.patient_name}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Demographics</p>
            <p className="text-sm font-bold text-white">{result.age} Yrs / {result.gender}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Insurance Provider</p>
            <p className="text-sm font-bold text-emerald-400">{result.insurance_provider}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Terminal Diagnosis Codes</p>
            <div className="flex items-center gap-2">
               <span className="px-2 py-0.5 bg-blue-600 text-white rounded font-black text-[10px]">{result.icd_code}</span>
               <p className="text-xs font-medium text-slate-300 truncate">{result.diagnosis}</p>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 pt-0">
          <div className="p-6 bg-[#0F172A]/50 rounded-2xl border border-slate-700/50 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Proposed Treatment Workflow</p>
              <p className="text-sm font-medium text-slate-300 leading-relaxed italic">"{result.proposed_treatment}"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row — Missing Fields & Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Missing Fields */}
        <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-8 flex flex-col shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Info className="w-5 h-5 text-red-500" />
            <h4 className="text-lg font-black text-white tracking-tight">Data Completeness Gaps</h4>
          </div>
          
          <div className="flex-1 flex flex-wrap gap-2 items-start content-start">
            {result.missing_fields && result.missing_fields.length > 0 ? (
              result.missing_fields.map((field, idx) => (
                <span key={idx} className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-2">
                  <ChevronRight className="w-3 h-3" /> {field}
                </span>
              ))
            ) : (
              <div className="w-full flex flex-col items-center justify-center py-10 opacity-60">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
                <p className="text-emerald-500 font-black uppercase tracking-widest text-xs">All critical fields captured</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-8 flex flex-col shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h4 className="text-lg font-black text-white tracking-tight">AI Audit Intelligence</h4>
          </div>
          
          <ul className="space-y-4">
            {result.suggestions && result.suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-4 group">
                <div className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center shrink-0 group-hover:bg-amber-500/30 transition-colors">
                  <span className="text-[10px] font-black text-amber-500">{idx + 1}</span>
                </div>
                <p className="text-sm font-medium text-slate-300 leading-relaxed group-hover:text-white transition-colors">{suggestion}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-4">
        <button 
          onClick={handleDownloadExcel}
          className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 transition-all hover:scale-105"
        >
          <FileDown className="w-5 h-5" /> Download Comprehensive Excel Report
        </button>
      </div>
    </div>
  );
}
