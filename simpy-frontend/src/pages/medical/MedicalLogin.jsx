import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AlertCircle, Loader2, Plus, ArrowLeft } from 'lucide-react';

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
        localStorage.setItem("simpy_token", credentialResponse.credential);
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
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6 font-body">
      <div className="w-full max-w-[440px] bg-white border border-[var(--border)] p-10 rounded-[8px] shadow-sm relative overflow-hidden text-[var(--text)]">
        
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-[48px] h-[48px] bg-[var(--accent)] rounded-[10px] flex items-center justify-center mb-6">
            <Plus size={24} className="text-white" />
          </div>
          <h2 className="font-serif italic text-[22px] text-[var(--text)] leading-tight mb-2">
            Medical Team Portal
          </h2>
          <p className="font-mono text-[10px] text-[var(--muted)] uppercase tracking-[0.15em]">
            STANDARDIZED CLINICAL ACCESS
          </p>
        </div>

        <div className="w-full h-px bg-[var(--border)] mb-10" />

        {error && (
          <div className="w-full bg-[var(--red-light)] border border-[var(--red)] border-opacity-20 text-[var(--red)] p-4 rounded-[4px] flex items-start gap-3 mb-6 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-[13px] font-medium leading-snug">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin" />
            <p className="text-[var(--accent)] font-mono font-bold uppercase tracking-widest text-[10px]">Authenticating...</p>
          </div>
        ) : (
          <div className="w-full space-y-6">
            <div className="w-full flex justify-center py-1 bg-white border border-[var(--border)] rounded-[4px] overflow-hidden hover:bg-[var(--surface-alt)] transition-colors">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                shape="square"
                width="100%"
                text="signin_with"
              />
            </div>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-[var(--border)]"></div>
              <span className="flex-shrink mx-4 font-mono text-[9px] text-[var(--mid)] uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-[var(--border)]"></div>
            </div>

            <button 
              onClick={() => {
                setLoading(true);
                setTimeout(() => {
                  localStorage.setItem("simpy_user", JSON.stringify({
                    name: "Demo Physician",
                    email: "demo@simpy.ai",
                    picture: "https://api.dicebear.com/7.x/avataaars/svg?seed=physician"
                  }));
                  localStorage.setItem("simpy_portal", "medical");
                  localStorage.setItem("simpy_authed", "true");
                  localStorage.setItem("simpy_token", "mock_demo_token_123");
                  window.location.href = "http://localhost:5173/app";
                }, 800);
              }}
              className="w-full h-[46px] bg-white border border-[var(--border)] hover:border-[var(--accent)] text-[var(--muted)] hover:text-[var(--accent)] font-mono font-bold text-[10px] uppercase tracking-[0.1em] rounded-[4px] transition-all flex items-center justify-center gap-2 group"
            >
              DEVELOPER: USE DEMO ACCOUNT <span className="text-lg">→</span>
            </button>
          </div>
        )}

        <button 
          onClick={() => navigate('/')}
          className="w-full mt-10 font-mono text-[9px] text-[var(--muted)] uppercase tracking-widest hover:text-[var(--text)] transition-colors text-center flex items-center justify-center gap-2"
        >
          <ArrowLeft size={12} /> BACK TO PORTAL SELECT
        </button>

        <p className="mt-12 text-center text-[var(--mid)] font-mono text-[9px] uppercase tracking-[0.2em] leading-relaxed">
          SECURED BY SHA-256 & HIPAA COMPLIANT INFRASTRUCTURE
        </p>
      </div>
    </div>
  );
}
