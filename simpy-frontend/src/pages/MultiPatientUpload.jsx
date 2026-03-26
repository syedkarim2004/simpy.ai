import { useState } from 'react';
import { Upload, FileText, ChevronDown, ChevronUp, Loader2, User, Info, Database } from 'lucide-react';

export default function MultiPatientUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedRaw, setExpandedRaw] = useState({});

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Please select a valid PDF file.');
    }
  };

  const handleUpload = async () => {
    if (!file) {
        setError('Please select a PDF file first.');
        return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Upload failed. Please check backend connection.');
      }

      const result = await response.json();
      
      if (!result || !result.patients || !Array.isArray(result.patients)) {
          throw new Error('Invalid data format received from server.');
      }

      setData(result);
      setActiveTab(0);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRawData = (idx) => {
    setExpandedRaw((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const renderPatientCard = (patient, idx) => {
    if (!patient) return null;
    
    return (
        <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md animate-in fade-in slide-in-from-bottom-4">
        {/* Card Header */}
        <div className="bg-navy p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
            <div className="bg-teal/20 p-2 rounded-lg">
                <User className="w-5 h-5 text-teal" />
            </div>
            <div>
                <h3 className="text-white font-bold text-base">{patient?.patient_name || 'Unknown Patient'}</h3>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Patient #{patient?.patient_number || (idx + 1)}</p>
            </div>
            </div>
            <div className="bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            <span className="text-xs text-slate-300 font-bold">ID: {patient?.patient_id || 'N/A'}</span>
            </div>
        </div>

        <div className="p-6 space-y-6">
            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-navy" />
                <span className="text-xs font-bold text-navy uppercase tracking-widest">Metadata</span>
                </div>
                <div className="space-y-1">
                <p className="text-sm text-slate-600"><span className="font-bold text-slate-900">Age:</span> {patient?.age || 'Unknown'}</p>
                </div>
            </div>
            <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">Clinical Summary</span>
                </div>
                <p className="text-sm text-indigo-900/80 leading-relaxed font-medium">
                {patient?.summary || 'No summary available.'}
                </p>
            </div>
            </div>

            {/* Collapsible Raw Data */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
            <button
                onClick={() => toggleRawData(idx)}
                className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between transition-colors hover:bg-slate-100"
            >
                <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Raw Medical Data</span>
                </div>
                {expandedRaw[idx] ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
            </button>
            
            {expandedRaw[idx] && (
                <div className="p-4 bg-white border-t border-slate-200">
                <pre className="text-xs text-slate-600 font-mono whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto custom-scrollbar">
                    {patient?.raw_data || 'No raw data available.'}
                </pre>
                </div>
            )}
            </div>
        </div>
        </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header section */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-black text-navy tracking-tight">Multi-Patient PDF Processing</h1>
        <p className="text-slate-500 max-w-2xl mx-auto font-medium">
          Upload a medical document bundle containing multiple patient records. Our AI will automatically detect headers, split the data, and normalize individual patient snapshots.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border-2 border-dashed border-slate-200 flex flex-col items-center justify-center space-y-6 transition-all hover:border-teal/50">
        <div className="p-4 bg-teal/10 rounded-full">
          <Upload className="w-10 h-10 text-teal" />
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="px-6 py-2.5 bg-navy text-white rounded-lg font-bold text-sm cursor-pointer transition-all hover:bg-navy/90 hover:shadow-lg active:scale-95"
          >
            Browse PDF File
          </label>
          <p className="text-xs text-slate-400 font-medium italic">
            {file ? `Selected: ${file.name}` : 'Max file size: 25MB'}
          </p>
        </div>

        {file && (
          <button
            onClick={handleUpload}
            disabled={loading}
            className={`w-full max-w-xs py-3 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              loading 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-teal text-white shadow-lg shadow-teal/20 hover:scale-[1.02] active:scale-95'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing patients...
              </>
            ) : (
              'Start Intelligent Splitting'
            )}
          </button>
        )}

        {error && (
          <div className="w-full p-6 bg-red-50 border-2 border-red-200 rounded-2xl text-red-600 shadow-sm animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-lg shrink-0">
                    <Info className="w-5 h-5 text-red-600" />
                </div>
                <div>
                    <h4 className="font-black uppercase tracking-widest text-xs mb-1">Pipeline Error</h4>
                    <p className="text-sm font-bold leading-relaxed">{error}</p>
                </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {data && data.patients && data.patients.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <h2 className="text-xl font-bold text-navy flex items-center gap-3">
              Extraction Results
              <span className="px-3 py-1 bg-teal text-white text-xs font-black rounded-full uppercase tracking-tighter">
                {data.total_patients || data.patients.length} Patients Detected
              </span>
            </h2>
          </div>

          {data.patients.length > 1 ? (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Vertical Tabs */}
              <div className="lg:w-1/4 space-y-2">
                {data.patients.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all border-2 ${
                      activeTab === i
                        ? 'bg-teal border-teal text-white shadow-md shadow-teal/20'
                        : 'bg-white border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    Patient {p?.patient_number || (i + 1)}: {p?.patient_name || 'Individual'}
                  </button>
                ))}
              </div>

              {/* Active Content */}
              <div className="flex-1">
                {renderPatientCard(data.patients[activeTab], activeTab)}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {renderPatientCard(data.patients[0], 0)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
