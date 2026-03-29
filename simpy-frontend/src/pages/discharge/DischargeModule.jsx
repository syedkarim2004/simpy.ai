import React, { useState, useEffect } from 'react';
import DischargeForm from './components/DischargeForm';
import DischargeAudit from './components/DischargeAudit';
import FinalSettlement from './components/FinalSettlement';
import { Layers, CheckCircle2, AlertCircle, Loader2, Sparkles, Activity, ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function DischargeModule() {
  const location = useLocation();

  const getInitialData = () => {
    if (location.state?.auditData) {
      return location.state.auditData;
    }
    const saved = localStorage.getItem("dischargeAuditResult");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const [auditData, setAuditData] = useState(() => getInitialData());
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleExportAudit = async () => {
    if (!auditData) return;
    setExportLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/discharge/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(auditData)
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Simpy_Settlement_Report_${auditData.extraction?.claim_number || 'Case'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to generate PDF report.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleTransmitDispute = async (issues) => {
    setDisputeLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/discharge/dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claim_id: auditData?.extraction?.claim_number,
          issues: issues || auditData?.audit?.flags,
          timestamp: new Date().toISOString()
        })
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg("Dispute successfully transmitted to payor portal!");
        setTimeout(() => setSuccessMsg(null), 5000);
      }
    } catch (err) {
      console.error("Dispute failed:", err);
      alert("Failed to transmit dispute.");
    } finally {
      setDisputeLoading(false);
    }
  };

  useEffect(() => {
    console.log("Discharge Data:", auditData);
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    if (location.state?.auditData) {
      localStorage.setItem("dischargeAuditResult", JSON.stringify(location.state.auditData));
    }
  }, [location.state]);

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--accent)] mx-auto mb-4" />
          <p className="font-mono text-[10px] text-[var(--mid)] font-bold uppercase tracking-widest">Hydrating Clinical State...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] p-6 lg:p-10 font-body transition-all duration-500 overflow-y-auto custom-scrollbar">
      <div className="max-w-[1400px] mx-auto w-full space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-10 border-b border-[var(--border)] pb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
               <div className="w-1 h-5 bg-[var(--accent)] rounded-full" />
               <h4 className="font-mono text-[10px] text-[var(--accent)] font-bold uppercase tracking-widest">Reconciliation Protocol</h4>
            </div>
            <h1 className="text-[42px] font-serif font-bold text-[var(--text)] leading-none tracking-tight">
              Discharge <span className="text-[var(--accent)] italic">Audit</span> Engine
            </h1>
            <p className="text-[var(--muted)] text-[15px] mt-4 max-w-[640px] leading-relaxed">
              AI-driven insurance decision engine. Validating clinical settlement artifacts against policy mandates and pre-authorization limits.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {successMsg && (
              <div className="flex items-center gap-2 bg-[var(--accent-light)] px-4 py-2 border border-[var(--accent-border)] rounded-[6px] shadow-lg animate-in slide-in-from-top-4 duration-300 mb-2">
                <CheckCircle2 size={16} className="text-[var(--accent)]" />
                <span className="font-mono text-[10px] text-[var(--accent)] font-bold uppercase tracking-widest">{successMsg}</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-[var(--border)] rounded-[6px] shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              <span className="font-mono text-[9px] text-[var(--text)] font-bold uppercase tracking-widest">Core Engine Active</span>
            </div>
            <p className="font-mono text-[9px] text-[var(--mid)] uppercase font-bold text-right">
              Latency: 42ms | RCM Layer v4.0
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {[
            { step: '01', label: "Ingestion Summary", active: !!auditData?.extraction },
            { step: '02', label: "Audit Review", active: !!auditData?.extraction },
            { step: '03', label: "Final Settlement", active: !!auditData?.audit },
          ].map((s, i) => (
            <div key={i} className={`flex items-center gap-4 p-5 border rounded-[12px] transition-all duration-500 bg-white
              ${s.active ? 'border-[var(--accent-border)] shadow-sm' : 'border-[var(--border)] opacity-60'}
            `}>
              <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center font-bold text-[18px]
                ${s.active ? 'bg-[var(--accent)] text-white' : 'bg-[var(--surface-alt)] text-[var(--mid)]'}
              `}>
                {s.step}
              </div>
              <div className="flex flex-col">
                <span className={`text-[12px] font-bold uppercase tracking-tight ${s.active ? 'text-[var(--text)]' : 'text-[var(--mid)]'}`}>
                  {s.label}
                </span>
                <span className={`font-mono text-[9px] uppercase font-bold ${s.active ? 'text-[var(--accent)]' : 'text-[var(--mid)]'}`}>
                  {s.active ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 relative items-start">
          {loading && (
            <div className="absolute inset-0 z-50 bg-[var(--bg)]/80 backdrop-blur-[2px] rounded-[12px] flex flex-col items-center justify-center animate-in fade-in duration-300">
               <div className="w-20 h-20 bg-white border border-[var(--border)] flex items-center justify-center mb-6 shadow-xl rounded-[16px]">
                  <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
               </div>
               <h3 className="text-[28px] font-serif font-bold text-[var(--text)] mb-2">Executing Audit Protocol</h3>
               <p className="font-mono text-[11px] text-[var(--mid)] font-bold uppercase tracking-widest">Cross-referencing policy database...</p>
            </div>
          )}

          {/* Left Column — Form */}
          <div className="xl:col-span-12 xl:grid xl:grid-cols-12 xl:gap-10">
            <div className="xl:col-span-5 space-y-8">
              {auditData ? (
                <DischargeForm 
                  externalData={auditData}
                  onAuditStart={() => setLoading(true)}
                  onAuditComplete={(data) => {
                    setAuditData(data);
                    setLoading(false);
                  }} 
                />
              ) : (
                <div className="bg-white border border-[var(--border)] border-dashed p-16 flex flex-col items-center text-center group rounded-[12px] shadow-sm">
                  <div className="w-20 h-20 bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center mb-8 rounded-[16px] text-[var(--mid)] group-hover:text-[var(--accent)] transition-all">
                    <AlertCircle size={40} />
                  </div>
                  <h4 className="text-[var(--text)] font-serif font-bold text-[20px] mb-3">Payload Required</h4>
                  <p className="text-[var(--muted)] text-[14px] leading-relaxed mb-10 max-w-xs">
                    The audit engine requires a processed settlement artifact to initiate the clinical reconciliation protocol.
                  </p>
                  <button 
                    onClick={() => window.location.href='/app/pdf-upload'}
                    className="h-14 px-8 bg-[var(--accent)] text-white font-bold uppercase text-[13px] tracking-wider hover:opacity-95 transition-all rounded-[8px] shadow-md"
                  >
                    Go to Extraction Engine
                  </button>
                </div>
              )}
            </div>

            {/* Right Column — Results */}
            <div className="xl:col-span-7 space-y-8">
              {auditData?.audit ? (
                <div className="space-y-10">
                  <DischargeAudit audit={auditData.audit} insights={auditData.insights} />
                  <FinalSettlement 
                    settlement={{
                      ...auditData?.extraction,
                      total_bill: auditData?.extraction?.total_claimed ?? 0,
                      deductions: auditData?.extraction?.non_pay_amount ?? 0,
                      insurance_pay: auditData?.extraction?.final_settlement ?? 0,
                      patient_pay: auditData?.insights?.loss_to_patient ?? 0,
                      deduction_details: auditData?.audit?.warnings ?? []
                    }} 
                    auditResult={auditData.audit}
                    preauth_approved={(auditData?.extraction?.total_claimed ?? 0) > 0 ? 100000 : 0}
                    onExport={handleExportAudit}
                    exportLoading={exportLoading}
                    onTransmitDispute={handleTransmitDispute}
                    disputeLoading={disputeLoading}
                    onGenerateAudit={() => document.querySelector('#audit-trigger-btn')?.click()}
                  />
                </div>
              ) : (
                <div className="h-full min-h-[500px] border-2 border-dashed border-[var(--border)] bg-white rounded-[12px] flex flex-col items-center justify-center p-12 text-center shadow-sm">
                  <div className="w-20 h-20 bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center mb-8 rounded-[16px] opacity-40">
                    <Activity size={32} className="text-[var(--mid)]" />
                  </div>
                  <h4 className="text-[var(--mid)] font-serif font-bold text-[20px] mb-3 opacity-60">Awaiting Protocol Execution</h4>
                  <p className="text-[var(--mid)] text-[13px] max-w-[320px] opacity-60">
                    Verify billing artifacts on the primary panel and execute the reconciliation protocol to view audit results.
                  </p>
                  
                  {/* Visual ghost grid */}
                  <div className="grid grid-cols-3 gap-4 mt-12 w-full opacity-10">
                     {Array(6).fill(0).map((_, i) => (
                        <div key={i} className="h-16 bg-[var(--border)] rounded-[8px]" />
                     ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
