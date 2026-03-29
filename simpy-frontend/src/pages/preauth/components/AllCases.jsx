import React, { useState, useEffect } from 'react';
import { 
  Search, ArrowUpRight, CheckCircle2, 
  AlertCircle, Clock, Database,
  Activity, FolderOpen, RefreshCcw, ShieldCheck
} from 'lucide-react';
import AuditEvidenceModal from '../../../components/AuditEvidenceModal';

export default function AllCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
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

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'approve': 
      case 'approved': return 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent-border)]';
      case 'reject':
      case 'rejected': return 'bg-[var(--red-light)] text-[var(--red)] border-red-100';
      case 'review':
      case 'pending': return 'bg-[var(--amber-light)] text-[var(--amber)] border-[var(--amber-border)]';
      default: return 'bg-[var(--surface-alt)] text-[var(--muted)] border-[var(--border)]';
    }
  };

  const getRiskStyle = (level) => {
    switch (level?.toLowerCase()) {
      case 'low': return 'text-[var(--accent)]';
      case 'medium': return 'text-[var(--amber)]';
      case 'high': return 'text-[var(--red)]';
      default: return 'text-[var(--muted)]';
    }
  };

  const filteredCases = cases.filter(c => 
    c.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.admission_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.patient_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Search & Stats Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-2">
        <div className="relative w-full md:w-[420px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--mid)]" />
          <input 
            type="text" 
            placeholder="Search by name, patient ID or admission record..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--bg)] border border-[var(--border)] py-3 pl-12 pr-4 text-[13px] rounded-lg focus:outline-none focus:border-[var(--accent)] transition-all font-body text-[var(--text)] placeholder:text-[var(--muted)]"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-3 px-4 py-2 bg-[var(--bg)] rounded-lg border border-[var(--border)]">
            <Database size={16} className="text-[var(--accent)]" />
            <span className="font-mono text-[10px] text-[var(--text)] font-bold uppercase tracking-widest">{cases.length} Audit Records</span>
          </div>
          <button 
            onClick={fetchCases}
            disabled={loading}
            className="p-3 bg-white border border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] rounded-lg transition-all disabled:opacity-50 shadow-sm"
          >
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Professional Table */}
      <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[var(--bg)] border-b border-[var(--border)]">
              <tr>
                <th className="px-8 py-5 font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.2em] font-bold">Patient Details</th>
                <th className="px-8 py-5 font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.2em] font-bold">Case Identity</th>
                <th className="px-8 py-5 font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.2em] font-bold text-center">Status</th>
                <th className="px-8 py-5 font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.2em] font-bold text-center">Risk Level</th>
                <th className="px-8 py-5 font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.2em] font-bold">Audit Accuracy</th>
                <th className="px-8 py-5 font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.2em] font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-8 py-24 text-center">
                    <Activity className="w-10 h-10 text-[var(--accent)] animate-pulse mx-auto mb-6" />
                    <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.3em] font-bold">Indexing clinical database...</p>
                  </td>
                </tr>
              ) : filteredCases.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-24 text-center">
                    <FolderOpen size={40} className="text-[var(--mid)] mx-auto mb-6" />
                    <p className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-[0.2em] font-bold">No matching audit records found</p>
                  </td>
                </tr>
              ) : (
                filteredCases.map((c, i) => (
                  <tr key={i} className="hover:bg-[var(--bg)] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-[15px] font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">{c.patient_name}</span>
                        <span className="text-[11px] text-[var(--muted)] font-medium uppercase mt-1 tracking-tight">{c.gender} &bull; {c.age} YEARS</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-mono text-[10px] text-[var(--text)] font-black tracking-widest bg-[var(--bg)] px-2 py-1 rounded inline-block w-fit border border-[var(--border)]">{c.patient_id}</span>
                        <span className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-tight">{c.admission_id}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-3 py-1.5 border rounded-lg font-mono text-[10px] font-black uppercase tracking-widest ${getStatusStyle(c.decision)}`}>
                        {c.decision}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2.5">
                        <div className={`w-2 h-2 rounded-full shadow-sm ${
                          c.risk_level?.toLowerCase() === 'low' ? 'bg-[var(--accent)]' :
                          c.risk_level?.toLowerCase() === 'medium' ? 'bg-[var(--amber)]' : 'bg-[var(--red)]'
                        }`} />
                        <span className={`font-mono text-[11px] font-black uppercase tracking-widest ${getRiskStyle(c.risk_level)}`}>
                          {c.risk_level}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4 w-40">
                        <div className="flex-1 h-2 bg-[var(--bg)] border border-[var(--border)] rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              c.completeness_score >= 80 ? 'bg-[var(--accent)]' : 
                              c.completeness_score >= 50 ? 'bg-[var(--amber)]' : 'bg-[var(--red)]'
                            }`}
                            style={{ width: `${c.completeness_score}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-[var(--text)] font-black w-8">{c.completeness_score}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => {
                          setSelectedCase(c);
                          setIsModalOpen(true);
                        }}
                        className="p-3 bg-white border border-[var(--border)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] rounded-lg transition-all group-hover:translate-x-1 shadow-sm"
                      >
                        <ArrowUpRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2 pt-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-[var(--accent)]" />
            <span className="font-mono text-[10px] text-[var(--muted)] uppercase font-black tracking-[0.2em]">Compliance Engine v2.4 Active</span>
          </div>
          <div className="hidden md:flex items-center gap-2.5">
             <Activity size={14} className="text-[var(--mid)]" />
             <span className="font-mono text-[10px] text-[var(--muted)] uppercase font-bold">Real-time indexing enabled</span>
          </div>
        </div>
        <p className="font-mono text-[10px] text-[var(--mid)] font-black uppercase tracking-[0.4em]">Simpy.ai &bull; Precision Clinical Analytics</p>
      </div>

      {/* Audit Evidence Modal */}
      {selectedCase && (
        <AuditEvidenceModal 
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCase(null);
          }}
          result={selectedCase}
        />
      )}
    </div>
  );
}
