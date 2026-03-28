import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  ExternalLink
} from 'lucide-react';
import AuditResult from './AuditResult';

export default function AllCases() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingCase, setViewingCase] = useState(null);

  const mockCases = [
    {
      patient_id: "SIMPY-UID-001",
      admission_id: "ADM-9842",
      patient_name: "Rahul Sharma",
      icd_code: "I10",
      diagnosis: "Essential (primary) hypertension",
      decision: "Approve",
      risk_level: "Low",
      completeness_score: 95,
      date: "2024-03-27",
      insurance_provider: "Star Health",
      proposed_treatment: "Medical management and stabilization"
    },
    {
      patient_id: "SIMPY-UID-015",
      admission_id: "ADM-7215",
      patient_name: "Anita Verma",
      icd_code: "E11.9",
      diagnosis: "Type 2 diabetes mellitus without complications",
      decision: "Review",
      risk_level: "Medium",
      completeness_score: 62,
      date: "2024-03-26",
      insurance_provider: "Apollo Munich",
      proposed_treatment: "Insulin titration and monitoring",
      missing_fields: ["HbA1c Report", "Previous Hospitalization Records"],
      suggestions: ["Request last 3 months sugar logs", "Verify insulin prescription authenticity"]
    },
    {
      patient_id: "SIMPY-UID-042",
      admission_id: "ADM-3310",
      patient_name: "George Kutty",
      icd_code: "N18.9",
      diagnosis: "Chronic kidney disease, unspecified",
      decision: "Reject",
      risk_level: "High",
      completeness_score: 45,
      date: "2024-03-25",
      insurance_provider: "HDFC ERGO",
      proposed_treatment: "Dialysis and renal transplant consultation",
      missing_fields: ["Creatinine clearance test", "Renal biopsy report", "TPA authorization"],
      suggestions: ["Significant clinical documentation gap", "Treatment necessity not fully established"]
    }
  ];

  const filteredCases = mockCases.filter(c => 
    c.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.admission_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Table Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative group max-w-md w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Filter by Name, ID or ICD Code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1E293B] border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-blue-500 transition-all text-white"
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1E293B] border border-slate-700 rounded-2xl text-slate-400 hover:text-white transition-all text-xs font-black uppercase tracking-widest">
          <Filter className="w-4 h-4" /> Filter Advanced
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700">
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Patient Details</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">ICD Code</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Audit Decision</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Risk</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Score</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredCases.map((c, idx) => (
                <tr key={idx} className="hover:bg-blue-600/5 transition-colors cursor-default group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{c.patient_name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-500">{c.admission_id}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <span className="text-[10px] font-bold text-slate-500 tracking-tighter">{c.date}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded text-[10px] font-black">{c.icd_code}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      c.decision === 'Approve' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      c.decision === 'Review' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                      'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      {c.decision}D
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${
                         c.risk_level === 'Low' ? 'bg-emerald-500' :
                         c.risk_level === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                       }`} />
                       <span className="text-xs font-bold text-white uppercase tracking-widest">{c.risk_level}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={`text-sm font-black italic tracking-tighter ${
                      c.completeness_score >= 80 ? 'text-emerald-500' :
                      c.completeness_score >= 60 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {c.completeness_score}%
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button 
                      onClick={() => setViewingCase(c)}
                      className="p-2.5 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl transition-all shadow-lg border border-slate-700"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewingCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0F172A] w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800 shadow-2xl p-10 relative custom-scrollbar">
            <button 
              onClick={() => setViewingCase(null)}
              className="absolute top-8 right-8 p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-400 hover:text-white transition-all z-10"
            >
              <XCircle className="w-6 h-6" />
            </button>
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-2">
                <FileText className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Detailed Audit Evidence</h2>
              </div>
              <p className="text-slate-500 font-medium text-sm">Full clinical validation records for admission {viewingCase.admission_id}</p>
            </div>
            <AuditResult result={viewingCase} />
          </div>
        </div>
      )}
    </div>
  );
}
