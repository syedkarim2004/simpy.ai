import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Lock, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function MedicalLogin() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("simpy_user", JSON.stringify(data.user));
        localStorage.setItem("simpy_portal", "medical");
        localStorage.setItem("simpy_authed", "true");
        // Redirect to medical dashboard as requested
        window.location.href = "http://localhost:5173/app";
      } else {
        setError(data.error || 'Authentication failed. Please try again.');
      }
    } catch (err) {
      setError('Connection to security server failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05)_0%,rgba(2,6,23,1)_100%)]" />
      <div 
        className="absolute inset-0 opacity-[0.02]" 
        style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px' 
        }} 
      />

      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-10 shadow-2xl overflow-hidden relative">
          {/* Subtle Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
          
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 transition-transform hover:scale-110 duration-500">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
            
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Medical Team Portal</h2>
            <p className="text-slate-400 font-medium">Standardized Clinical Access</p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-6">
            {error && (
              <div className="w-full bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-relaxed">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-emerald-500 font-black uppercase tracking-widest text-xs">Authenticating...</p>
              </div>
            ) : (
              <div className="w-full flex justify-center py-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_blue"
                  shape="pill"
                  width="100%"
                />
              </div>
            )}

            <p className="text-slate-500 text-xs font-medium text-center px-4 leading-relaxed">
              Use your authorized institution Google account to access clinical records.
            </p>
          </div>
          
          <button 
            onClick={() => navigate('/')}
            className="w-full mt-10 text-slate-500 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Portal Select
          </button>
        </div>

        <p className="mt-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
          Secured by SHA-256 & HIPAA Compliant Infrastructure
        </p>
      </div>
    </div>
  );
}
