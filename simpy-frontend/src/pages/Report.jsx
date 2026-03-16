import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, User, ShieldCheck, Activity, Code2, AlertTriangle, FilePlus, Download, BadgeIndianRupee } from 'lucide-react';

export default function Report() {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [fhirBundle, setFhirBundle] = useState(null);
  const [entities, setEntities] = useState(null);
  const [showFhir, setShowFhir] = useState(false);

  useEffect(() => {
    try {
      const storedReport = localStorage.getItem('report');
      const storedFhir = localStorage.getItem('fhir_bundle');
      const storedEntities = localStorage.getItem('entities');
      
      if (storedReport) setReportData(JSON.parse(storedReport)?.report);
      if (storedFhir) setFhirBundle(JSON.parse(storedFhir));
      if (storedEntities) setEntities(JSON.parse(storedEntities));
    } catch (e) {
      console.error("Failed to parse local storage data", e);
    }
  }, []);

  if (!reportData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-2xl border border-slate-200 shadow-sm mt-8 mx-8">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4"><FilePlus className="w-8 h-8 text-slate-300"/></div>
        <p className="text-slate-500 font-medium">No report payload found in cache.</p>
        <button onClick={() => navigate('/app')} className="mt-6 bg-navy text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md hover:bg-slate-800 transition-colors">
          Upload New Document
        </button>
      </div>
    );
  }

  const score = reportData.reconciliation_score || 0;
  const scoreColor = score > 80 ? 'text-green-500' : score >= 50 ? 'text-orange-500' : 'text-red-500';
  const scoreRing = score > 80 ? 'border-green-500 text-green-500' : score >= 50 ? 'border-orange-500 text-orange-500' : 'border-red-500 text-red-500';
  const isApproved = reportData.status === 'approved';

  const getPatientInfo = () => {
    if (!fhirBundle?.entry) return { name: 'Priya Sharma', gender: 'Female' };
    const ptEntry = fhirBundle.entry.find(e => e.resource?.resourceType === 'Patient');
    if (!ptEntry) return { name: 'Priya Sharma', gender: 'Female' };
    const pt = ptEntry.resource;
    return {
      name: pt.name?.[0]?.text || "Unknown Patient",
      gender: pt.gender || "Unknown"
    };
  };

  const patient = getPatientInfo();
  
  const copyToClipboard = () => {
     navigator.clipboard.writeText(JSON.stringify(fhirBundle, null, 2));
     alert("FHIR Bundle JSON copied to clipboard!");
  };

  const downloadJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const dt = document.createElement('a');
    dt.setAttribute("href", dataStr);
    dt.setAttribute("download", "simpy_reconciliation_report.json");
    dt.click();
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-navy tracking-tight">Financial Reconciliation</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadJson} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-navy font-bold text-sm rounded-lg shadow-sm transition-colors">
            <Download className="w-4 h-4" /> Download Report
          </button>
          <button 
            onClick={() => navigate('/app')}
            className="flex items-center gap-2 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-navy font-bold text-sm rounded-lg transition-all"
          >
            ← New Document
          </button>
        </div>
      </div>

      {/* TOP ROW: 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div>
              <span className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1 block">Data Accuracy</span>
              <span className="text-slate-600 text-sm font-medium">Reconciliation Score</span>
          </div>
          <div className={`w-20 h-20 rounded-full border-[6px] flex items-center justify-center font-black text-2xl ${scoreRing}`}>
             {score}
          </div>
        </div>

        <div className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-center ${isApproved ? 'border-green-200' : 'border-red-200'}`}>
          <span className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2">Claim Status</span>
          <div className={`flex items-center gap-3 text-3xl font-black ${isApproved ? 'text-green-600' : 'text-red-600'}`}>
            {isApproved ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
            {isApproved ? 'APPROVED' : 'FLAGGED'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
          <span className="text-slate-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">Detected Billing</span>
          <div className="flex items-center gap-3">
              <span className="text-4xl font-black text-navy tracking-tight">
                ₹{reportData.total_billed?.toLocaleString('en-IN') || 0}
              </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        {/* LEFT COL: Patient & Mismatches */}
        <div className="lg:col-span-1 flex flex-col gap-8">
          {/* Patient Card */}
          <div className="bg-white border border-slate-200 border-l-4 border-l-teal rounded-xl shadow-sm overflow-hidden">
             <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-3 text-navy">
                <User className="w-5 h-5" />
                <h3 className="font-bold tracking-wide">Patient Details</h3>
             </div>
             <div className="p-6 space-y-4 bg-white">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Patient Name</p>
                  <p className="text-navy font-black text-xl capitalize">{patient.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Gender</p>
                    <p className="text-navy font-bold bg-slate-100 inline-block px-3 py-1 rounded text-sm capitalize">{patient.gender}</p>
                  </div>
                </div>
             </div>
          </div>

          {/* Mismatches Summary */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
             <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3 text-red-600">
                    <Activity className="w-5 h-5" />
                    <h3 className="font-bold tracking-wide text-navy">Mismatches Detected</h3>
                </div>
             </div>
             <div className="p-6">
                {(!reportData.mismatches || reportData.mismatches.length === 0) ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <ShieldCheck className="w-12 h-12 text-green-300 mb-3" />
                    <p className="font-bold text-navy text-sm">No mismatches found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reportData.mismatches.map((mismatch, idx) => (
                      <div key={idx} className="bg-white border border-red-200 shadow-sm rounded p-4 flex gap-3 relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-8 h-8 bg-red-50 rounded-bl-full z-0"></div>
                         <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 relative z-10" />
                         <div className="relative z-10 w-full">
                            <h4 className="font-bold text-navy text-sm capitalize border-b border-red-100 pb-1 mb-1">{mismatch.type || 'Discrepancy'}</h4>
                            <p className="text-slate-600 text-xs font-medium">{mismatch.detail || mismatch.details || JSON.stringify(mismatch)}</p>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* RIGHT COL: Data Tables */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1">
               <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-3 text-navy">
                  <h3 className="font-bold tracking-wide">AI Extracted Diagnoses</h3>
               </div>
               <div className="p-0 overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white border-b border-slate-100">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Diagnosis Text</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[120px]">ICD-10 Code</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[100px] text-right">Confidence</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-sm font-medium">
                         {entities?.diagnoses?.map((d, i) => {
                             const conf = d.confidence || 0;
                             const cColor = conf >= 0.8 ? 'text-green-600 bg-green-50 border-green-200' : conf >= 0.6 ? 'text-orange-600 bg-orange-50 border-orange-200' : 'text-red-600 bg-red-50 border-red-200';
                             return (
                             <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-navy capitalize">{d.text || d.description || 'Unknown'}</td>
                                <td className="px-6 py-4">
                                   <span className="font-mono font-bold text-slate-600 px-2 py-1 rounded border border-slate-200 text-xs">
                                     {d.code || 'None'}
                                   </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`font-bold px-2 py-1 rounded border text-[10px] ${cColor}`}>
                                      {Math.round(conf * 100)}%
                                    </span>
                                </td>
                             </tr>
                             )
                         }) || (
                            <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-400 text-sm">No diagnoses found.</td></tr>
                         )}
                      </tbody>
                   </table>
               </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1">
               <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center gap-3 text-navy">
                  <h3 className="font-bold tracking-wide">AI Extracted Procedures</h3>
               </div>
               <div className="p-0 overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white border-b border-slate-100">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Procedure</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[120px] text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-sm font-medium">
                         {entities?.procedures?.map((p, i) => (
                             <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-navy capitalize">{p.text || 'Unknown'}</td>
                                <td className="px-6 py-4 text-right">
                                   <span className="font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] uppercase tracking-wider">
                                     Extracted
                                   </span>
                                </td>
                             </tr>
                         )) || (
                            <tr><td colSpan="2" className="px-6 py-8 text-center text-slate-400 text-sm">No procedures found.</td></tr>
                         )}
                      </tbody>
                   </table>
               </div>
            </div>

        </div>

      </div>

      {/* BOTTOM: Code Block */}
      <div className="bg-[#0A1628] rounded-xl shadow-lg border border-slate-800 overflow-hidden">
        <button 
          onClick={() => setShowFhir(!showFhir)}
          className="w-full px-6 py-5 flex items-center justify-between text-white font-bold transition-colors hover:bg-slate-800/80 group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-teal/20 p-2 rounded border border-teal/30 group-hover:bg-teal group-hover:text-white transition-colors text-teal"><Code2 className="w-5 h-5" /></div>
            <span>View Normalized FHIR R4 JSON Schema</span>
          </div>
          <div className="flex items-center gap-3">
              <span className="text-slate-400 font-mono text-xs">{showFhir ? 'Collapse view -' : 'Expand payload +'}</span>
          </div>
        </button>
        
        {showFhir && fhirBundle && (
          <div className="p-6 overflow-x-auto max-h-[600px] overflow-y-auto bg-[#050B14] border-t border-slate-800 relative group">
            <button onClick={copyToClipboard} className="absolute top-4 right-4 bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity">
               Copy
            </button>
            <pre className="text-teal text-sm font-mono leading-relaxed">
              {JSON.stringify(fhirBundle, null, 2)}
            </pre>
          </div>
        )}
      </div>

    </div>
  );
}
