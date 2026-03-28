import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  FolderOpen, 
  Clock, 
  CheckCircle, 
  XCircle, 
  LayoutDashboard, 
  LogOut, 
  ShieldCheck,
  Search,
  Bell,
  User
} from 'lucide-react';
import NewCaseForm from './components/NewCaseForm';
import AllCases from './components/AllCases';

export default function PreauthDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('new-case');
  const [user, setUser] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('simpy_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    fetchStats();
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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const menuItems = [
    { id: 'new-case', label: 'New Case', icon: Plus },
    { id: 'all-cases', label: 'All Cases', icon: FolderOpen },
    { id: 'pending', label: 'Pending', icon: Clock },
    { id: 'approved', label: 'Approved', icon: CheckCircle },
    { id: 'rejected', label: 'Rejected', icon: XCircle },
  ];

  const stats = [
    { 
      label: 'Total Cases', 
      value: loading ? '...' : String(cases.length).padStart(2, '0'), 
      color: 'blue', 
      icon: FolderOpen 
    },
    { 
      label: 'Pending Review', 
      value: loading ? '...' : String(cases.filter(c => c.decision === 'Review').length).padStart(2, '0'), 
      color: 'amber', 
      icon: Clock 
    },
    { 
      label: 'Approved Today', 
      value: loading ? '...' : String(cases.filter(c => c.decision === 'Approve').length).padStart(2, '0'), 
      color: 'green', 
      icon: CheckCircle 
    },
  ];

  return (
    <div className="flex h-screen bg-[#0F172A] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-[#1E293B]/50 border-r border-slate-800 flex flex-col pt-8 backdrop-blur-xl">
        <div className="px-8 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white leading-none">Simpy.ai</h1>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1">Pre-Auth Audit</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-800 bg-[#0F172A]/40 mt-auto">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-slate-800 shadow-xl overflow-hidden">
              {user?.picture ? (
                <img src={user.picture} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white truncate">{user?.name || 'Pre-Auth User'}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter truncate">{user?.email || 'admin@hospital.com'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 text-xs font-black uppercase tracking-widest border border-slate-700 transition-all duration-300"
          >
            <LogOut className="w-4 h-4" /> Logout System
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-slate-800 px-10 flex items-center justify-between bg-[#0F172A]/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4 text-slate-400">
            <LayoutDashboard className="w-5 h-5 text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Workspace</span>
            <span className="w-1 h-1 rounded-full bg-slate-700 mx-2" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Pre-Auth Audit System</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative group hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search Cases, IDs..."
                className="bg-slate-900/50 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 w-64 transition-all"
              />
            </div>
            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700 transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border border-slate-900" />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
          <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stats.map((stat, idx) => {
                const StatIcon = stat.icon;
                const colors = {
                  blue: 'from-blue-500/20 to-indigo-500/5 border-blue-500/20 text-blue-400',
                  amber: 'from-amber-500/20 to-orange-500/5 border-amber-500/20 text-amber-400',
                  green: 'from-emerald-500/20 to-teal-500/5 border-emerald-500/20 text-emerald-400'
                };
                return (
                  <div key={idx} className={`relative overflow-hidden bg-gradient-to-br ${colors[stat.color]} border rounded-2xl p-6 group hover:scale-[1.02] transition-transform duration-300 shadow-lg`}>
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                      </div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/10`}>
                        <StatIcon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dynamic View */}
            <div className="animate-in fade-in duration-500">
              {activeTab === 'new-case' && <NewCaseForm />}
              {activeTab === 'all-cases' && <AllCases />}
              {['pending', 'approved', 'rejected'].includes(activeTab) && (
                <div className="bg-[#1E293B] border border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                    <Clock className="w-10 h-10 text-slate-500" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">Filtered Views coming soon</h3>
                  <p className="text-slate-400 max-w-sm font-medium">We're indexing your current cases. This section will allow you to quickly access {activeTab} audits.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
