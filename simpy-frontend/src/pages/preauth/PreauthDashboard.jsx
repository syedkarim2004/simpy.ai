import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FolderOpen, Clock, CheckCircle, XCircle, 
  Users, Activity, TrendingUp, ChevronRight,
  ShieldCheck, AlertCircle, RefreshCcw,
  BellRing
} from 'lucide-react';
import NewCaseForm from './components/NewCaseForm';
import AllCases from './components/AllCases';

// ── STATUS CONFIGURATION ──
const statusConfig = {
  VERIFIED: { color: 'text-[var(--accent)] border-[var(--accent-border)] bg-[var(--accent-light)]/20', label: 'Verified' },
  IN_REVIEW: { color: 'text-[var(--amber)] border-[var(--amber-border)] bg-[var(--amber-light)]/20', label: 'In Review' },
  PENDING: { color: 'text-[var(--muted)] border-[var(--border)] bg-gray-50', label: 'Pending' }
};

const priorityConfig = {
  HIGH: 'bg-red-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-gray-400'
};

export default function PreauthDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'new-case';
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [toast, setToast] = useState(null);

  // ── STRUCTURED PATIENT STATE ──
  const [activePatients, setActivePatients] = useState([
    { id: 'P-9021', name: 'Aditya Verma', status: 'IN_REVIEW', lastUpdated: Date.now() - 5000, caseType: 'Pre-Auth', priority: 'HIGH' },
    { id: 'P-9022', name: 'Megha Singh', status: 'VERIFIED', lastUpdated: Date.now() - 120000, caseType: 'Enhancement', priority: 'LOW' },
    { id: 'P-9023', name: 'Rajesh Kumar', status: 'PENDING', lastUpdated: Date.now() - 30000, caseType: 'Pre-Auth', priority: 'MEDIUM' }
  ]);

  // ── RE-RENDER TRIGGER FOR TIME-AGO ──
  const [, tick] = useState(0);

  useEffect(() => {
    fetchStats();
    
    // ── REAL-TIME SIMULATION INTERVAL ──
    const interval = setInterval(() => {
      setActivePatients(prev => {
        if (prev.length === 0) return prev;
        
        // Randomly pick ONE patient to update
        const idx = Math.floor(Math.random() * prev.length);
        const patient = prev[idx];
        
        let nextStatus = patient.status;
        if (patient.status === 'PENDING') nextStatus = 'IN_REVIEW';
        else if (patient.status === 'IN_REVIEW') nextStatus = 'VERIFIED';
        else if (patient.status === 'VERIFIED' && Math.random() > 0.8) nextStatus = 'PENDING'; // Periodic reset

        const updated = [...prev];
        updated[idx] = { ...patient, status: nextStatus, lastUpdated: Date.now() };
        return updated;
      });
    }, Math.floor(Math.random() * 4000 + 6000)); // 6-10 seconds

    // ── CLOCK TICK FOR TIME-AGO ──
    const clock = setInterval(() => tick(t => t + 1), 5000);

    return () => {
      clearInterval(interval);
      clearInterval(clock);
    };
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/preauth/cases");
      const data = await res.json();
      if (data.success) {
        setCases(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientClick = (patient) => {
    setSelectedPatientId(patient.id);
    setToast(`Opening case ${patient.id} for ${patient.name}...`);
    setTimeout(() => setToast(null), 3000);
    
    // Optional: Auto-scroll to form
    document.getElementById('case-form-header')?.scrollIntoView({ behavior: 'smooth' });
  };

  const getTimeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    return `${Math.floor(seconds / 60)}m ago`;
  };

  const stats = [
    { 
      label: 'Total Submissions', 
      value: loading ? '...' : String(cases.length).padStart(2, '0'), 
      icon: FolderOpen,
      trend: '+12% from last week'
    },
    { 
      label: 'Pending Review', 
      value: loading ? '...' : String(cases.filter(c => c.decision === 'Review').length).padStart(2, '0'), 
      icon: Clock,
      trend: '4 requiring immediate attention'
    },
    { 
      label: 'Approvals', 
      value: loading ? '...' : String(cases.filter(c => c.decision === 'Approve').length).padStart(2, '0'), 
      icon: CheckCircle,
      trend: '98.2% Accuracy Rate'
    },
    { 
      label: 'Rejections', 
      value: loading ? '...' : String(cases.filter(c => c.decision === 'Reject').length).padStart(2, '0'), 
      icon: XCircle,
      trend: '3% lower than average'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* ── INTERACTIVE TOAST ── */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 px-6 py-3 bg-[var(--text)] text-white font-mono text-[11px] font-bold uppercase tracking-widest rounded-full shadow-2xl z-[500] animate-in slide-in-from-top-4 flex items-center gap-3 border border-white/20">
           <BellRing size={14} className="animate-bounce" />
           {toast}
        </div>
      )}

      {/* ── STATS OVERVIEW ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const StatIcon = stat.icon;
          return (
            <div key={idx} className="bg-white border border-[var(--border)] p-8 rounded-xl hover:border-[var(--accent)] transition-all group relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-[var(--bg)] border border-[var(--border)] rounded-lg flex items-center justify-center text-[var(--muted)] group-hover:bg-[var(--accent)] group-hover:text-white transition-all duration-300">
                  <StatIcon size={22} />
                </div>
                <div className="text-right">
                  <span className="font-mono text-[9px] text-[var(--mid)] font-bold uppercase tracking-widest block">Accuracy Index</span>
                  <span className="font-mono text-[10px] text-[var(--accent)] font-bold uppercase">v2.4 Live</span>
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="font-serif text-4xl font-bold text-[var(--text)] leading-none tracking-tight">
                  {stat.value}
                </h3>
                <p className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-[0.2em] mt-3 font-semibold">{stat.label}</p>
                <div className="mt-6 pt-6 border-t border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-[var(--accent)]" />
                    <span className="text-[11px] text-[var(--muted)] font-medium">{stat.trend}</span>
                  </div>
                  <ChevronRight size={14} className="text-[var(--mid)] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── DYNAMIC CONTENT AREA ── */}
      <div className="transition-all duration-300">
        {activeTab === 'new-case' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Case Submission Form */}
            <div className="lg:col-span-8">
              <div className="bg-white border border-[var(--border)] rounded-xl p-10">
                <div id="case-form-header" className="flex items-center gap-4 mb-10 border-b border-[var(--border)] pb-8">
                  <div className="w-10 h-10 bg-[var(--accent-light)] rounded-lg flex items-center justify-center text-[var(--accent)]">
                    <Activity size={22} />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl text-[var(--text)] font-bold">Case Submission Portal</h2>
                    <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mt-1">AI-DRIVEN CLINICAL PROTOCOL EXTRACTION</p>
                  </div>
                </div>
                <NewCaseForm selectedPatientId={selectedPatientId} activePatients={activePatients} />
              </div>
            </div>

            {/* Right: Active Profiles / Stats Info */}
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-white border border-[var(--border)] rounded-xl p-8">
                <div className="flex items-center justify-between mb-8 border-b border-[var(--border)] pb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono text-[11px] font-bold text-[var(--text)] uppercase tracking-widest">Active Patient Profiles</h3>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  </div>
                  <div className="flex items-center gap-2 text-[var(--mid)]">
                    <span className="font-mono text-[8px] font-bold uppercase tracking-widest">Live Sync Active</span>
                    <RefreshCcw size={12} className="animate-spin-slow" />
                  </div>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {activePatients.length > 0 ? (
                    activePatients.map((p) => {
                      const cfg = statusConfig[p.status];
                      return (
                        <div 
                          key={p.id} 
                          onClick={() => handlePatientClick(p)}
                          className={`flex items-center justify-between p-4 border rounded-lg transition-all cursor-pointer group animate-in slide-in-from-right-2 duration-300 ${
                            selectedPatientId === p.id 
                            ? 'bg-[var(--accent-light)]/40 border-[var(--accent)]' 
                            : 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--accent)]/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 bg-white border border-[var(--border)] rounded-full flex items-center justify-center text-[11px] font-bold text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:border-[var(--accent-border)] transition-all">
                                {p.name.substring(0, 1)}
                              </div>
                              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[var(--bg)] ${priorityConfig[p.priority]}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-[14px] font-semibold text-[var(--text)]">{p.name}</p>
                                <span className="text-[8px] px-1.5 py-0.5 bg-white border border-[var(--border)] text-[var(--muted)] rounded font-mono uppercase font-bold tracking-tighter">{p.caseType}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-tight">{p.id}</p>
                                <span className="w-0.5 h-0.5 bg-[var(--mid)] rounded-full" />
                                <p className="font-mono text-[8px] text-[var(--mid)] uppercase font-bold tracking-widest">
                                  Updated {getTimeAgo(p.lastUpdated)}
                                </p>
                              </div>
                            </div>
                          </div>
                          <span className={`text-[8px] font-mono px-2 py-1 rounded border uppercase tracking-tighter font-black transition-all duration-500 ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                       <div className="w-12 h-12 bg-[var(--bg)] rounded-full flex items-center justify-center mb-4 text-[var(--mid)] border border-[var(--border)] border-dashed">
                          <Users size={20} />
                       </div>
                       <p className="font-mono text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest">No active cases</p>
                       <p className="text-[11px] text-[var(--mid)] mt-1">Upload a new case to begin</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[var(--accent)] rounded-xl p-10 text-white relative overflow-hidden shadow-2xl shadow-[var(--accent)]/10">
                <div className="relative z-10">
                  <h4 className="font-serif text-3xl mb-4 italic leading-tight">Decision Intelligence</h4>
                  <p className="text-[14px] opacity-90 leading-relaxed mb-8 font-light max-w-[200px]">
                    Our AI engine has indexed {cases.length + 4209} claims today with a 99.4% confidence rating.
                  </p>
                  <button className="bg-white text-[var(--accent)] px-6 py-3 rounded-lg font-mono text-[11px] font-bold uppercase tracking-widest hover:translate-x-1 transition-all">
                    View Accuracy Report →
                  </button>
                </div>
                <Activity className="absolute -right-12 -bottom-12 w-56 h-56 opacity-10 rotate-12" />
              </div>
            </div>
          </div>
        ) : activeTab === 'all-cases' ? (
          <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="p-10 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[var(--accent-light)] rounded-lg flex items-center justify-center text-[var(--accent)]">
                  <FolderOpen size={22} />
                </div>
                <div>
                  <h2 className="font-serif text-2xl text-[var(--text)] font-bold">Case Repository</h2>
                  <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mt-1">CENTRALIZED AUDIT TRAIL DATA</p>
                </div>
              </div>
              <div className="flex gap-3">
                 <button className="bg-[var(--bg)] border border-[var(--border)] px-4 py-2 rounded-lg font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all">Filter</button>
                 <button className="bg-[var(--bg)] border border-[var(--border)] px-4 py-2 rounded-lg font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all">Export CSV</button>
              </div>
            </div>
            <div className="p-10">
              <AllCases />
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[var(--border)] rounded-xl p-32 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-[var(--bg)] rounded-full flex items-center justify-center mb-10 border border-[var(--border)]">
              <Clock size={32} className="text-[var(--mid)]" />
            </div>
            <h3 className="font-serif text-3xl text-[var(--text)] mb-4 font-bold">Module Indexing</h3>
            <p className="text-[var(--muted)] max-w-sm text-[15px] leading-relaxed">The system is currently syncing historical {activeTab} data. This view will be fully operational shortly.</p>
          </div>
        )}
      </div>
    </div>
  );
}
