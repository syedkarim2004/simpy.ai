import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  User, 
  Building2, 
  Hash, 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Activity
} from 'lucide-react';
import AuditResult from './AuditResult';

export default function NewCaseForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [auditResult, setAuditResult] = useState(null);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    patient_name: '',
    age: '',
    gender: 'Male',
    insurance_provider: '',
    policy_number: '',
    tpa_name: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { patient_name, age, gender, insurance_provider, policy_number, tpa_name } = formData;
    
    if (!patient_name || !age || !gender || !insurance_provider || !policy_number || !tpa_name || !file) {
      setError("Please fill all fields and upload a PDF");
      return;
    }
    
    setLoading(true);
    setError(null);
    setAuditResult(null);
    
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("patient_name", patient_name);
      data.append("age", age);
      data.append("gender", gender);
      data.append("insurance_provider", insurance_provider);
      data.append("policy_number", policy_number);
      data.append("tpa_name", tpa_name);
      
      const res = await fetch("http://localhost:8000/api/preauth/audit", {
        method: "POST",
        body: data
      });
      
      const resData = await res.json();
      
      if (resData.success) {
        setAuditResult(resData.data);
        setTimeout(() => {
          document.getElementById('audit-result')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      } else {
        setError(resData.error || "Audit failed. Check backend connectivity.");
      }
    } catch (err) {
      setError("Backend not reachable. Ensure FastAPI is running on port 8000.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
        {/* Section 1: Patient & Case Info */}
        <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-10 shadow-2xl relative overflow-hidden group hover:border-blue-500/30 transition-colors duration-500">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Case Identification</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Demographics & Insurance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Patient Name</label>
              <input 
                name="patient_name"
                type="text" 
                value={formData.patient_name}
                onChange={handleInputChange}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-2xl py-4 px-5 text-sm font-medium focus:outline-none focus:border-blue-500 transition-all text-white"
                placeholder="Ex: John Smith"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Age</label>
              <input 
                name="age"
                type="number" 
                value={formData.age}
                onChange={handleInputChange}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-2xl py-4 px-5 text-sm font-medium focus:outline-none focus:border-blue-500 transition-all text-white"
                placeholder="45"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Gender</label>
              <select 
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-2xl py-4 px-5 text-sm font-medium focus:outline-none focus:border-blue-500 transition-all text-white appearance-none"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Insurance Provider</label>
              <input 
                name="insurance_provider"
                type="text" 
                value={formData.insurance_provider}
                onChange={handleInputChange}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-2xl py-4 px-5 text-sm font-medium focus:outline-none focus:border-blue-500 transition-all text-white"
                placeholder="Star Health"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Policy Number</label>
              <input 
                name="policy_number"
                type="text" 
                value={formData.policy_number}
                onChange={handleInputChange}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-2xl py-4 px-5 text-sm font-medium focus:outline-none focus:border-blue-500 transition-all text-white"
                placeholder="POL-77889"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">TPA Name</label>
              <input 
                name="tpa_name"
                type="text" 
                value={formData.tpa_name}
                onChange={handleInputChange}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-2xl py-4 px-5 text-sm font-medium focus:outline-none focus:border-blue-500 transition-all text-white"
                placeholder="MediAssist"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Document Upload */}
        <div className="bg-[#1E293B] border border-slate-700 rounded-3xl p-10 shadow-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-colors duration-500">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Clinical Documentation</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Upload Pre-Auth Form PDF</p>
            </div>
          </div>

          <div className="relative border-2 border-dashed border-slate-700 group-hover:border-indigo-500/50 rounded-3xl p-12 transition-all bg-[#0F172A]/50 hover:bg-indigo-500/5 flex flex-col items-center justify-center text-center">
            <input 
              type="file" 
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
            />
            {file ? (
              <div className="flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
                <p className="text-lg font-black text-white">{file.name}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">File Attached</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-12 h-12 text-indigo-500 mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-black text-white mb-2">Drag & Drop PDF</h3>
                <p className="text-slate-400 max-w-xs font-medium text-sm leading-relaxed">Referral Letter, Diagnosis Report & ID Proofs</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-4">
          {error && (
            <div className="p-4 bg-red-900/30 border border-red-500 rounded-xl text-red-300 text-xs font-bold flex items-center gap-3 animate-in shake duration-500">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}
          
          <button 
            disabled={loading}
            type="submit"
            className={`w-full py-6 rounded-3xl font-black text-lg uppercase tracking-[0.3em] shadow-2xl transition-all duration-500 flex items-center justify-center gap-4 group ${
              loading 
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30 active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-7 h-7 animate-spin" />
                <span>Analyzing with AI...</span>
              </>
            ) : (
              <>
                <span>Run Intelligence Audit</span>
                <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Audit Result Display */}
      {auditResult && (
        <div id="audit-result" className="pt-10">
           <AuditResult result={auditResult} />
        </div>
      )}
    </div>
  );
}
