import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  X,
  Clock,
  User,
  Activity
} from 'lucide-react';
import AuditResult from './AuditResult';

const STATUS_CONFIG = {
  'Approve': { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: CheckCircle },
  'Review': { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: AlertTriangle },
  'Reject': { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', icon: XCircle }
};

const RISK_CONFIG = {
  'Low': { color: 'text-emerald-400' },
  'Medium': { color: 'text-amber-400' },
  'High': { color: 'text-red-400' }
};

export default function AllCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/preauth/cases");
      const data = await res.json();
      if (data.success) {
        setCases(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch cases:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(c => 
    c.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.admission_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.patient_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-2">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search Patient Name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1E293B] border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium text-white focus:outline-none focus:border-blue-500 transition-all shadow-lg"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-3 bg-[#1E293B] border border-slate-700 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:border-slate-500 transition-all uppercase tracking-widest active:scale-95">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-[#1E293B] border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <Activity className="w-12 h-12 text-blue-500 animate-pulse" />
              <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Retrieving Audit History...</p>
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center gap-4">
              <FolderOpen className="w-12 h-12 text-slate-700 mb-2" />
              <h3 className="text-xl font-black text-white">No Cases Found</h3>
              <p className="text-slate-500 text-sm font-medium max-w-xs leading-relaxed">Your audit history is empty. Run a new Pre-Auth Audit to see results here.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#0F172A] border-b border-slate-800">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Case ID's</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Patient Details</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Diagnostic (ICD)</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Decision</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Audit Score</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredCases.map((c, i) => (
                  <tr key={i} className="hover:bg-blue-600/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">{c.patient_id}</p>
                        <p className="text-[10px] font-black text-violet-500 uppercase tracking-tighter">{c.admission_id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/10 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                           <User className="w-4 h-4 text-blue-500 group-hover:text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-tight italic">{c.patient_name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{c.age}Y • {c.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="px-3 py-1 bg-slate-800 rounded text-[10px] font-black text-blue-400 border border-slate-700 shadow-sm">{c.icd_code}</span>
                    </td>
                    <td className="px-6 py-5">
                      {(() => {
                        const s = STATUS_CONFIG[c.decision] || STATUS_CONFIG['Review'];
                        return (
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${s.bg} border ${s.border} ${s.color} rounded-lg shadow-sm`}>
                             <s.icon className="w-3.5 h-3.5" />
                             <span className="text-[10px] font-black uppercase tracking-widest">{c.decision}</span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${(RISK_CONFIG[c.risk_level] || RISK_CONFIG['Medium']).color}`}>
                        {c.risk_level}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1.5 w-24">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-black italic tracking-tighter ${c.completeness_score >= 80 ? 'text-emerald-500' : c.completeness_score >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                            {c.completeness_score}%
                          </span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${c.completeness_score >= 80 ? 'bg-emerald-500' : c.completeness_score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${c.completeness_score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={() => setSelectedCase(c)}
                        className="p-2 transition-all hover:bg-blue-600 rounded-lg group/btn active:scale-90 border border-transparent hover:border-blue-400/50"
                      >
                         <Eye className="w-4 h-4 text-blue-500 group-hover:text-white group-hover/btn:scale-110 transition-all" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Audit Evidence Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setSelectedCase(null)}
          />
          <div className="relative w-full max-w-6xl bg-[#0F172A] border border-slate-700 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Audit Evidence</h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                    System Record: {selectedCase.admission_id} • AI Analysis Generated
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCase(null)}
                className="w-12 h-12 bg-slate-800 hover:bg-red-500 text-slate-400 hover:text-white rounded-2xl flex items-center justify-center transition-all duration-300 group"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="overflow-y-auto p-8 custom-scrollbar">
              <AuditResult result={selectedCase} />
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 bg-[#172133] border-t border-slate-800 text-center shrink-0">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.5em]">Simpy.ai Health-Audit Protocol • V3.2.1-PROD</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
