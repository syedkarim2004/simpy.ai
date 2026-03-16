import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, Search, FilePlus } from 'lucide-react';

export default function History() {
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('doc_history');
      if (stored && JSON.parse(stored).length > 0) {
        setHistoryData(JSON.parse(stored));
      } else {
        // Mock fallback data requested
        setHistoryData([
          { id: "DOC-8923", filename: "tata_memorial_discharge_summary.pdf", patient: "Rajesh Kumar", score: 92, status: "approved", date: "2026-03-16 14:30" },
          { id: "DOC-8924", filename: "apollo_lab_results_03.jpg", patient: "Priya Sharma", score: 45, status: "flagged", date: "2026-03-16 11:15" },
          { id: "DOC-8925", filename: "max_healthcare_prescription.pdf", patient: "Amit Singh", score: 78, status: "flagged", date: "2026-03-15 09:42" }
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const getScoreColor = (score) => {
    if (score > 80) return "bg-green-500";
    if (score >= 50) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStatusStyle = (status) => {
    if (status === 'approved') return "bg-green-50 text-green-700 border-green-200";
    if (status === 'flagged') return "bg-red-50 text-red-700 border-red-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  const filteredData = historyData.filter(row => {
    const matchesFilter = filter === 'All' || (row.status || '').toLowerCase() === filter.toLowerCase();
    const matchesSearch = row.filename.toLowerCase().includes(search.toLowerCase()) || 
                          (row.patient || '').toLowerCase().includes(search.toLowerCase()) || 
                          row.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (historyData.length === 0) {
     return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-2xl border border-slate-200 shadow-sm mt-8 mx-8">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4"><FileText className="w-8 h-8 text-slate-300"/></div>
            <p className="text-slate-500 font-medium">No documents have been processed yet.</p>
            <button onClick={() => navigate('/app')} className="mt-6 bg-teal text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-teal-600 transition-colors">
              Upload your first document →
            </button>
        </div>
     );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
      {/* Table Header controls */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 rounded-t-2xl">
         <div className="relative w-full md:w-[350px]">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by filename or patient..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-navy font-medium focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/30 transition-all shadow-sm"
            />
         </div>
         
         <div className="flex items-center gap-3">
             <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 inline-flex shadow-sm">
                {['All', 'Approved', 'Flagged'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${filter === f ? 'bg-white text-navy shadow-sm border border-slate-200' : 'text-slate-500 hover:text-navy hover:bg-white/50 border border-transparent'}`}
                  >
                    {f}
                  </button>
                ))}
             </div>
         </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white sticky top-0">Doc ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white sticky top-0">Filename</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white sticky top-0">Patient</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white sticky top-0 w-[180px]">Score</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white sticky top-0">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white sticky top-0">Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white sticky top-0 text-right">Actions</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredData.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-5 font-mono text-xs font-bold text-slate-400">{row.id}</td>
                <td className="px-6 py-5 font-bold text-navy flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-teal/10 text-teal flex items-center justify-center shrink-0">
                     <FileText className="w-4 h-4"/>
                  </div>
                  <div className="truncate max-w-[200px]" title={row.filename}>
                    {row.filename}
                  </div>
                </td>
                <td className="px-6 py-5 text-slate-600 font-medium">{row.patient || 'Unknown'}</td>
                <td className="px-6 py-5">
                   <div className="flex items-center gap-3">
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full ${getScoreColor(row.score||0)}`} style={{ width: `${row.score||0}%` }}></div>
                      </div>
                      <span className="text-xs font-black text-navy w-8 text-right">{row.score||0}</span>
                   </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(row.status)}`}>
                     {row.status || 'pending'}
                  </span>
                </td>
                <td className="px-6 py-5 text-slate-400 font-medium text-xs">{row.date ? new Date(row.date).toLocaleDateString() : 'N/A'}</td>
                <td className="px-6 py-5 text-right">
                  <button 
                    onClick={() => navigate('/app/report')}
                    className="inline-flex items-center justify-center w-8 h-8 rounded bg-white border border-slate-200 text-slate-400 shadow-sm group-hover:border-teal group-hover:text-teal group-hover:shadow-teal/20 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="text-center py-12 text-slate-500">No documents found matching criteria.</div>
        )}
      </div>
      
    </div>
  );
}
