import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, FileText, CheckCircle2, ChevronRight, FileImage, ShieldCheck } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function TorusKnot() {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.15;
    meshRef.current.rotation.y += delta * 0.2;
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[2, 0.6, 128, 32]} />
      <meshStandardMaterial color="#0D9488" roughness={0.2} metalness={0.7} />
    </mesh>
  );
}

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
      setError('Invalid file type. Please upload a PDF, JPG, or PNG.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
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

    try {
      const response = await fetch('http://localhost:8000/ingest', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      localStorage.setItem('document_id', data.document_id);
      
      // Add to local history list
      const hData = JSON.parse(localStorage.getItem('doc_history') || '[]');
      hData.unshift({
        id: data.document_id,
        filename: file.name,
        date: new Date().toISOString()
      });
      localStorage.setItem('doc_history', JSON.stringify(hData));

      navigate('/app/processing', { state: { document_id: data.document_id } });
    } catch (err) {
      setError('Upload failed. Please check the backend connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const recentDocs = JSON.parse(localStorage.getItem('doc_history') || '[]').slice(0, 3);
  const mockDocs = recentDocs.length > 0 ? recentDocs : [
    { filename: 'apollo_lab_results_03.jpg', date: '2 hours ago', score: 98 },
    { filename: 'tata_memorial_discharge.pdf', date: '5 hours ago', score: 92 },
    { filename: 'max_health_prescription.pdf', date: '1 day ago', score: 85 }
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 mb-6 uppercase tracking-widest pl-2">
        <span>Dashboard</span> <ChevronRight className="w-4 h-4" /> <span className="text-teal">Upload</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LEFT SIDE: Upload Area (60%) */}
        <div className="lg:w-[60%] flex flex-col bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
          
          <h1 className="text-3xl font-black text-navy mb-2 relative z-10">Document Ingestion</h1>
          <p className="text-slate-500 font-medium text-sm mb-8 relative z-10">
            Securely upload PDFs, scanned reports, lab results, and prescriptions for processing.
          </p>

          <div 
            className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all bg-slate-50
              ${dragActive ? 'border-teal shadow-[inset_0_0_20px_rgba(13,148,136,0.1)]' : 'border-slate-300'}
              ${!file ? 'cursor-pointer hover:border-teal hover:bg-slate-100' : ''}
              relative z-10 min-h-[300px]
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
            
             <div className="absolute top-4 right-4 flex gap-2">
                <div className="bg-white p-2 rounded shadow-sm border border-slate-100 flex items-center justify-center text-red-500 tooltip" title="PDF Supported"><FileText className="w-4 h-4"/></div>
                <div className="bg-white p-2 rounded shadow-sm border border-slate-100 flex items-center justify-center text-blue-500 tooltip" title="Images Supported"><FileImage className="w-4 h-4"/></div>
             </div>

            {!file ? (
              <>
                <div className="w-20 h-20 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-6 text-navy transition-transform group-hover:scale-110">
                  <UploadIcon className="w-10 h-10" />
                </div>
                <p className="text-navy font-black text-xl">Drop your file here</p>
                <p className="text-slate-500 font-medium text-sm mt-2">or <span className="text-teal hover:underline underline-offset-4 cursor-pointer">click to browse directory</span></p>
                <p className="text-slate-400 text-xs mt-4">Max file size: 10MB</p>
              </>
            ) : (
              <div className="flex flex-col items-center w-full max-w-md bg-white p-6 rounded-xl border border-teal shadow-md relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-16 h-16 bg-teal/10 rounded-bl-full z-0 transition-transform group-hover:scale-150"></div>
                 <ShieldCheck className="w-12 h-12 text-teal mb-4 relative z-10" />
                 <p className="text-navy font-bold text-lg text-center break-all px-4 relative z-10">{file.name}</p>
                 <div className="flex items-center gap-4 mt-3 relative z-10">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{formatSize(file.size)}</span>
                    <span className="bg-teal/10 text-teal px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{file.type?.split('/')[1] || 'DOC'}</span>
                 </div>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-6 text-sm font-bold text-red-500 hover:text-red-700 transition-colors bg-red-50 px-4 py-2 rounded-lg relative z-10 w-full"
                  disabled={loading}
                >
                  Discard & Select New
                </button>
              </div>
            )}
          </div>

          {error && (
            <p className="text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 text-sm mt-4 font-bold">{error}</p>
          )}

          <button
            onClick={handleProcess}
            disabled={!file || loading}
            className={`w-full mt-8 py-4 rounded-xl font-black text-white text-lg tracking-wide transition-all shadow-lg flex items-center justify-center gap-3
              ${!file || loading 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                : 'bg-gradient-to-r from-teal to-[#0f766e] hover:shadow-teal/40 hover:-translate-y-0.5'
              }
            `}
          >
            {loading ? (
               <>
                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Uploading...
               </>
            ) : 'Process Document →'}
          </button>
        </div>

        {/* RIGHT SIDE: 3D Visualization & History (40%) */}
        <div className="hidden lg:flex lg:w-[40%] flex-col gap-6">
            <div className="h-[350px] rounded-2xl overflow-hidden bg-[#0A1628] shadow-sm border border-slate-200 relative">
                <div className="absolute inset-0 z-0 opacity-80">
                <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1.5} />
                    <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0D9488" />
                    <TorusKnot />
                    <OrbitControls enableZoom={false} autoRotate={false} />
                </Canvas>
                </div>
            </div>

            <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
               <h3 className="text-navy font-bold flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                 <FileText className="w-5 h-5"/> Recent Documents
               </h3>
               <div className="space-y-3">
                  {mockDocs.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 cursor-pointer">
                          <div className="flex items-center gap-3">
                              <div className="bg-blue-50 text-blue-600 p-2 rounded"><FileText className="w-4 h-4"/></div>
                              <div className="overflow-hidden">
                                  <p className="text-navy font-bold text-sm truncate max-w-[150px]" title={doc.filename}>{doc.filename}</p>
                                  <p className="text-slate-500 text-xs font-medium">{doc.date || 'Recently'}</p>
                              </div>
                          </div>
                          {doc.score && <span className="text-teal bg-teal/10 px-2 py-1 rounded text-xs font-bold">{doc.score}/100</span>}
                      </div>
                  ))}
               </div>
            </div>
        </div>

      </div>
    </div>
  );
}
