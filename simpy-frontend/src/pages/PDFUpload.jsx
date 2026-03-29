import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PDFUploader from '../components/PDFUploader';
import { 
  FileText, ArrowRight, Table as TableIcon, 
  Calendar, Zap, AlertCircle, ShieldCheck,
  ScanText, LayoutList, Loader2, Info,
  TrendingDown, TrendingUp, Activity, CheckCircle2
} from 'lucide-react';

export default function PDFUpload() {
  const [status, setStatus] = useState('idle');
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const normalizeExtraction = (data) => {
    console.log("📋 EXTRACTED DATA FOR BINDING:", data);
    const gross = data.claimed_amount || data.total_claimed || 0;
    const items = data.line_items || data.bill_breakdown || [];
    
    return {
      ...data,
      grossClaimed: gross,
      hospitalDiscount: data.hospital_discount || 0,
      copay: data.copay || 0,
      tds: data.tds || 0,
      settlementAmount: data.settled_amount || 0,
      netPayable: data.final_payable_amount || 0,
      lineItems: items,
      claimRef: data.claim_number || 'N/A',
      settlementDate: data.settlement_date || 'N/A',
      bankName: data.bank_name || 'N/A',
      utr: data.utr_number || 'N/A',
      mode: data.mode || 'structured'
    };
  };

  const formatCurrency = (val) => {
    if (!val || val === 0) return "—";
    return `₹${val.toLocaleString()}`;
  };

  const getAuditBadge = (nonPay, reason) => {
    const r = (reason || "").toLowerCase();
    if (nonPay === 0) return { label: "COVERED", style: "bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent-border)]" };
    if (r.includes("room rent")) return { label: "ROOM RENT DEDUCTION", style: "bg-amber-50 text-amber-600 border-amber-100" };
    if (r.includes("excluded") || r.includes("misc")) return { label: "EXCLUDED", style: "bg-red-50 text-red-600 border-red-100" };
    return { label: "PARTIAL", style: "bg-amber-50 text-amber-600 border-amber-100" };
  };

  const handleUpload = async (file) => {
    setStatus('uploading');
    setError(null);
    setExtractedData(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      await new Promise(r => setTimeout(r, 800));
      setStatus('extracting');

      const res = await fetch("http://localhost:8000/api/pdf/extract", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      
      if (result.success && result.data) {
        const normalized = normalizeExtraction(result.data);
        setExtractedData(normalized);
        setStatus('success');
      } else {
        throw new Error(result.error || "EXTRACTION_ENGINE_FAILURE");
      }
    } catch (err) {
      console.error("Extraction Error:", err);
      setError(err.message || "Failed to process document. Please verify the file integrity.");
      setStatus('error');
      showToast("Extraction failed. Check PDF format.");
    }
  };

  const sendToDischarge = async () => {
    if (!extractedData) return;
    setStatus('processing');
    try {
      const casesRes = await fetch("http://localhost:8000/api/discharge/cases");
      const cases = await casesRes.json();
      const firstCase = cases[0] || { preauth_approved: 100000, expected_los: 3 };

      const auditRes = await fetch("http://localhost:8000/api/discharge/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          extraction: extractedData,
          case: firstCase
        })
      });
      
      const result = await auditRes.json();
      if (result.success) {
        console.log("Audit Protocol Success:", result.data);
        localStorage.setItem("dischargeAuditResult", JSON.stringify(result.data));
        navigate("/app/discharge", { state: { auditData: result.data } });
      }
    } catch (err) {
      console.error("Navigation Error:", err);
      navigate("/app/discharge");
    } finally {
      setStatus('success');
    }
  };

  // Reconciliation Insights Calculations
  const recoveryRate = extractedData ? (extractedData.settlementAmount / extractedData.grossClaimed) * 100 : 0;
  const largestDeduction = extractedData?.lineItems?.reduce((prev, current) => 
    (prev.non_pay_amount > current.non_pay_amount) ? prev : current, { non_pay_amount: 0, category: 'N/A' });
  const hasRoomRentDeduction = extractedData?.lineItems?.some(item => (item.reason || "").toLowerCase().includes("room rent"));

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] p-6 lg:p-10 font-body transition-all duration-500 overflow-y-auto custom-scrollbar">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-10 z-[100] animate-in slide-in-from-right-10 duration-500">
           <div className="bg-white border border-[var(--border)] p-4 rounded-[12px] shadow-2xl flex items-center gap-3">
              <div className="w-8 h-8 bg-[var(--amber-light)] rounded-full flex items-center justify-center text-[var(--amber)]">
                 <AlertCircle size={18} />
               </div>
               <div>
                 <p className="text-[12px] font-bold text-[var(--text)] uppercase tracking-tight">System Message</p>
                 <p className="text-[11px] text-[var(--muted)]">{toast}</p>
               </div>
           </div>
        </div>
      )}

      {/* Header section */}
      <div className="text-center mb-12 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white border border-[var(--border)] px-3 py-1.5 rounded-[6px] mb-6 shadow-sm">
           <Activity size={14} className="text-[var(--accent)]" />
           <span className="font-mono text-[10px] text-[var(--text)] font-bold uppercase tracking-widest">Extraction Intelligence v3.2</span>
        </div>
        <h1 className="text-[44px] font-serif font-bold text-[var(--text)] leading-tight tracking-tight">
          Clinical <span className="text-[var(--accent)] italic">Extraction</span> Engine
        </h1>
        <p className="text-[var(--muted)] text-[15px] mt-4 max-w-2xl mx-auto">
          Automated parsing of hospital settlement records into structured clinical data for insurance reconciliation and audit.
        </p>
      </div>

      <div className="max-w-4xl mx-auto w-full mb-12">
        <div className="bg-white border border-[var(--border)] p-8 rounded-[12px] shadow-sm">
          <PDFUploader onUpload={handleUpload} status={status} />
        </div>
      </div>

      {extractedData && (
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-6xl mx-auto w-full pb-20">
          
          {/* Claim Reference Banner */}
          <div className="mb-6 flex items-center justify-between bg-[var(--surface-alt)] border border-[var(--border)] rounded-[8px] p-4">
             <div className="flex items-center gap-4">
               <div className="px-3 py-1 bg-white border border-[var(--border)] rounded-[4px] font-mono text-[10px] font-bold text-[var(--text)] shadow-sm">
                 CLAIM REF: {extractedData.claimRef}
               </div>
               <div className="h-4 w-[1px] bg-[var(--border)]" />
               <span className="font-mono text-[10px] uppercase font-bold text-[var(--muted)] tracking-wider">Medi Assist | New India Assurance</span>
             </div>
             <div className="font-mono text-[10px] uppercase font-bold text-[var(--accent)]">
               Settlement: {extractedData.settlementDate}
             </div>
          </div>

          <div className="bg-white border border-[var(--border)] p-10 rounded-[12px] shadow-md relative overflow-hidden">
            
            {/* System Insight Badge */}
            <div className="absolute top-0 right-0 p-8 flex flex-col items-end gap-2">
              {extractedData.confidence >= 0.85 ? (
                <div className="px-4 py-1.5 bg-[var(--accent-light)] border border-[var(--accent-border)] rounded-[6px] flex items-center gap-2">
                   <ShieldCheck size={14} className="text-[var(--accent)]" />
                   <span className="font-mono text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">Verified: {(extractedData.confidence * 100).toFixed(0)}% Confidence</span>
                </div>
              ) : (
                <div className="px-4 py-1.5 bg-[var(--amber-light)] border border-[var(--amber-border)] rounded-[6px] flex items-center gap-2">
                   <AlertCircle size={14} className="text-[var(--amber)]" />
                   <span className="font-mono text-[10px] font-bold text-[var(--amber)] uppercase tracking-wider">Uncertain: {(extractedData.confidence * 100).toFixed(0)}% Confidence</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 mb-12 border-b border-[var(--border)] pb-8">
               <div className="w-14 h-14 bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center text-[var(--accent)] rounded-[10px]">
                  <ScanText size={28} />
               </div>
               <div>
                  <h4 className="text-[26px] font-serif font-bold text-[var(--text)]">Claim Intelligence Summary</h4>
                  <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mt-1 font-bold">Extraction Mode: {extractedData.mode?.toUpperCase()} | ID: {extractedData.claim_number || 'UNKNOWN'}</p>
               </div>
            </div>

            {/* Financial Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
               {[
                 { label: 'Gross Claimed', val: extractedData.grossClaimed, icon: TrendingUp, color: 'text-[var(--text)]', up: true },
                 { label: 'Hospital Discount', val: extractedData.hospitalDiscount, icon: TrendingDown, color: 'text-red-500', down: true },
                 { label: 'Settlement Amount', val: extractedData.settlementAmount, icon: Activity, color: 'text-[var(--accent)]', accent: true },
                 { label: 'Net Payable', val: extractedData.netPayable, icon: Zap, color: 'text-[var(--accent)]', accent: true }
               ].map((card, i) => (
                 <div key={i} className={`bg-[var(--surface-alt)] border p-6 rounded-[10px] transition-all hover:bg-white border-[var(--border)] ${card.accent ? 'ring-1 ring-[var(--accent)]/10 ring-inset shadow-sm' : ''}`}>
                    <div className="flex items-center justify-between mb-3">
                       <span className="font-mono text-[9px] font-bold text-[var(--mid)] uppercase tracking-wider">{card.label}</span>
                       <card.icon size={12} className={card.color} />
                    </div>
                    <div className="flex items-end gap-2">
                      <p className={`text-[24px] font-bold ${card.color} tracking-tight`}>
                        {formatCurrency(card.val)}
                      </p>
                      {card.up && <TrendingUp size={14} className="text-[var(--muted)] mb-2" />}
                      {card.down && <TrendingDown size={14} className="text-red-400 mb-2" />}
                    </div>
                 </div>
               ))}
            </div>

            {/* Structured Table */}
            <div className={`border border-[var(--border)] rounded-[8px] overflow-hidden mb-8 shadow-sm ${extractedData.lineItems.length === 0 ? 'opacity-50' : ''}`}>
                <table className="w-full text-left font-body text-[13px]">
                  <thead className="bg-[var(--surface-alt)] border-b border-[var(--border)] text-[var(--muted)] font-bold uppercase tracking-widest">
                    <tr>
                      <th className="px-8 py-4 text-[10px]">Clinical Category</th>
                      <th className="px-8 py-4 text-[10px]">Audit Status</th>
                      <th className="px-8 py-4 text-right text-[10px]">Bill Amt</th>
                      <th className="px-8 py-4 text-right text-[10px]">Payable</th>
                      <th className="px-8 py-4 text-right text-[10px]">Deduction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {extractedData.lineItems?.map((row, i) => {
                       const deduction = row.non_pay_amount || 0;
                       const badge = getAuditBadge(deduction, row.reason);

                       return (
                        <tr key={i} className="text-[var(--text)] hover:bg-[var(--surface-alt)] transition-colors">
                          <td className="px-8 py-5 font-semibold text-[14px]">{row.category}</td>
                          <td className="px-8 py-5">
                             <div className={`inline-flex items-center px-2 py-0.5 border text-[10px] font-bold uppercase tracking-wider rounded-[4px] ${badge.style}`}>
                                {badge.label}
                             </div>
                             {row.reason && <p className="text-[10px] text-[var(--muted)] mt-1 italic">{row.reason}</p>}
                          </td>
                          <td className="px-8 py-5 text-right font-mono font-bold">{formatCurrency(row.bill_amount || row.billed_amount)}</td>
                          <td className="px-8 py-5 text-right font-mono font-bold text-[var(--accent)]">{formatCurrency(row.payable_amount)}</td>
                          <td className="px-8 py-5 text-right font-mono font-bold text-red-500">{formatCurrency(deduction)}</td>
                        </tr>
                       );
                    })}
                    {/* TOTAL ROW */}
                    {extractedData.lineItems.length > 0 && (
                      <tr className="bg-[var(--surface-alt)]/50 border-t-2 border-[var(--border)] font-bold">
                        <td className="px-8 py-5 text-[14px]">TOTAL</td>
                        <td className="px-8 py-5" />
                        <td className="px-8 py-5 text-right font-mono">{formatCurrency(extractedData.grossClaimed)}</td>
                        <td className="px-8 py-5 text-right font-mono text-[var(--accent)]">{formatCurrency(extractedData.lineItems.reduce((s, i) => s + (i.payable_amount || 0), 0))}</td>
                        <td className="px-8 py-5 text-right font-mono text-red-500">{formatCurrency(extractedData.lineItems.reduce((s, i) => s + (i.non_pay_amount || 0), 0))}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
            </div>

            {/* Deductions Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
               <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                    <span className="text-[13px] text-[var(--muted)] font-medium">(–) Hospital Discount</span>
                    <span className="font-mono text-[13px] font-bold">{formatCurrency(extractedData.hospitalDiscount)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                    <span className="text-[13px] text-[var(--muted)] font-medium">(–) Co-payment (as per policy)</span>
                    <span className="font-mono text-[13px] font-bold text-amber-600">{formatCurrency(extractedData.copay)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                    <span className="text-[13px] text-[var(--muted)] font-medium">(–) Tax Deducted at Source (TDS)</span>
                    <span className="font-mono text-[13px] font-bold">{formatCurrency(extractedData.tds)}</span>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <span className="text-[15px] font-serif font-bold text-[var(--text)] uppercase tracking-tight">Net Recommended for Payment</span>
                    <span className="font-mono text-[20px] font-bold text-[var(--accent)]">{formatCurrency(extractedData.netPayable)}</span>
                  </div>
               </div>

               {/* Reconciliation Insight Card */}
               <div className="bg-white border border-[var(--border)] rounded-[12px] p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <Activity size={16} className="text-[var(--accent)]" />
                    <h5 className="font-serif font-bold text-[16px]">Settlement Reconciliation</h5>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">Recovery Rate</span>
                      <span className="text-[12px] font-bold text-[var(--accent)]">{recoveryRate.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--surface-alt)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${recoveryRate}%` }} />
                    </div>
                    <p className="text-[10px] text-[var(--muted)] mt-2 italic">{formatCurrency(extractedData.settlementAmount)} recovered of {formatCurrency(extractedData.grossClaimed)}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                       <TrendingDown size={14} className="text-red-400 mt-0.5" />
                       <div>
                         <p className="text-[12px] font-bold">Largest Deduction</p>
                         <p className="text-[11px] text-[var(--muted)]">{largestDeduction.category} — {formatCurrency(largestDeduction.non_pay_amount)}</p>
                       </div>
                    </div>

                    {hasRoomRentDeduction && (
                      <div className="p-3 bg-amber-50 border border-amber-100 rounded-[6px] flex gap-3">
                         <AlertCircle size={14} className="text-amber-600 mt-0.5" />
                         <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                           ⚠ Room rent exceeded policy sub-limit. Proportionate deductions applied across Consultant & Surgery charges. Consider policy upgrade or room category compliance.
                         </p>
                      </div>
                    )}

                    {extractedData.tds > 0 && (
                       <div className="flex items-start gap-3">
                          <Info size={14} className="text-[var(--accent)] mt-0.5" />
                          <p className="text-[10px] text-[var(--muted)]">TDS of {formatCurrency(extractedData.tds)} deducted. Collect Form 16A from insurer for tax filing.</p>
                       </div>
                    )}
                  </div>
               </div>
            </div>

            <button 
              onClick={sendToDischarge}
              disabled={status === 'processing'}
              className="w-full h-16 bg-[var(--accent)] hover:opacity-95 text-white font-bold p-4 rounded-[8px] transition-all uppercase tracking-widest text-[16px] flex items-center justify-center gap-4 shadow-lg shadow-[var(--accent)]/20 group"
            >
              {status === 'processing' ? <Loader2 className="animate-spin" /> : <Zap size={20} className="fill-white group-hover:scale-110 transition-transform" />}
              Initiate Reconciliation Protocol
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
