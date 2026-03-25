import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; }
  .google-btn:hover { background: #1a1a1a !important; }
  .google-btn:active { transform: scale(0.99); }
  .google-btn { transition: background 0.15s; }
`;

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff" opacity="0.9"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" opacity="0.9"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#fff" opacity="0.9"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" opacity="0.9"/>
    </svg>
  );
}

export default function Login() {
  const navigate = useNavigate();

  const handleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const profile = await res.json();
        
        localStorage.setItem('simpy_token', tokenResponse.access_token);
        localStorage.setItem('simpy_user', JSON.stringify(profile));
        localStorage.setItem('simpy_authed', 'true');
        
        navigate('/app');
      } catch (err) {
        console.error('Failed to fetch user profile', err);
      }
    },
    onError: error => console.error('Login Failed:', error)
  });

  return (
    <>
      <style>{STYLES}</style>
      <div style={{
        fontFamily: "'Inter', sans-serif",
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
      }}>

        {/* ── LEFT PANEL — white ─────────────────────────────── */}
        <div style={{
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          padding: '40px 56px',
        }}>
          {/* Logo */}
          <div style={{ fontWeight: 800, fontSize: 17, color: '#111827', letterSpacing: '-0.3px', marginBottom: 'auto' }}>
            Simpy.ai
          </div>

          {/* Center content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 40 }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              background: '#f1f5f9', border: '1px solid #e2e8f0',
              borderRadius: 999, padding: '5px 14px',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
              color: '#475569', textTransform: 'uppercase', marginBottom: 28,
              width: 'fit-content',
            }}>
              Clinical Data Normalization
            </div>

            <h1 style={{
              fontSize: 42, fontWeight: 900, lineHeight: 1.1,
              letterSpacing: '-1.5px', color: '#111827', marginBottom: 20,
            }}>
              Fixing the gap<br />
              between clinical<br />
              data and billing<br />
              systems.
            </h1>

            <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.65, marginBottom: 36, maxWidth: 400 }}>
              Simpy.ai standardizes medical records into FHIR-compliant data and ensures billing accuracy.
            </p>

            {/* Google button */}
            <button
              className="google-btn"
              onClick={() => handleSignIn()}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                background: '#111827', color: '#fff',
                border: 'none', borderRadius: 10,
                padding: '16px 28px', width: '100%', maxWidth: 360,
                fontSize: 16, fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
              }}>
              <GoogleIcon />
              Continue with Google
            </button>

            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 14, lineHeight: 1.6, maxWidth: 360 }}>
              Authorized access only. For healthcare professionals. Secure, encrypted, and compliant.
            </p>

            {/* Trust strip */}
            <div style={{
              display: 'flex', gap: 24, alignItems: 'center',
              marginTop: 56,
              paddingTop: 28, borderTop: '1px solid #f1f5f9',
              flexWrap: 'wrap',
            }}>
              {[
                {
                  icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>,
                  label: 'HIPAA READY',
                },
                {
                  icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>,
                  label: 'END-TO-END ENCRYPTED',
                },
                {
                  icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5"/></svg>,
                  label: 'FHIR COMPLIANT',
                },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ color: '#6b7280' }}>{icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', letterSpacing: '0.06em' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — dark teal ────────────────────────── */}
        <div style={{
          background: 'linear-gradient(160deg, #0A4A4A 0%, #063232 50%, #041E1E 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Subtle grid */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

          {/* Patient Card */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '20px 24px',
            width: '100%', maxWidth: 380,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative', zIndex: 1,
          }}>
            {/* Card header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                </svg>
              </div>
              <div style={{
                background: '#0D9488', color: '#fff',
                fontSize: 9, fontWeight: 800, padding: '4px 10px',
                borderRadius: 6, letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                FHIR Status: Ready
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Patient Name</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>Sarah Johnson</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Diagnosis</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Type 2 Diabetes</p>
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>ICD-10 Code</p>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>E11.9</p>
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#f8fafc', borderRadius: 8, padding: '10px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#0D9488" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                </svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Mapped to FHIR</span>
              </div>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="8" height="8" fill="none" viewBox="0 0 24 24" stroke="#9ca3af" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Billing anomaly tag — below card */}
          <div style={{
            marginTop: 12, width: '100%', maxWidth: 380,
            background: '#fff',
            border: '1.5px solid #fee2e2',
            borderRadius: 10, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
            position: 'relative', zIndex: 1,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#dc2626" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, color: '#dc2626', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>Billing Anomaly Detected</p>
              <p style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Billing Code Missing → <strong style={{ color: '#111827' }}>Flagged</strong></p>
            </div>
          </div>

          {/* Footer text */}
          <p style={{
            position: 'absolute', bottom: 24,
            fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            © 2024 Simpy.ai. HIPAA Ready & End-to-End Encrypted.
          </p>
        </div>
      </div>
    </>
  );
}
