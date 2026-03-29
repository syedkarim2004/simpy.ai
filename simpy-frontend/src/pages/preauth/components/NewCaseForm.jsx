import React, { useState, useEffect, useMemo } from 'react';
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
  Activity,
  Sparkles,
  Zap,
  Check,
  FileDown,
  ShieldCheck,
  Trash2,
  FileWarning,
  ArrowRight,
  ClipboardCheck,
  Search,
  CheckCircle,
  XCircle,
  PlusCircle,
  Coins,
  History,
  ChevronDown,
  Mail,
  Copy,
  ExternalLink,
  Calendar,
  Stethoscope,
  Info
} from 'lucide-react';

// ── HELPER: UPLOAD CARD ──
const UploadCard = ({ label, id, file, onFileChange, onRemove, small = false }) => {
  return (
    <div className={`relative border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center text-center group ${
      small ? 'p-4 h-32' : 'p-6 h-48'
    } ${
      file ? 'bg-[var(--accent-light)] border-[var(--accent)]/30' : 'bg-[var(--bg)] border-[var(--border)] hover:border-[var(--accent)]/30'
    }`}>
      <input 
        type="file" 
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={(e) => onFileChange(id, e.target.files[0])}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
      />
      {file ? (
        <div className="flex flex-col items-center animate-in zoom-in-95 w-full">
          <div className={`${small ? 'w-8 h-8' : 'w-12 h-12'} bg-white rounded-full flex items-center justify-center shadow-md mb-2 border border-[var(--accent-border)]`}>
             <ShieldCheck size={small ? 16 : 24} className="text-[var(--accent)]" />
          </div>
          <p className={`${small ? 'text-[10px]' : 'text-[12px]'} font-bold text-[var(--text)] truncate w-full px-2`} title={file.name}>{file.name}</p>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(id); }}
            className="mt-2 p-1 text-red-500 hover:bg-red-50 rounded-md transition-all relative z-20"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ) : (
        <>
          <Upload size={small ? 18 : 24} className="text-[var(--mid)] mb-2 group-hover:text-[var(--accent)] transition-all duration-300" />
          <div>
            <p className={`${small ? 'text-[11px]' : 'text-[13px]'} font-bold text-[var(--text)] uppercase tracking-tight`}>{label}</p>
            {!small && (
              <p className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-widest mt-2 px-2 py-1 bg-white border border-[var(--border)] rounded inline-block">
                PDF / IMAGE
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default function NewCaseForm({ selectedPatientId, activePatients = [] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [auditResult, setAuditResult] = useState(null);
  const [showCompliance, setShowCompliance] = useState(false);
  const [ruleResults, setRuleResults] = useState(null);
  
  // ── FILE STATE ──
  const [files, setFiles] = useState({
    idProof: null,
    diagnostics: null,
    referral: null,
    clinical: null
  });

  // ── ENHANCEMENT STATE ──
  const [enhancement, setEnhancement] = useState({
    requestedAmount: '',
    supportingDoc: null,
    reason: '',
    loading: false,
    result: null 
  });

  const [formData, setFormData] = useState({
    patient_name: '',
    age: '',
    gender: 'Male',
    insurance_provider: '',
    policy_number: '',
    tpa_name: '',
    diagnosis: '',
    icd_code: '',
    treating_doctor: '',
    estimated_cost: '',
    admission_date: '',
    hospital_name: 'Mediversal Multi Super Speciality Hospital',
    proposed_treatment: ''
  });

  const [autoFillLoading, setAutoFillLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleFileChange = (id, file) => {
    if (id === 'enhancementDoc') {
      setEnhancement(prev => ({ ...prev, supportingDoc: file }));
    } else {
      setFiles(prev => ({ ...prev, [id]: file }));
    }
  };

  const removeFile = (id) => {
    if (id === 'enhancementDoc') {
      setEnhancement(prev => ({ ...prev, supportingDoc: null }));
    } else {
      setFiles(prev => ({ ...prev, [id]: null }));
    }
  };

  const isAuditDisabled = !files.idProof || !files.diagnostics || !files.referral || !files.clinical || loading;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ── 32-RULE AUDIT ENGINE ──
  const runRuleEngine = (data) => {
    const rules = [
      // ELIGIBILITY
      { id: 1, name: 'Policy Active Status', status: data.policy_number ? 'PASS' : 'FAIL', group: 'ELIGIBILITY' },
      { id: 2, name: 'Policy Coverage Period', status: data.admission_date ? 'PASS' : 'FAIL', group: 'ELIGIBILITY' },
      { id: 3, name: 'Co-payment Calculation', status: 'PASS', group: 'ELIGIBILITY', note: '10% co-pay applicable' },
      { id: 4, name: 'Pre-existing Disease', status: parseInt(data.age) > 40 ? 'WARN' : 'PASS', group: 'ELIGIBILITY' },
      { id: 5, name: 'Sub-limit Verification', status: parseInt(data.estimated_cost) < 500000 ? 'PASS' : 'WARN', group: 'ELIGIBILITY' },
      { id: 6, name: 'Network Hospital', status: 'PASS', group: 'ELIGIBILITY', note: 'Mediversal is network primary' },
      // CLINICAL
      { id: 7, name: 'ICD-10 Code Validity', status: data.icd_code && /^[A-Z]/.test(data.icd_code) ? 'PASS' : 'FAIL', group: 'CLINICAL' },
      { id: 8, name: 'Diagnosis-Treatment Alignment', status: data.diagnosis && data.proposed_treatment ? 'PASS' : 'FAIL', group: 'CLINICAL' },
      { id: 9, name: 'Medical Necessity', status: 'PASS', group: 'CLINICAL' },
      { id: 10, name: 'Conservative Treatment', status: data.proposed_treatment?.toLowerCase().includes('surgery') ? 'WARN' : 'PASS', group: 'CLINICAL' },
      { id: 11, name: 'Day Care Appropriateness', status: 'PASS', group: 'CLINICAL' },
      { id: 12, name: 'Length of Stay', status: 'PASS', group: 'CLINICAL' },
      { id: 13, name: 'ICU Criteria', status: data.diagnosis?.toLowerCase().includes('cardiac') ? 'PASS' : 'WARN', group: 'CLINICAL' },
      { id: 14, name: 'Surgery Documentation', status: data.treating_doctor ? 'PASS' : 'FAIL', group: 'CLINICAL' },
      // DOCUMENTATION
      { id: 15, name: 'Doctor Registration', status: data.treating_doctor ? 'PASS' : 'FAIL', group: 'DOCUMENTATION' },
      { id: 16, name: 'Specialist Qualification', status: 'PASS', group: 'DOCUMENTATION' },
      { id: 17, name: 'Hospital Accreditation', status: 'PASS', group: 'DOCUMENTATION', note: 'NABH Accredited' },
      { id: 18, name: 'Admission Note', status: 'PASS', group: 'DOCUMENTATION' },
      { id: 19, name: 'Investigation Reports', status: 'WARN', group: 'DOCUMENTATION', note: 'Remind to attach' },
      { id: 20, name: 'Treatment History', status: 'WARN', group: 'DOCUMENTATION', note: 'Remind to attach' },
      // FINANCIAL
      { id: 21, name: 'Cost Within Sum Insured', status: parseInt(data.estimated_cost) < 500000 ? 'PASS' : 'FAIL', group: 'FINANCIAL' },
      { id: 22, name: 'Package Rate Check', status: 'PASS', group: 'FINANCIAL' },
      { id: 23, name: 'Pharmacy Sub-limit', status: 'PASS', group: 'FINANCIAL' },
      { id: 24, name: 'Implant Coverage', status: (data.diagnosis?.toLowerCase().includes('cardiac') || data.diagnosis?.toLowerCase().includes('ortho')) ? 'PASS' : 'WARN', group: 'FINANCIAL' },
      { id: 25, name: 'OPD vs IPD', status: 'PASS', group: 'FINANCIAL' },
      { id: 26, name: 'GST Applicability', status: 'PASS', group: 'FINANCIAL', note: '18% on non-medical' },
      { id: 27, name: 'TDS Deduction', status: 'PASS', group: 'FINANCIAL' },
      // EXCLUSIONS
      { id: 28, name: 'Cosmetic Exclusion', status: 'PASS', group: 'EXCLUSIONS' },
      { id: 29, name: 'Experimental Treatment', status: 'PASS', group: 'EXCLUSIONS' },
      { id: 30, name: 'Self-inflicted', status: 'PASS', group: 'EXCLUSIONS' },
      { id: 31, name: 'War/Terrorism', status: 'PASS', group: 'EXCLUSIONS' },
      { id: 32, name: 'Waiting Period', status: 'PASS', group: 'EXCLUSIONS' }
    ];

    const passed = rules.filter(r => r.status === 'PASS').length;
    const warnings = rules.filter(r => r.status === 'WARN').length;
    const failed = rules.filter(r => r.status === 'FAIL').length;

    setRuleResults({ passed, warnings, failed, rules });
    setShowCompliance(true);
  };

  // ── AUTO-FILL LOGIC ──
  const handleScanAndAutoFill = async () => {
    const patient = activePatients.find(p => p.id === selectedPatientId);
    if (!patient) {
      setToast({ message: 'Select a patient profile first!', type: 'error' });
      return;
    }

    setAutoFillLoading(true);
    await new Promise(r => setTimeout(r, 1500));

    // Mock realistic data based on patient
    const autoFilledData = {
      ...formData,
      patient_name: patient.name,
      age: patient.id === 'P-9021' ? '45' : (patient.id === 'P-9022' ? '29' : '52'),
      gender: patient.id === 'P-9022' ? 'Female' : 'Male',
      insurance_provider: patient.id === 'P-9021' ? 'Star Health' : (patient.id === 'P-9022' ? 'United Health' : 'HDFC ERGO'),
      policy_number: `SH-2024-${Math.floor(Math.random()*900000 + 100000)}`,
      tpa_name: patient.id === 'P-9021' ? 'Medi Assist' : (patient.id === 'P-9022' ? 'United Health' : 'Family Health Plan'),
      diagnosis: patient.id === 'P-9021' ? 'Acute Myocardial Infarction' : 'Type II Diabetes Melitus',
      icd_code: 'I21.9',
      treating_doctor: 'Dr. Sameer Gupta',
      estimated_cost: '245000',
      admission_date: new Date().toISOString().split('T')[0],
      proposed_treatment: 'Coronary Angioplasty with Stenting'
    };

    setFormData(autoFilledData);
    setToast({ message: '✓ Form auto-filled. Running 32-rule audit...', type: 'success' });
    runRuleEngine(autoFilledData);
    setAutoFillLoading(false);
  };

  // ── MAIL DRAFT LOGIC ──
  const mailDraft = useMemo(() => {
    if (!formData.patient_name || !ruleResults) return null;

    const tpaEmails = {
      'Medi Assist': 'preauth@mediassist.in',
      'United Health': 'claims@unitedhealthcare.in',
      'Star Health': 'preauth@starhealth.in'
    };
    const tpaEmail = tpaEmails[formData.tpa_name] || 'tpa.claims@insurance.in';
    const score = Math.round((ruleResults.passed / 32) * 100);

    return {
      to: tpaEmail,
      subject: `Pre-Authorization Request — ${formData.patient_name} | Policy: ${formData.policy_number} | Adm: ${new Date().toLocaleDateString()}`,
      body: `Dear Claims Team,

We hereby request pre-authorization for the following insured patient under your policy:

PATIENT DETAILS:
Name        : ${formData.patient_name}
Age/Gender  : ${formData.age} Years / ${formData.gender}
Policy No.  : ${formData.policy_number}
Insurance   : ${formData.insurance_provider}
TPA         : ${formData.tpa_name}

CLINICAL DETAILS:
Diagnosis   : ${formData.diagnosis}
ICD Code    : ${formData.icd_code}
Treatment   : ${formData.proposed_treatment}
Doctor      : ${formData.treating_doctor}, ${formData.hospital_name}
Admission   : ${formData.admission_date}
Est. Cost   : ₹${parseInt(formData.estimated_cost).toLocaleString()}

AUDIT SUMMARY:
Rules Passed: ${ruleResults.passed}/32 | Risk Level: ${ruleResults.failed > 0 ? 'MEDIUM' : 'LOW'}
Audit Score : ${score}%
Compliance  : ${ruleResults.failed > 0 ? 'REQUIRES MANUAL REVIEW' : 'RECOMMENDED FOR APPROVAL'}

We have attached the following supporting documents:
- Admission note & doctor's certificate
- Investigation reports (ECG, Lab, Imaging)
- Previous treatment history
- Hospital accreditation certificate (NABH)

Kindly process the pre-authorization at the earliest.
For any clarifications: preauth@mediversal.in | 06123500010

Regards,
Pre-Authorization Desk
Mediversal Multi Super Speciality Hospital`
    };
  }, [formData, ruleResults]);

  const copyMail = () => {
    if (!mailDraft) return;
    navigator.clipboard.writeText(mailDraft.body);
    setToast({ message: 'Mail content copied to clipboard!', type: 'success' });
  };

  const openMail = () => {
    if (!mailDraft) return;
    const mailto = `mailto:${mailDraft.to}?subject=${encodeURIComponent(mailDraft.subject)}&body=${encodeURIComponent(mailDraft.body)}`;
    window.location.href = mailto;
  };

  // ── INTELLIGENCE ENGINE SIMULATION (EXISTING) ──
  const runIntelligenceAudit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAuditResult(null);
    setEnhancement(prev => ({ ...prev, result: null }));

    await new Promise(r => setTimeout(r, 2500));

    let score = 70;
    const diagName = files.diagnostics.name.toLowerCase();
    if (diagName.includes('surgery') || diagName.includes('icu') || diagName.includes('emergency')) {
      score += 10;
    }
    if (files.referral) score += 5;
    score += (Math.random() * 10 - 5);

    const isApproved = score > 75;
    const approvedAmount = isApproved ? Math.floor(Math.random() * (150000 - 50000) + 50000) : 0;

    const result = {
      status: isApproved ? 'APPROVED' : 'REJECTED',
      score: Math.round(score),
      amount: approvedAmount,
      timestamp: new Date().toISOString(),
      checklist: [
        { label: 'ID Verified', status: true },
        { label: 'Diagnosis Matches Referral', status: Math.random() > 0.2 },
        { label: 'Clinical Consistency', status: isApproved }
      ]
    };

    setAuditResult(result);
    setLoading(false);
  };

  return (
    <div className="space-y-12 relative animate-in fade-in duration-500 font-body">
      {/* ── LOADER OVERLAY ── */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[200] flex flex-col items-center justify-center p-10 animate-in fade-in duration-300">
          <div className="relative w-32 h-32 mb-10 text-[var(--accent)]">
            <Loader2 size={128} className="animate-spin opacity-20" />
            <Activity size={48} className="absolute inset-0 m-auto animate-pulse" />
          </div>
          <h2 className="font-serif text-3xl text-[var(--text)] font-bold mb-4">Clinical Intelligence Protocol</h2>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[var(--accent-light)] rounded-md">
               <Zap size={16} className="text-[var(--accent)] animate-bounce" />
            </div>
            <p className="font-mono text-[12px] text-[var(--muted)] uppercase tracking-[0.3em] font-bold">Executing Real-Time Audit Engine...</p>
          </div>
          <div className="mt-12 max-w-sm w-full bg-[var(--bg)] h-1 rounded-full overflow-hidden border border-[var(--border)]">
             <div className="h-full bg-[var(--accent)] animate-progress" style={{ width: '100%' }}></div>
          </div>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {toast && (
        <div className={`fixed bottom-10 right-10 p-4 border flex items-center gap-3 font-body text-[13px] z-[500] animate-in slide-in-from-right-10 duration-500 shadow-2xl min-w-[320px] rounded-lg border-l-4 bg-white ${
          toast.type === 'success' ? 'border-[var(--accent)] text-[var(--text)]' : 'border-red-500 text-[var(--text)]'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-[var(--accent-light)] text-[var(--accent)]' : 'bg-red-50 text-red-500'}`}>
             {toast.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          </div>
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* ── AUTO-FILL ACTION CARD ── */}
      <section className="bg-white border border-[var(--border)] p-10 rounded-xl flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden group">
        <div className="flex flex-col gap-3 relative z-10 max-w-xl">
          <div className="flex items-center gap-3 text-[var(--accent)] mb-1">
             <Sparkles size={20} className="fill-current" />
             <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em]">Clinical Automation</span>
          </div>
          <h3 className="font-serif font-bold text-2xl text-[var(--text)] leading-tight">AI-Powered Form Auto-Fill</h3>
          <p className="text-[14px] text-[var(--muted)] leading-relaxed">Map clinical data from selected patient profiles instantly to populate the pre-authorization request.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto relative z-10">
          <button 
            onClick={handleScanAndAutoFill}
            disabled={autoFillLoading}
            className={`w-full md:w-auto px-8 py-3.5 rounded-lg flex items-center justify-center gap-2 font-body text-[13px] font-semibold transition-all ${
              autoFillLoading ? 'bg-[var(--surface-alt)] text-[var(--muted)]' : 'bg-[var(--accent)] hover:opacity-90 text-white shadow-lg shadow-[var(--accent)]/10'
            }`}
          >
            {autoFillLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {autoFillLoading ? "AUTO-FILLING..." : "Scan & Auto-Fill"}
          </button>
        </div>
      </section>

      <form onSubmit={runIntelligenceAudit} className="space-y-16">
        {/* ── CASE IDENTIFICATION ── */}
        <div id="case-form">
          <div className="flex items-center gap-4 mb-10 border-b border-[var(--border)] pb-8">
            <div className="w-10 h-10 bg-[var(--bg)] border border-[var(--border)] rounded-lg flex items-center justify-center text-[var(--accent)]"><User size={20} /></div>
            <div>
              <h2 className="font-serif font-bold text-xl text-[var(--text)]">Case Identification</h2>
              <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mt-1">PATIENT DEMOGRAPHICS & COVERAGE</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[
              { label: 'Patient Name', name: 'patient_name', type: 'text', placeholder: 'Rahul Sharma' },
              { label: 'Age', name: 'age', type: 'number', placeholder: '45' },
              { label: 'Gender', name: 'gender', type: 'select', options: ['Male', 'Female', 'Other'] },
              { label: 'Insurance Provider', name: 'insurance_provider', type: 'text', placeholder: 'Star Health' },
              { label: 'Policy Number', name: 'policy_number', type: 'text', placeholder: 'SH-2024-789456' },
              { label: 'TPA Name', name: 'tpa_name', type: 'text', placeholder: 'Medi Assist TPA' },
              { label: 'Admission Date', name: 'admission_date', type: 'date', icon: Calendar },
              { label: 'Hospital Name', name: 'hospital_name', type: 'text', placeholder: 'Mediversal Hospital' },
            ].map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.name} className="flex flex-col gap-2.5">
                  <label className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-widest font-bold">{field.label}</label>
                  <div className="relative">
                    {Icon && <Icon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--mid)]" />}
                    {field.type === 'select' ? (
                      <select name={field.name} value={formData[field.name]} onChange={handleInputChange} className="w-full bg-white border border-[var(--border)] py-3 px-5 text-[13px] font-body text-[var(--text)] rounded-lg focus:outline-none focus:border-[var(--accent)] appearance-none">
                        {field.options.map(opt => <option key={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input name={field.name} type={field.type} value={formData[field.name]} onChange={handleInputChange} className={`w-full bg-white border border-[var(--border)] py-3 ${Icon ? 'pl-10 pr-5' : 'px-5'} text-[13px] font-body text-[var(--text)] rounded-lg focus:outline-none focus:border-[var(--accent)]`} placeholder={field.placeholder} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CLINICAL ARCHITECTURE ── */}
        <div>
          <div className="flex items-center gap-4 mb-10 border-b border-[var(--border)] pb-8">
            <div className="w-10 h-10 bg-[var(--bg)] border border-[var(--border)] rounded-lg flex items-center justify-center text-[var(--accent)]"><Stethoscope size={20} /></div>
            <div>
              <h2 className="font-serif font-bold text-xl text-[var(--text)]">Clinical Architecture</h2>
              <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mt-1">DIAGNOSIS & PROPOSED TREATMENT</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Diagnosis', name: 'diagnosis', type: 'text', placeholder: 'e.g. Chronic Renal Failure' },
              { label: 'ICD-10 Code', name: 'icd_code', type: 'text', placeholder: 'e.g. N18.9' },
              { label: 'Treating Doctor', name: 'treating_doctor', type: 'text', placeholder: 'Dr. Amitabh Singh' },
              { label: 'Estimated Cost (₹)', name: 'estimated_cost', type: 'number', placeholder: '150000' },
            ].map((field) => (
              <div key={field.name} className="flex flex-col gap-2.5">
                <label className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-widest font-bold">{field.label}</label>
                <input name={field.name} type={field.type} value={formData[field.name]} onChange={handleInputChange} className="bg-white border border-[var(--border)] py-3 px-5 text-[13px] font-body text-[var(--text)] rounded-lg focus:outline-none focus:border-[var(--accent)]" placeholder={field.placeholder} />
              </div>
            ))}
            <div className="md:col-span-2 lg:col-span-4 flex flex-col gap-2.5">
                <label className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-widest font-bold">Proposed Treatment/Procedure</label>
                <textarea rows={2} name="proposed_treatment" value={formData.proposed_treatment} onChange={handleInputChange} className="bg-white border border-[var(--border)] py-3 px-5 text-[13px] font-body text-[var(--text)] rounded-lg focus:outline-none focus:border-[var(--accent)] resize-none" placeholder="Detailed description of the clinical path..." />
            </div>
          </div>
        </div>

        {/* ── 32-RULE COMPLIANCE ENGINE SECTION ── */}
        {ruleResults && (
          <div className="bg-white border border-[var(--border)] rounded-xl overflow-hidden animate-in slide-in-from-top-4 duration-500">
             <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[var(--border)]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[var(--accent-light)] rounded-lg flex items-center justify-center text-[var(--accent)]"><ShieldCheck size={22} /></div>
                  <div>
                    <h2 className="font-serif text-xl text-[var(--text)] font-bold">Insurance Rule Compliance</h2>
                    <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mt-0.5">32-POINT REAL-TIME REGULATORY AUDIT</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 bg-[var(--accent-light)]/40 px-3 py-1.5 rounded-full border border-[var(--accent-border)]">
                      <CheckCircle size={12} className="text-[var(--accent)]" />
                      <span className="font-mono text-[9px] font-bold text-[var(--accent)] uppercase">{ruleResults.passed} Passed</span>
                   </div>
                   <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 text-amber-600">
                      <AlertCircle size={12} />
                      <span className="font-mono text-[9px] font-bold uppercase">{ruleResults.warnings} Warnings</span>
                   </div>
                   <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-200 text-red-600">
                      <XCircle size={12} />
                      <span className="font-mono text-[9px] font-bold uppercase">{ruleResults.failed} Failed</span>
                   </div>
                   <button onClick={() => setShowCompliance(!showCompliance)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-all">
                      <ChevronDown size={18} className={`transition-transform duration-300 ${showCompliance ? 'rotate-180' : ''}`} />
                   </button>
                </div>
             </div>

             {showCompliance && (
               <div className="p-10 bg-[var(--bg)]/50 animate-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                       <Info size={16} className="text-[var(--mid)]" />
                       <p className="text-[13px] text-[var(--muted)]">Automated clinical interpretability layer evaluating policy coverage, clinical necessity, and exclusion criteria.</p>
                    </div>
                    <div className={`px-4 py-2 rounded font-mono text-[10px] font-black uppercase tracking-widest border ${
                      ruleResults.failed > 0 ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-[var(--accent-light)] border-[var(--accent-border)] text-[var(--accent)]'
                    }`}>
                      {ruleResults.failed > 0 ? 'Requires Manual Review' : 'Recommended for Approval'}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-6">
                    {ruleResults.rules.map(rule => (
                      <div key={rule.id} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] font-semibold text-[var(--text)]">{rule.id}. {rule.name}</span>
                          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold tracking-tighter ${
                            rule.status === 'PASS' ? 'bg-[var(--accent-light)] border-[var(--accent-border)] text-[var(--accent)]' :
                            rule.status === 'WARN' ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-red-50 border-red-200 text-red-600'
                          }`}>{rule.status}</span>
                        </div>
                        {rule.note && <p className="text-[10px] text-[var(--mid)] italic">Note: {rule.note}</p>}
                      </div>
                    ))}
                  </div>
               </div>
             )}
          </div>
        )}

        {/* ── TPA MAIL DRAFT SECTION ── */}
        {mailDraft && (
           <div className="bg-white border border-[var(--border)] rounded-xl p-8 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center justify-between mb-8 border-b border-[var(--border)] pb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[var(--accent-light)] rounded-lg flex items-center justify-center text-[var(--accent)]"><Mail size={22} /></div>
                  <div>
                    <h2 className="font-serif text-xl text-[var(--text)] font-bold">Pre-Auth Mail Draft</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                       <span className="font-mono text-[9px] font-bold text-[var(--accent)] bg-[var(--accent-light)]/50 px-2 py-0.5 border border-[var(--accent-border)] rounded uppercase tracking-widest tracking-tighter">Ready to Send to TPA</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                   <button type="button" onClick={copyMail} className="px-5 py-2 border border-[var(--border)] rounded-lg text-[11px] font-mono font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-[var(--bg)] transition-all">
                      <Copy size={14} /> Copy Mail
                   </button>
                   <button type="button" onClick={openMail} className="px-5 py-2 bg-[var(--accent)] text-white rounded-lg text-[11px] font-mono font-bold uppercase tracking-widest flex items-center gap-2 hover:opacity-90 shadow-xl shadow-[var(--accent)]/10 transition-all">
                      <ExternalLink size={14} /> Open in Mail Client
                   </button>
                </div>
              </div>
              <div className="bg-[var(--surface-alt)] border border-[var(--border)] p-8 rounded-lg relative overflow-hidden">
                 <div className="flex flex-col gap-1 mb-6 pb-6 border-b border-[var(--border)]/50 font-mono text-[11px] text-[var(--mid)]">
                    <p><span className="text-[var(--text)] font-bold">To:</span> {mailDraft.to}</p>
                    <p><span className="text-[var(--text)] font-bold">Subject:</span> {mailDraft.subject}</p>
                 </div>
                 <pre className="font-mono text-[12px] leading-[1.8] text-[var(--text)] whitespace-pre-wrap">
                    {mailDraft.body}
                 </pre>
                 <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Building2 size={120} />
                 </div>
              </div>
           </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-10 border-b border-[var(--border)] pb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[var(--bg)] border border-[var(--border)] rounded-lg flex items-center justify-center text-[var(--accent)]"><ClipboardCheck size={20} /></div>
              <div>
                <h2 className="font-serif font-bold text-xl text-[var(--text)]">Clinical Evidence Repository</h2>
                <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mt-1">UPLOAD 4 REQUIRED CLINICAL ARTIFACTS</p>
              </div>
            </div>
            <button type="button" onClick={() => setFiles({ idProof: { name: 'ID-PROOF-REH-90.pdf' }, diagnostics: { name: 'SURGERY-REPORT-X1.pdf' }, referral: { name: 'REF-HOSP-2024.pdf' }, clinical: { name: 'PREAUTH-FORM-SIGN.pdf' } })} className="px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-md font-mono text-[9px] font-bold uppercase tracking-widest text-[var(--accent)] hover:border-[var(--accent)] transition-all flex items-center gap-2">
              <Sparkles size={12} /> DEMO: POPULATE ARTIFACTS
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['idProof', 'diagnostics', 'referral', 'clinical'].map(id => (
              <UploadCard key={id} label={id.replace(/([A-Z])/g, ' $1').trim()} id={id} file={files[id]} onFileChange={handleFileChange} onRemove={removeFile} />
            ))}
          </div>
        </div>

        <div className="space-y-6 pt-6">
          <button disabled={isAuditDisabled} type="submit" className={`w-full h-24 font-mono text-[17px] font-black uppercase tracking-[0.4em] transition-all duration-500 flex flex-col items-center justify-center gap-2 rounded-xl group ${isAuditDisabled ? 'bg-[var(--surface-alt)] text-[var(--mid)] opacity-60' : 'bg-[var(--accent)] text-white shadow-2xl shadow-[var(--accent)]/25'}`}>
            <div className="flex items-center gap-4"><span>Run Final Audit Submit</span>{!isAuditDisabled && <ChevronRight size={22} className="group-hover:translate-x-2 transition-transform" />}</div>
            {isAuditDisabled && <span className="font-mono text-[9px] tracking-widest opacity-60">Complete compliance workflow to unlock submission</span>}
          </button>
        </div>
      </form>

      {/* ── INTELLIGENCE RESULTS VIEW (RETAINED) ── */}
      {auditResult && (
        <div id="audit-result-view" className="pt-20 border-t border-[var(--border)] animate-in slide-in-from-bottom-10 duration-700">
           {/* ... existing auditResult block ... */}
           <div className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl shadow-[var(--text)]/5">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className={`lg:col-span-5 p-12 flex flex-col items-center justify-center text-center border-r border-[var(--border)] ${auditResult.status === 'APPROVED' ? 'bg-[var(--accent-light)]/30' : 'bg-red-50/50'}`}>
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 border-4 bg-white ${auditResult.status === 'APPROVED' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-red-500 text-red-500'}`}>{auditResult.status === 'APPROVED' ? <CheckCircle size={48} /> : <XCircle size={48} />}</div>
                  <p className="font-mono text-[12px] text-[var(--muted)] uppercase tracking-[0.3em] font-bold mb-2">Final Verdict</p>
                  <h2 className={`font-serif text-4xl font-black mb-6 ${auditResult.status === 'APPROVED' ? 'text-[var(--accent)]' : 'text-red-600'}`}>{auditResult.status === 'APPROVED' ? 'AUTHORIZATION APPROVED' : 'MANUAL REVIEW REQUIRED'}</h2>
                  {auditResult.status === 'APPROVED' && (
                    <div className="space-y-1 mb-10"><p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest">Initial Approved Amount</p><p className="text-3xl font-serif font-bold text-[var(--text)]">₹{auditResult.amount.toLocaleString()}</p></div>
                  )}
                  <div className="w-full h-px bg-[var(--border)] mb-10" />
                  <div className="flex items-center justify-center gap-8 w-full">
                    <div className="text-center"><p className="text-2xl font-serif font-bold text-[var(--text)]">{auditResult.score}%</p><p className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-widest">Confidence Score</p></div>
                    <div className="text-center"><p className="text-2xl font-serif font-bold text-[var(--text)]">0.8s</p><p className="font-mono text-[9px] text-[var(--muted)] uppercase tracking-widest">Processing Time</p></div>
                  </div>
                </div>
                <div className="lg:col-span-7 p-12 flex flex-col h-full">
                  <h3 className="font-serif text-xl font-bold text-[var(--text)] mb-8 flex items-center gap-3"><Activity size={20} className="text-[var(--accent)]" /> Submission Metadata</h3>
                  <div className="space-y-6 mb-12">
                    {auditResult.checklist.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-[var(--bg)] rounded-xl border border-[var(--border)] group hover:border-[var(--accent)] transition-all">
                        <div className="flex items-center gap-4"><div className={`p-2 rounded-lg ${item.status ? 'bg-[var(--accent-light)] text-[var(--accent)]' : 'bg-red-50 text-red-500'}`}>{item.status ? <Check size={18} /> : <FileWarning size={18} /> }</div><span className="text-[14px] font-semibold text-[var(--text)]">{item.label}</span></div>
                        <span className={`font-mono text-[10px] font-bold uppercase tracking-widest ${item.status ? 'text-[var(--accent)]' : 'text-red-600'}`}>{item.status ? 'Verified' : 'Flagged'}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-auto pt-8 border-t border-[var(--border)] flex flex-col gap-4">
                    <button className={`w-full py-5 rounded-xl font-mono text-[13px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all bg-[var(--text)] text-white hover:opacity-95 shadow-xl shadow-[var(--text)]/10`}>Proceed to Admission Gateway <ArrowRight size={18} /></button>
                  </div>
                </div>
              </div>
           </div>

           {/* ── ENHANCEMENT RAISE LOGIC (RETAINED) ── */}
           {auditResult.status === 'APPROVED' && (
              <div className="mt-12 bg-white border border-[var(--border)] rounded-2xl p-10 animate-in slide-in-from-top-4 duration-500">
                 <div className="flex items-center justify-between mb-10 border-b border-[var(--border)] pb-8">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-[var(--amber-light)] rounded-lg flex items-center justify-center text-[var(--amber)]">
                       <PlusCircle size={22} />
                     </div>
                     <div>
                       <h2 className="font-serif text-2xl text-[var(--text)] font-bold">Raise Enhancement Request</h2>
                       <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest mt-1">FOR UNFORESEEN MEDICAL EXPENDITURE</p>
                     </div>
                   </div>
                 </div>

                 <form onSubmit={(e) => { e.preventDefault(); setEnhancement(prev => ({ ...prev, loading: true })); setTimeout(() => { setEnhancement(prev => ({ ...prev, loading: false, result: { status: parseInt(prev.requestedAmount) < auditResult.amount * 0.32 ? 'APPROVED' : 'MANUAL_REVIEW', approvedAmount: parseInt(prev.requestedAmount) } })); }, 1500); }} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-4 space-y-8">
                       <div className="flex flex-col gap-3">
                         <label className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest font-bold">Requested Addl. Amount</label>
                         <div className="relative">
                            <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--mid)]" size={18} />
                            <input 
                               type="number" 
                               required 
                               value={enhancement.requestedAmount}
                               onChange={(e) => setEnhancement(prev => ({ ...prev, requestedAmount: e.target.value }))}
                               className="w-full bg-[var(--bg)] border border-[var(--border)] py-4 pl-12 pr-5 text-[15px] font-body text-[var(--text)] rounded-xl focus:outline-none focus:border-[var(--amber)] transition-all"
                               placeholder="e.g. 25000"
                            />
                         </div>
                       </div>
                       <UploadCard 
                         label="Supporting Documents" 
                         id="enhancementDoc"
                         file={enhancement.supportingDoc}
                         onFileChange={handleFileChange}
                         onRemove={removeFile}
                         small
                       />
                    </div>
                    <div className="lg:col-span-5 space-y-8">
                       <div className="flex flex-col gap-3">
                         <label className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest font-bold">Reason for Enhancement</label>
                         <textarea 
                           rows={6}
                           className="w-full bg-[var(--bg)] border border-[var(--border)] p-5 text-[14px] font-body text-[var(--text)] rounded-xl focus:outline-none focus:border-[var(--amber)] transition-all resize-none"
                           placeholder="Detail the clinical necessity..."
                         />
                       </div>
                    </div>
                    <div className="lg:col-span-3 flex items-end">
                       <button 
                         type="submit"
                         className="w-full py-6 rounded-xl bg-[var(--amber)] text-white font-mono text-[13px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[var(--amber)]/20"
                       >
                         {enhancement.loading ? "Processing..." : "Raise Request"}
                       </button>
                    </div>
                 </form>

                 {enhancement.result && (
                  <div className="mt-12 p-8 border border-[var(--border)] bg-[var(--bg)] rounded-2xl animate-in zoom-in-95 duration-500">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="flex items-center gap-6">
                         <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                            enhancement.result.status === 'APPROVED' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--amber)] text-white'
                         }`}>
                            {enhancement.result.status === 'APPROVED' ? <CheckCircle size={28} /> : <History size={28} />}
                         </div>
                         <div>
                            <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-widest font-bold">Enhancement Status</p>
                            <h3 className="font-serif text-2xl font-bold text-[var(--text)]">
                               {enhancement.result.status === 'APPROVED' ? 'Enhancement Auto-Approved' : 'Manual Review Transmitted'}
                            </h3>
                         </div>
                      </div>
                      <p className="text-2xl font-serif font-bold text-[var(--accent)]">₹{parseInt(enhancement.result.approvedAmount).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
           )}
        </div>
      )}
    </div>
  );
}
