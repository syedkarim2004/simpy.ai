import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload as UploadIcon, FileText, CheckCircle2, 
  FileImage, ShieldCheck, Database, Info, 
  AlertCircle, X, Activity, ArrowRight, CornerDownRight
} from 'lucide-react';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(pdf|jpe?g|png)$/i)) {
      setError('Unsupported file type. Please upload a PDF or Image (JPG, PNG).');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }
    setFile(selectedFile);
  };

  const formatSize = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    
    // Clear stale session data
    localStorage.removeItem('report');
    localStorage.removeItem('entities');
    localStorage.removeItem('fhir_bundle');
    localStorage.removeItem('document_id');
    localStorage.removeItem('extraction_id');
    localStorage.removeItem('fhir_id');

    try {
      const response = await fetch('http://localhost:8000/ingest', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      localStorage.setItem('document_id', data.document_id);
      
      const hData = JSON.parse(localStorage.getItem('doc_history') || '[]');
      hData.unshift({
        id: data.document_id,
        filename: file.name,
        date: new Date().toISOString()
      });
      localStorage.setItem('doc_history', JSON.stringify(hData));

      navigate('/app/processing', { state: { document_id: data.document_id } });
    } catch (err) {
      setError('Failed to transmit document. Please verify your connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const recentDocs = JSON.parse(localStorage.getItem('doc_history') || '[]').slice(0, 4);

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] p-6 lg:p-10 font-body transition-all duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6 max-w-[1400px] mx-auto w-full">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <div className="w-1 h-5 bg-[var(--accent)] rounded-full" />
             <h4 className="font-mono text-[10px] text-[var(--accent)] font-bold uppercase tracking-widest">Document Ingestion</h4>
          </div>
          <h1 className="text-[42px] font-serif font-bold text-[var(--text)] leading-none tracking-tight">
            Clinical Indexing <span className="text-[var(--accent)] italic">Engine</span>
          </h1>
          <p className="text-[var(--muted)] text-[14px] mt-4 max-w-[540px] leading-relaxed">
            Securely upload medical artifacts for real-time clinical extraction, FHIR normalization, and automated reconciliation.
          </p>
        </div>
        
        <div className="flex gap-4">
            <div className="bg-white border border-[var(--border)] p-5 rounded-[8px] min-w-[160px] shadow-sm">
              <span className="block font-mono text-[9px] text-[var(--mid)] font-bold uppercase mb-2">Cycle Volume</span>
              <span className="text-[28px] font-serif font-bold text-[var(--text)] leading-none">{recentDocs.length > 0 ? recentDocs.length : '—'}</span>
            </div>
           <div className="bg-white border border-[var(--border)] p-5 rounded-[8px] min-w-[160px] shadow-sm">
              <span className="block font-mono text-[9px] text-[var(--mid)] font-bold uppercase mb-2">Core Status</span>
              <span className="text-[28px] font-serif font-bold text-[var(--accent)] leading-none">Active</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1400px] mx-auto w-full flex-1 min-h-0">
        
        {/* Main Dropzone Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           <div 
            className={`relative flex-1 min-h-[400px] border-2 border-dashed transition-all duration-300 rounded-[12px] flex flex-col items-center justify-center p-12 group bg-white shadow-sm
              ${dragActive ? 'border-[var(--accent)] bg-[var(--accent-light)]' : 'border-[var(--border)] hover:border-[var(--mid)]'}
              ${!file ? 'cursor-pointer' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !file && document.getElementById('file-upload').click()}
           >
             <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleChange}
            />

            {!file ? (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-[var(--surface-alt)] border border-[var(--border)] flex items-center justify-center rounded-[12px] group-hover:scale-105 transition-all text-[var(--mid)] group-hover:text-[var(--accent)] mx-auto">
                  <UploadIcon size={32} />
                </div>
                <div>
                  <h3 className="text-[22px] font-serif font-bold text-[var(--text)]">Deposit Artifact</h3>
                  <p className="text-[var(--muted)] text-[13px] mt-2">
                    Drag and drop file here, or <span className="text-[var(--accent)] font-bold hover:underline">browse files</span>
                  </p>
                </div>
                <div className="flex items-center justify-center gap-6 pt-6 text-[var(--mid)]">
                  <div className="flex items-center gap-2">
                    <FileText size={16} /> <span className="font-mono text-[9px] font-bold uppercase tracking-wider">PDF</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileImage size={16} /> <span className="font-mono text-[9px] font-bold uppercase tracking-wider">Image</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full max-w-md animate-in zoom-in-95 duration-300">
                <div className="bg-[var(--surface-alt)] border border-[var(--border)] p-8 rounded-[12px] relative group/file">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-[var(--mid)] hover:text-[var(--red)] hover:bg-white rounded-full transition-all"
                  >
                    <X size={18} />
                  </button>
                  
                  <div className="flex items-center gap-5 mb-6">
                    <div className="w-14 h-14 bg-white border border-[var(--border)] flex items-center justify-center rounded-[10px] text-[var(--accent)]">
                      <ShieldCheck size={28} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[9px] text-[var(--mid)] font-bold uppercase mb-1">Payload Staged</p>
                      <h4 className="text-[18px] font-serif font-bold text-[var(--text)] truncate">
                        {file.name}
                      </h4>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 bg-white border border-[var(--border)] p-3 rounded-[6px] text-center">
                       <p className="font-mono text-[8px] text-[var(--mid)] font-bold uppercase mb-1">File Size</p>
                       <p className="text-[var(--text)] font-semibold text-[13px]">{formatSize(file.size)}</p>
                    </div>
                    <div className="flex-1 bg-white border border-[var(--border)] p-3 rounded-[6px] text-center">
                       <p className="font-mono text-[8px] text-[var(--mid)] font-bold uppercase mb-1">Format</p>
                       <p className="text-[var(--accent)] font-bold text-[13px] uppercase">{file.type?.split('/')[1] || 'DOC'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
           </div>

           {error && (
            <div className="bg-[var(--red-light)] border border-red-200 p-4 rounded-[8px] flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="text-[var(--red)]" size={18} />
              <p className="text-[var(--red)] text-[12px] font-medium">{error}</p>
            </div>
          )}

          <button
            onClick={handleProcess}
            disabled={!file || loading}
            className={`w-full h-16 rounded-[8px] font-bold text-[16px] uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-md
              ${!file || loading 
                ? 'bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--mid)] cursor-not-allowed shadow-none' 
                : 'bg-[var(--accent)] text-white hover:opacity-95 shadow-[var(--accent)]/20'
              }
            `}
          >
            {loading ? (
               <>
                 <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Processing Document...
               </>
            ) : (
              <>
                 Execute Clinical Scan <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>

        {/* Info & History Panel */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white border border-[var(--border)] p-6 rounded-[12px] shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <Database size={18} className="text-[var(--accent)]" />
                <h3 className="font-serif text-[18px] text-[var(--text)]">Recent Activity</h3>
              </div>
              
              <div className="space-y-4">
                 {recentDocs.length > 0 ? recentDocs.map((doc, i) => (
                    <div key={i} className="group flex items-center justify-between p-3 bg-[var(--surface-alt)] rounded-[8px] hover:bg-[var(--accent-light)] transition-colors cursor-pointer">
                       <div className="min-w-0 pr-4">
                          <p className="text-[13px] font-semibold text-[var(--text)] truncate">{doc.filename}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="font-mono text-[9px] text-[var(--mid)] font-bold uppercase">ID: {doc.id.substring(0, 8)}</span>
                            <span className="w-1 h-1 bg-[var(--mid)] rounded-full" />
                            <span className="font-mono text-[9px] text-[var(--mid)] font-bold uppercase">{new Date(doc.date).toLocaleDateString()}</span>
                          </div>
                       </div>
                       <CheckCircle2 size={16} className="text-[var(--accent)] shrink-0" />
                    </div>
                 )) : (
                    <div className="text-center py-10 opacity-40">
                       <Info size={32} className="mx-auto mb-3" />
                       <p className="font-mono text-[10px] uppercase font-bold text-[var(--mid)]">No records present</p>
                    </div>
                 )}
              </div>
           </div>

           <div className="bg-[var(--surface-alt)] border border-[var(--border)] p-6 rounded-[12px]">
              <div className="flex items-center gap-3 mb-6">
                <Info size={18} className="text-[var(--amber)]" />
                <h3 className="font-serif text-[18px] text-[var(--text)]">Security Protocol</h3>
              </div>
              <ul className="space-y-4">
                 {[
                   'End-to-End Encryption Active (AES-256)',
                   'Automated PII/PHI Redaction Layer',
                   'LOINC & SNOMED CT Terminology Sync',
                   'Audit Trail Log Persistence'
                 ].map((text, i) => (
                    <li key={i} className="flex items-start gap-3">
                       <CornerDownRight size={14} className="text-[var(--amber)] mt-0.5 shrink-0" />
                       <span className="text-[12px] text-[var(--muted)] leading-relaxed">{text}</span>
                    </li>
                 ))}
              </ul>
           </div>
        </div>

      </div>
    </div>
  );
}
