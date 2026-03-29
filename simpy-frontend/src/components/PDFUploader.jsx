import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react';

export default function PDFUploader({ onUpload, status }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div 
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-[16px] p-12 transition-all duration-300 flex flex-col items-center justify-center text-center
        ${isDragging ? 'border-[var(--accent)] bg-[var(--accent-light)] scale-[1.01]' : 'border-[var(--border)] bg-[var(--surface-alt)] hover:border-[var(--mid)]'}
        ${status === 'uploading' || status === 'extracting' ? 'opacity-70 pointer-events-none' : ''}
      `}
    >
      <input 
        type="file" 
        accept=".pdf"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      <div className={`w-16 h-16 rounded-[12px] flex items-center justify-center mb-6 transition-all duration-500 ${
        status === 'success' ? 'bg-[var(--accent-light)] text-[var(--accent)] shadow-sm' : 'bg-white text-[var(--mid)]'
      }`}>
        {status === 'uploading' || status === 'extracting' ? (
          <Loader2 size={28} className="animate-spin text-[var(--accent)]" />
        ) : status === 'success' ? (
          <CheckCircle size={28} />
        ) : (
          <Upload size={28} />
        )}
      </div>

      <h3 className="text-[20px] font-serif font-bold text-[var(--text)] mb-2">
        {status === 'uploading' ? 'Uploading PDF...' : 
         status === 'extracting' ? 'AI Extracting Details...' : 
         status === 'success' ? 'Extraction Complete!' : 
         'Upload Settlement Summary'}
      </h3>
      
      <p className="text-[var(--muted)] text-[13px] font-medium max-w-[320px] leading-relaxed">
        {status === 'idle' ? 'Drag & drop your settlement PDF here or click to browse. Our clinical AI will parse the line items automatically.' : 
         status === 'success' ? 'Clinical data successfully mapped. View the intelligence breakdown below.' : 
         'Please wait while our extraction engine processes the clinical artifacts...'}
      </p>

      {status === 'idle' && (
        <div className="mt-8 px-5 py-2 bg-white border border-[var(--border)] rounded-full text-[10px] font-bold text-[var(--mid)] uppercase tracking-wider shadow-sm">
          Protected by AES-256 Encryption
        </div>
      )}
    </div>
  );
}
