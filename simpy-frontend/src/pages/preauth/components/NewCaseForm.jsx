import React, { useState, useCallback } from 'react';
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
  Stethoscope,
  Activity
} from 'lucide-react';
import AuditResult from './AuditResult';

export default function NewCaseForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    if (!file) {
      setError('Please upload a Pre-Authorization Form PDF');
      return;
    }
    setError('');
    setLoading(true);
    setAuditResult(null);

    const data = new FormData();
    data.append('file', file);
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value);
    });

    try {
      const response = await fetch('http://localhost:8000/api/preauth/audit', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) throw new Error('Failed to run AI audit');
      
      const result = await response.json();
      setAuditResult(result);
    } catch (err) {
      setError('Security cluster unavailable. Please try again later.');
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
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <User className="w-32 h-32" />
          </div>
          
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Case Identification</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Patient Demographics & Insurance Details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Patient Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  name="patient_name"
                  type="text" 
                  required
                  value={formData.patient_name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full bg-[#0F172A] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Age</label>
              <div className="relative">
                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  name="age"
                  type="number" 
                  required
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="45"
                  className="w-full bg-[#0F172A] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Gender</label>
              <select 
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-2xl py-4 px-5 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all text-white appearance-none cursor-pointer"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Insurance Provider</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  name="insurance_provider"
                  type="text" 
                  required
                  value={formData.insurance_provider}
                  onChange={handleInputChange}
                  placeholder="Star Health / Apollo"
                  className="w-full bg-[#0F172A] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Policy Number</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  name="policy_number"
                  type="text" 
                  required
                  value={formData.policy_number}
                  onChange={handleInputChange}
                  placeholder="POL-123456"
                  className="w-full bg-[#0F172A] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">TPA Name</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  name="tpa_name"
                  type="text" 
                  required
                  value={formData.tpa_name}
                  onChange={handleInputChange}
                  placeholder="FHPL / MediAssist"
                  className="w-full bg-[#0F172A] border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder-slate-700"
                />
              </div>
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
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Upload Pre-Auth Form, Diagnosis & Referral</p>
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
              <div className="flex flex-col items-center animate-in scale-in duration-300">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-lg font-black text-white">{file.name}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document Ready</p>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-6 text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-[0.2em] relative z-20"
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                  <Upload className="w-10 h-10 text-indigo-500" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Drag & Drop Pre-Auth Form</h3>
                <p className="text-slate-400 max-w-xs font-medium text-sm leading-relaxed">
                  Support ID proofs, clinical diagnosis & referral letters in a single PDF document.
                </p>
                <div className="mt-8 px-6 py-2 bg-slate-800 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  Browse Files
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Error/Loading */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-4 animate-in shake duration-500 shadow-xl">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="text-sm font-bold uppercase tracking-widest leading-relaxed">{error}</p>
          </div>
        )}

        {/* Submit */}
        <button 
          disabled={loading}
          type="submit"
          className={`w-full py-6 rounded-3xl font-black text-lg uppercase tracking-[0.3em] shadow-2xl transition-all duration-500 flex items-center justify-center gap-4 group ${
            loading 
            ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-7 h-7 animate-spin" />
              <span>Analyzing with Simpy AI...</span>
            </>
          ) : (
            <>
              <span>Run Intelligence Audit</span>
              <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Audit Result Display */}
      {auditResult && <AuditResult result={auditResult} />}
    </div>
  );
}
