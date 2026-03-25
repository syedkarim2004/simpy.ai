import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, User, ShieldCheck, Activity, Code2, AlertTriangle, FilePlus, Download, CheckCircle2, ChevronDown, ChevronUp, Info } from 'lucide-react';

function cleanMismatchMessage(msg) {
  if (!msg) return msg;
  return msg
    .replace(/'\'\{.*?'code':\s*'([^']+)'.*?\}\'/g, "'$1'")
    .replace(/\{['"]* *code['"] *: *['"]* *([^'"\}\s]+)['"]* *\}/g, '$1');
}

export default function Report() {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [fhirBundle, setFhirBundle] = useState(null);
  const [entities, setEntities] = useState(null);
  const [showFhir, setShowFhir] = useState(false);
  const [expandedMismatches, setExpandedMismatches] = useState({});
  const [activeTab, setActiveTab] = useState('reconciliation');
  const [claimData, setClaimData] = useState(null);
  const [validationReport, setValidationReport] = useState(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const toggleMismatch = (idx) => {
    setExpandedMismatches(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const getExplanation = (type) => {
    switch(type) {
      case 'missing_diagnosis':
        return "This diagnosis was billed but not found in clinical records. This can cause compliance issues or audit failures.";
      case 'unbilled_diagnosis':
        return "This diagnosis exists in clinical records but is not billed. This may lead to revenue loss.";
      case 'missing_procedure':
        return "This procedure was billed but not found in clinical records. This can trigger payer audits and denials.";
      case 'unbilled_procedure':
        return "This procedure was performed but not included in billing. This can cause underbilling.";
      default:
        return "This highlights a discrepancy between what was documented clinically versus what was submitted for billing.";
    }
  };

  useEffect(() => {
    try {
      const storedReport = localStorage.getItem('report');
      const storedFhir = localStorage.getItem('fhir_bundle');
      const storedEntities = localStorage.getItem('entities');
      
      if (storedReport) setReportData(JSON.parse(storedReport)?.report);
      if (storedFhir) setFhirBundle(JSON.parse(storedFhir));
      if (storedEntities) setEntities(JSON.parse(storedEntities));
      
      const storedClaim = localStorage.getItem('claim_data');
      const storedValidation = localStorage.getItem('validation_report');
      if (storedClaim) setClaimData(JSON.parse(storedClaim));
      if (storedValidation) setValidationReport(JSON.parse(storedValidation));
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

  /* ── Real reconciliation summary from actual data ───────────── */
  const diagnosesRaw = entities?.diagnosis || entities?.diagnoses || [];
  const totalDiagnoses = diagnosesRaw.length;
  const icdMapped = diagnosesRaw.filter(d => {
    const code = d?.icd_code || d?.icd10_code || d?.code || d?.icd10?.code;
    return code && code !== 'None' && code !== 'UNKNOWN' && code.trim() !== '';
  }).length;
  const mismatchesFound = Array.isArray(reportData.mismatches) ? reportData.mismatches.length : 0;

  const getPatientInfo = () => {
    if (!fhirBundle?.entry) return { name: 'Unknown Patient', gender: 'unknown' };
    const ptEntry = fhirBundle.entry.find(e => e.resource?.resourceType === 'Patient');
    if (!ptEntry) return { name: 'Unknown Patient', gender: 'unknown' };
    const pt = ptEntry.resource;
    // Also pull from entities if available
    const entPatient = entities?.patient || {};
    const rawGender = pt.gender || entPatient.gender || entPatient.sex || entPatient.demographics?.gender || 'unknown';
    const rawDate = entPatient.report_date;
    const reportDate = rawDate
      ? new Date(rawDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : null;
    return {
      name: pt.name?.[0]?.text || entPatient.name || 'Unknown Patient',
      gender: rawGender,
      age: entPatient.age || entPatient.demographics?.age || null,
      reportDate,
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
          <h1 className="text-3xl font-black text-navy tracking-tight">Clinical Intelligence Report</h1>
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

        {/* Card 3 — Reconciliation Summary (real data, no hardcoded values) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-center gap-3">
          <span className="text-slate-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Reconciliation Summary
          </span>
          <div className="grid grid-cols-3 gap-2 mt-1">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-navy">{totalDiagnoses}</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-tight mt-0.5">Diagnoses</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-teal">{icdMapped}</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-tight mt-0.5">ICD Mapped</span>
            </div>
            <div className="flex flex-col">
              <span className={`text-2xl font-black ${mismatchesFound > 0 ? 'text-orange-500' : 'text-green-500'}`}>{mismatchesFound}</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider leading-tight mt-0.5">Mismatches</span>
            </div>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex gap-1 bg-white rounded-xl border border-slate-200 shadow-sm p-1.5 mb-8">
        {[
          { id: 'reconciliation', label: 'Reconciliation', icon: '⚖️' },
          { id: 'claim', label: 'Claim Summary', icon: '📋' },
          { id: 'validation', label: 'Validation', icon: '🔍' },
          { id: 'review', label: 'Human Review', icon: '👤' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2
              ${activeTab === tab.id 
                ? 'bg-navy text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-navy'}
            `}
          >
            <span>{tab.icon}</span> {tab.label}
            {tab.id === 'validation' && validationReport && (
              <span className={`ml-1 text-[10px] font-black px-1.5 py-0.5 rounded-full ${validationReport.summary?.errors > 0 ? 'bg-red-100 text-red-600' : validationReport.summary?.warnings > 0 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                {validationReport.summary?.total_issues || 0}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* RECONCILIATION TAB CONTENT */}
      {activeTab === 'reconciliation' && (<>

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
                    {(() => {
                      const g = (patient.gender || 'unknown').toLowerCase();
                      const isKnown = g === 'male' || g === 'female';
                      const cls = isKnown
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200';
                      return (
                        <span className={`inline-block px-3 py-1 rounded text-sm font-bold capitalize ${cls}`}>
                          {g.charAt(0).toUpperCase() + g.slice(1)}
                        </span>
                      );
                    })()}
                  </div>
                  {patient.age && (
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Age</p>
                      <p className="text-navy font-bold text-sm">{patient.age} yrs</p>
                    </div>
                  )}
                </div>
                {patient.reportDate && (
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Report Date</p>
                    <p className="text-navy font-bold text-sm">{patient.reportDate}</p>
                  </div>
                )}
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
                      <div key={idx} className="bg-white border border-red-200 shadow-sm rounded-lg p-4 flex flex-col gap-3 relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-8 h-8 bg-red-50 rounded-bl-full z-0"></div>
                         
                         <div className="flex gap-3 relative z-10 w-full">
                           <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                           <div className="w-full flex justify-between items-start">
                               <div>
                                 <h4 className="font-bold text-navy text-sm capitalize border-b border-red-100 pb-1 mb-1 inline-block">{(mismatch.type || 'Discrepancy').replace(/_/g, ' ')}</h4>
                                 <p className="text-slate-600 text-xs font-medium mt-1">{cleanMismatchMessage(mismatch.detail || mismatch.details || JSON.stringify(mismatch))}</p>
                               </div>
                               <button 
                                 onClick={() => toggleMismatch(idx)}
                                 className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-navy hover:bg-slate-100 rounded-md transition-colors border border-slate-200 bg-white shadow-sm shrink-0 ml-4"
                               >
                                 <Info className="w-3.5 h-3.5 text-teal" /> Explain
                               </button>
                           </div>
                         </div>
                         
                         {/* Expanded Explanation */}
                         {expandedMismatches[idx] && (
                           <div className="mt-2 ml-8 p-3 bg-red-50/50 border border-red-100 rounded text-xs font-medium text-slate-700 animate-fade-in relative z-10">
                              {getExplanation(mismatch.type)}
                           </div>
                         )}
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
                         {(entities?.diagnosis || entities?.diagnoses)?.map((d, i) => {
                             const conf = d.confidence || 0;
                             const confPct = conf > 1 ? conf : Math.round(conf * 100);
                             const cColor = confPct >= 80 ? 'text-green-600 bg-green-50 border-green-200' : confPct >= 60 ? 'text-orange-600 bg-orange-50 border-orange-200' : 'text-red-600 bg-red-50 border-red-200';
                             return (
                             <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 capitalize">
                                   <div className="flex flex-col">
                                      <span className="text-navy font-bold">{d.text || d.name || d.diagnosis_text || d.description || 'Unknown'}</span>
                                      {d.evidence && (
                                        <div className="mt-1 flex flex-col gap-1">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-black text-teal uppercase tracking-tight bg-teal/5 px-1.5 py-0.5 rounded border border-teal/10">Evidence</span>
                                            <span className="text-[10px] text-slate-500 font-medium italic">
                                              {d.evidence.reason}
                                            </span>
                                          </div>
                                          {d.evidence.values && (
                                            <div className="flex gap-2 flex-wrap">
                                              {Object.entries(d.evidence.values).map(([k, v], idx) => (
                                                <span key={idx} className="text-[9px] text-slate-400 font-bold bg-slate-50 px-1 rounded border border-slate-100">
                                                  {k}: {v}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                   </div>
                                </td>
                                 <td className="px-6 py-4">
                                    {(() => {
                                      const raw = d.icd_code || d.icd10_code || d.code || d.coding?.code || d.icd10?.code || null;
                                      const code = (raw && raw !== 'UNKNOWN' && raw !== 'None') ? raw : null;
                                      return code
                                        ? <span className="font-mono font-bold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200 text-xs">{code}</span>
                                        : <span className="text-slate-400 text-xs font-medium">—</span>;
                                    })()}
                                 </td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`font-bold px-2 py-1 rounded border text-[10px] ${cColor}`}>
                                      {confPct}%
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
                                <td className="px-6 py-4 text-navy capitalize">{p.text || p.name || p.procedure_name || 'Unknown'}</td>
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

      </>)}

      {/* ═══ CLAIM SUMMARY TAB ═══ */}
      {activeTab === 'claim' && claimData && (
        <div className="space-y-6 mb-8">
          {/* Claim Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Claim ID</span>
              <p className="text-lg font-black text-navy mt-1 font-mono">{claimData.claim_id}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Diagnosis Charges</span>
              <p className="text-2xl font-black text-teal mt-1">₹{claimData.financials?.diagnosis_charges?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Procedure Charges</span>
              <p className="text-2xl font-black text-blue-600 mt-1">₹{claimData.financials?.procedure_charges?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-gradient-to-r from-navy to-slate-800 border border-slate-700 rounded-xl p-5 shadow-sm">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Estimated</span>
              <p className="text-2xl font-black text-white mt-1">₹{claimData.financials?.total_estimated_charges?.toLocaleString() || 0}</p>
            </div>
          </div>

          {/* Diagnosis Lines */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
              <h3 className="font-bold text-navy">Diagnosis Claim Lines</h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">ICD-10</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Charge (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm font-medium">
                {claimData.diagnosis_lines?.map((line, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-navy capitalize">{line.description}</td>
                    <td className="px-6 py-4">
                      <span className={`font-mono font-bold px-2 py-1 rounded text-xs ${line.icd_code !== 'UNKNOWN' ? 'text-green-700 bg-green-50 border border-green-200' : 'text-red-500 bg-red-50 border border-red-200'}`}>
                        {line.icd_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-navy">₹{line.charge?.toLocaleString()}</td>
                  </tr>
                )) || <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-400 text-sm">No diagnosis lines</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Procedure Lines */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
              <h3 className="font-bold text-navy">Procedure Claim Lines</h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">CPT Code</th>
                  <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Charge (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm font-medium">
                {claimData.procedure_lines?.map((line, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-navy capitalize">{line.description}</td>
                    <td className="px-6 py-4">
                      <span className={`font-mono font-bold px-2 py-1 rounded text-xs ${line.cpt_code !== 'UNKNOWN' ? 'text-blue-700 bg-blue-50 border border-blue-200' : 'text-red-500 bg-red-50 border border-red-200'}`}>
                        {line.cpt_code}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-navy">₹{line.charge?.toLocaleString()}</td>
                  </tr>
                )) || <tr><td colSpan="3" className="px-6 py-8 text-center text-slate-400 text-sm">No procedure lines</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Coding Completeness */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-navy mb-4">Coding Completeness</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-black text-navy">{claimData.coding_completeness?.total_diagnoses || 0}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Diagnoses</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-green-600">{claimData.coding_completeness?.icd_coded || 0}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">ICD-10 Coded</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-navy">{claimData.coding_completeness?.total_procedures || 0}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Procedures</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-blue-600">{claimData.coding_completeness?.cpt_coded || 0}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">CPT Coded</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'claim' && !claimData && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 font-medium mb-8">
          No claim data available. Re-process the document to generate claim.
        </div>
      )}

      {/* ═══ VALIDATION TAB ═══ */}
      {activeTab === 'validation' && validationReport && (
        <div className="space-y-6 mb-8">
          {/* Validation Score */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Score</span>
              <p className={`text-3xl font-black mt-1 ${validationReport.validation_score >= 80 ? 'text-green-600' : validationReport.validation_score >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                {validationReport.validation_score}/100
              </p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Status</span>
              <p className={`text-lg font-black mt-1 uppercase ${
                validationReport.status === 'passed' ? 'text-green-600' :
                validationReport.status === 'passed_with_warnings' ? 'text-orange-500' : 'text-red-500'
              }`}>{validationReport.status?.replace(/_/g, ' ')}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
              <span className="text-[10px] text-red-400 font-black uppercase tracking-widest">Errors</span>
              <p className="text-3xl font-black text-red-600 mt-1">{validationReport.summary?.errors || 0}</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 shadow-sm">
              <span className="text-[10px] text-orange-400 font-black uppercase tracking-widest">Warnings</span>
              <p className="text-3xl font-black text-orange-600 mt-1">{validationReport.summary?.warnings || 0}</p>
            </div>
          </div>

          {/* Issues List */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
              <h3 className="font-bold text-navy">Validation Issues ({validationReport.issues?.length || 0})</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {validationReport.issues?.map((issue, i) => (
                <div key={i} className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                  <span className={`shrink-0 mt-0.5 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                    issue.severity === 'error' ? 'bg-red-100 text-red-600 border border-red-200' :
                    issue.severity === 'warning' ? 'bg-orange-100 text-orange-600 border border-orange-200' :
                    'bg-blue-100 text-blue-600 border border-blue-200'
                  }`}>{issue.severity}</span>
                  <div className="flex-1">
                    <p className="font-bold text-navy text-sm">{issue.message}</p>
                    <p className="text-slate-400 text-xs mt-1">{issue.impact}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{issue.code}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">{issue.resource}</span>
                    </div>
                  </div>
                </div>
              )) || <div className="px-6 py-8 text-center text-slate-400 text-sm">No issues found — all checks passed!</div>}
            </div>
          </div>

          {/* Resources Found */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-navy mb-4">FHIR Resource Coverage</h3>
            <div className="flex flex-wrap gap-3">
              {validationReport.resources_found && Object.entries(validationReport.resources_found).map(([k, v]) => (
                <span key={k} className={`px-3 py-2 rounded-lg font-bold text-xs ${
                  v ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-500 border border-red-200'
                }`}>
                  {v ? '✅' : '❌'} {k}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      {activeTab === 'validation' && !validationReport && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 font-medium mb-8">
          No validation data available. Re-process the document to generate validation report.
        </div>
      )}

      {/* ═══ HUMAN REVIEW TAB ═══ */}
      {activeTab === 'review' && (
        <div className="space-y-6 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-navy">Human Augmentation — Review Diagnoses</h3>
              {feedbackSent && (
                <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-200">✅ Feedback Submitted</span>
              )}
            </div>
            <div className="divide-y divide-slate-50">
              {(entities?.diagnosis || entities?.diagnoses || []).map((d, i) => {
                const diagText = d.text || d.name || d.diagnosis_text || 'Unknown';
                const icdCode = d.icd_code || d.icd10_code || d.icd10?.code || 'UNKNOWN';
                return (
                  <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-navy">{i+1}.</span>
                      <div>
                        <p className="font-bold text-navy text-sm capitalize">{diagText}</p>
                        <span className="font-mono text-[10px] text-slate-400">{icdCode}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-green-50 text-green-600 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors">
                        ✓ Accept
                      </button>
                      <button className="px-3 py-1.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg text-xs font-bold hover:bg-orange-100 transition-colors">
                        ✎ Edit
                      </button>
                      <button className="px-3 py-1.5 bg-red-50 text-red-500 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                        ✕ Flag
                      </button>
                    </div>
                  </div>
                );
              })}
              {(!entities?.diagnosis?.length && !entities?.diagnoses?.length) && (
                <div className="px-6 py-8 text-center text-slate-400 text-sm">No diagnoses to review.</div>
              )}
            </div>
          </div>

          <button
            onClick={async () => {
              try {
                await fetch('http://localhost:8000/feedback', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    report_id: localStorage.getItem('fhir_id') || 'unknown',
                    corrections: [],
                    reviewer: 'dashboard_user'
                  })
                });
                setFeedbackSent(true);
              } catch(e) { console.error(e); }
            }}
            disabled={feedbackSent}
            className={`w-full py-4 rounded-xl font-black text-lg transition-all shadow-lg ${
              feedbackSent
                ? 'bg-green-100 text-green-600 cursor-not-allowed border border-green-200'
                : 'bg-gradient-to-r from-teal to-[#0f766e] text-white hover:shadow-teal/40 hover:-translate-y-0.5'
            }`}
          >
            {feedbackSent ? '✅ Feedback Submitted Successfully' : 'Submit Review & Feedback →'}
          </button>
        </div>
      )}

    </div>
  );
}
