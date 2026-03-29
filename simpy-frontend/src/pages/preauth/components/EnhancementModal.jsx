import React, { useState } from 'react';
import { 
  X, 
  TrendingUp, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Currency,
  Percent,
  Calculator,
  ShieldCheck
} from 'lucide-react';

export default function EnhancementModal({ isOpen, onClose, baseCase }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState({
    original_approved_amt: '',
    enhancement_amt: '',
    reason: ''
  });

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !formData.original_approved_amt || !formData.enhancement_amt || !formData.reason) {
      setError("Please fill all fields and upload additional documents.");
      return;
    }

    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append("file", file);
    data.append("admission_id", baseCase.admission_id);
    data.append("patient_name", baseCase.patient_name);
    data.append("age", baseCase.age);
    data.append("gender", baseCase.gender);
    data.append("insurance_provider", baseCase.insurance_provider);
    data.append("tpa_name", baseCase.tpa_name);
    data.append("original_approved_amt", formData.original_approved_amt);
    data.append("enhancement_amt", formData.enhancement_amt);
    data.append("reason", formData.reason);

    try {
      const res = await fetch("http://localhost:8000/api/preauth/enhancement", {
        method: "POST",
        body: data
      });
      const resData = await res.json();
      if (resData.success) {
        setResult(resData.data);
      } else {
        setError(resData.error || "Failed to process enhancement.");
      }
    } catch (err) {
      setError("Backend not reachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto pt-10 pb-10 px-4">
      <div className="bg-[#1E293B] w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-700 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-[#0F172A]/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/20">
              <TrendingUp className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Raise Enhancement Request</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Enhancement ID will be auto-generated</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8">
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Info Cards (Read-only) */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Admission ID', value: baseCase.admission_id },
                  { label: 'Patient', value: baseCase.patient_name },
                  { label: 'Insurance', value: baseCase.insurance_provider },
                  { label: 'TPA', value: baseCase.tpa_name }
                ].map((info, i) => (
                  <div key={i} className="bg-[#0F172A]/50 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{info.label}</p>
                    <p className="text-sm font-bold text-white">{info.value}</p>
                  </div>
                ))}
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Original Approved (Rs.)</label>
                  <input 
                    name="original_approved_amt"
                    type="number"
                    value={formData.original_approved_amt}
                    onChange={handleInputChange}
                    placeholder="50000"
                    className="w-full bg-[#0F172A] border border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-amber-500 transition-all text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Enhancement Requested (Rs.)</label>
                  <input 
                    name="enhancement_amt"
                    type="number"
                    value={formData.enhancement_amt}
                    onChange={handleInputChange}
                    placeholder="25000"
                    className="w-full bg-[#0F172A] border border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-amber-500 transition-all text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Reason for Enhancement</label>
                <textarea 
                  name="reason"
                  rows={3}
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Treatment cost increased due to..."
                  className="w-full bg-[#0F172A] border border-slate-800 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:border-amber-500 transition-all text-white resize-none"
                />
              </div>

              {/* File Upload */}
              <div className="relative border-2 border-dashed border-slate-800 rounded-3xl p-10 bg-[#0F172A]/30 hover:bg-amber-500/5 hover:border-amber-500/30 transition-all flex flex-col items-center justify-center text-center group">
                <input 
                  type="file" 
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                {file ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                    <p className="text-sm font-bold text-white">{file.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-slate-600 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold text-slate-400 capitalize">Upload Discharge Summary / Additional Docs</p>
                  </>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-900/30 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-400 text-xs font-bold">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <button
                disabled={loading}
                type="submit"
                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 ${
                  loading 
                  ? 'bg-slate-800 text-slate-600' 
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Enhancement...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    <span>Submit Enhancement Request</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Enhancement Result View */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Decision */}
                <div className={`p-6 rounded-3xl border ${
                  result.enhancement_decision === 'Approve' ? 'bg-emerald-500/10 border-emerald-500/20' : 
                  result.enhancement_decision === 'Reject' ? 'bg-red-500/10 border-red-500/20' : 
                  'bg-amber-500/10 border-amber-500/20'
                }`}>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Decision</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xl font-black ${
                       result.enhancement_decision === 'Approve' ? 'text-emerald-400' : 
                       result.enhancement_decision === 'Reject' ? 'text-red-400' : 
                       'text-amber-400'
                    }`}>
                      {result.enhancement_decision}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500">{result.enhancement_id}</p>
                </div>

                {/* Card 2: Risk */}
                <div className="bg-slate-800/40 border border-slate-700 p-6 rounded-3xl">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Risk Level</p>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-5 h-5 ${
                      result.risk_level === 'Low' ? 'text-emerald-400' : 
                      result.risk_level === 'High' ? 'text-red-400' : 
                      'text-amber-400'
                    }`} />
                    <span className="text-xl font-black text-white">{result.risk_level}</span>
                  </div>
                </div>

                {/* Card 3: TPA Payable */}
                <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-lg shadow-emerald-600/20">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">TPA Payable</p>
                  <h3 className="text-2xl font-black">Rs. {result.tpa_payable}</h3>
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-[#0F172A]/60 border border-slate-800 rounded-3xl p-8">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
                  <Calculator className="w-4 h-4" /> Financial Breakdown
                </h4>
                <div className="space-y-4">
                  {[
                    { label: 'Original Approved Amount', value: `Rs. ${result.original_approved_amt}`, negative: false },
                    { label: 'Enhancement Requested', value: `Rs. ${result.enhancement_requested_amt}`, negative: false },
                    { label: 'System Approved Enhancement', value: `Rs. ${result.approved_enhancement_amt}`, negative: false },
                    { label: 'Deductions (Reason)', value: result.deductions, negative: true },
                    { label: 'Patient Co-pay', value: `Rs. ${result.copay_amount}`, negative: true },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-xs font-bold text-slate-400">{item.label}</span>
                      <span className={`text-xs font-black ${item.negative ? 'text-red-400' : 'text-white'}`}>
                        {item.value || 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">AI Auditor Suggestions</h4>
                <div className="space-y-3">
                  {result.suggestions.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-800/30 border border-slate-700 rounded-2xl">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <p className="text-xs font-bold text-slate-300">{s}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs uppercase tracking-widest transition-all"
              >
                Close Enhancement
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
