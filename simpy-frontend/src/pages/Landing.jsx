import { useNavigate } from 'react-router-dom';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; }
  .nav-lnk { color: #6b7280; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; }
  .nav-lnk:hover { color: #111827; }
  .nav-lnk.active { color: #0D9488; border-bottom: 2px solid #0D9488; padding-bottom: 2px; }
  .btn-primary { background: #111827; color: #fff; border: none; padding: 12px 24px; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-family: 'Inter', sans-serif; }
  .btn-primary:hover { background: #1f2937; }
  .btn-secondary { background: #f9fafb; color: #374151; border: 1.5px solid #e5e7eb; padding: 12px 24px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; font-family: 'Inter', sans-serif; }
  .btn-secondary:hover { background: #f3f4f6; }
  .step-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 32px 28px; background: #fff; }
  .step-card:hover { border-color: #d1d5db; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
  .feature-item { display: flex; align-items: flex-start; gap: 12px; padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .feature-item:last-child { border-bottom: none; }
  .schedule-btn { background: #0D9488; color: #fff; border: none; padding: 14px 28px; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Inter', sans-serif; margin-top: 32px; }
  .schedule-btn:hover { background: #0f766e; }
`;

export default function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ fontFamily: "'Inter', sans-serif", background: '#fff', color: '#111827', minHeight: '100vh' }}>

        {/* ── NAVBAR ─────────────────────────────────────────── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: '#fff', borderBottom: '1px solid #f3f4f6',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 48px', height: 64,
        }}>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#111827', letterSpacing: '-0.3px' }}>Simpy.ai</span>

          <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
            <a className="nav-lnk active">Platform</a>
            <a className="nav-lnk">Security</a>
            <a className="nav-lnk">Compliance</a>
          </div>

          <button className="btn-primary" style={{ padding: '9px 22px', fontSize: 14 }} onClick={() => navigate('/login')}>
            Sign In
          </button>
        </nav>

        {/* ── HERO ───────────────────────────────────────────── */}
        <section style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '72px 48px 80px',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 64, alignItems: 'center',
        }}>
          {/* Left */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center',
              background: '#CCFBF1', color: '#0D9488',
              borderRadius: 999, padding: '5px 14px',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', marginBottom: 28,
            }}>
              Clinical Data Normalization
            </div>

            <h1 style={{
              fontSize: 52, fontWeight: 900, lineHeight: 1.1,
              letterSpacing: '-1.5px', color: '#111827', marginBottom: 24,
            }}>
              Fixing the gap<br />
              between{' '}
              <span style={{ color: '#0D9488' }}>clinical data</span>
              <br />
              and billing systems.
            </h1>

            <p style={{ fontSize: 16, lineHeight: 1.7, color: '#6b7280', marginBottom: 36, maxWidth: 480 }}>
              Simpy.ai transforms unstructured medical records into standardized FHIR data and ensures billing accuracy through intelligent reconciliation.
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-primary" onClick={() => navigate('/login')}>Get Started</button>
              <button className="btn-secondary" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                View Demo
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Right — Product Mockup Card */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{
              width: '100%', maxWidth: 420,
              border: '1px solid #e5e7eb', borderRadius: 16,
              overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
              background: '#fff',
            }}>
              {/* Card header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '18px 20px', borderBottom: '1px solid #f3f4f6',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 1 }}>Patient Profile</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Sarah Jenkins</p>
                  </div>
                </div>
                <div style={{
                  background: '#CCFBF1', color: '#0D9488',
                  fontSize: 10, fontWeight: 700, padding: '4px 10px',
                  borderRadius: 999, letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  Mapped to FHIR
                </div>
              </div>

              {/* Diagnosis / ICD row */}
              <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, borderBottom: '1px solid #f3f4f6' }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Diagnosis</p>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px', fontSize: 14, fontWeight: 600, color: '#111827' }}>
                    Type 2 Diabetes
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>ICD-10 Code</p>
                  <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px', fontSize: 14, fontWeight: 600, color: '#111827' }}>
                    E11.9
                  </div>
                </div>
              </div>

              {/* Reconciliation Status */}
              <div style={{ padding: '18px 20px', background: '#0A1628', margin: '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#0D9488', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Reconciliation Status</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <p style={{ fontSize: 26, fontWeight: 900, color: '#fff' }}>100% Match</p>
                  <p style={{ fontSize: 11, color: '#6b7280' }}>Claims validated against EHR</p>
                </div>
                {/* Progress bar */}
                <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 99, marginTop: 12 }}>
                  <div style={{ width: '100%', height: '100%', background: '#0D9488', borderRadius: 99 }} />
                </div>
              </div>

              {/* Footer row */}
              <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9ca3af' }}>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span style={{ fontSize: 11 }}>Updated 2m ago</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#0D9488', cursor: 'pointer' }}>
                  View JSON →
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUST STRIP ─────────────────────────────────────── */}
        <section style={{ borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', padding: '20px 48px' }}>
          <div style={{
            maxWidth: 1200, margin: '0 auto',
            display: 'flex', gap: 56, alignItems: 'center', flexWrap: 'wrap',
          }}>
            {[
              {
                icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>,
                label: 'HIPAA Ready',
              },
              {
                icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>,
                label: 'End-to-End Encrypted',
              },
              {
                icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/></svg>,
                label: 'FHIR Compliant',
              },
              {
                icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"/></svg>,
                label: 'Institutional Security',
              },
            ].map(({ icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <span style={{ color: '#6b7280' }}>{icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── THREE STEPS ─────────────────────────────────────── */}
        <section id="how-it-works" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 48px' }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: '#111827', letterSpacing: '-1px' }}>
              Three steps to clean data
            </h2>
            <div style={{ width: 40, height: 3, background: '#0D9488', borderRadius: 99, margin: '16px auto 0' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 56 }}>
            {[
              {
                icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>,
                num: '1.',
                title: 'Upload documents',
                desc: 'Securely ingest PDFs, scanned lab reports, and discharge summaries via API or UI.',
              },
              {
                icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z"/></svg>,
                num: '2.',
                title: 'AI extracts & structures',
                desc: 'Our clinical LLM parses unstructured text into normalized FHIR R4 resources instantly.',
              },
              {
                icon: <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#6b7280" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"/></svg>,
                num: '3.',
                title: 'Reconcile billing claims',
                desc: 'Automatically match clinical evidence with billing codes to eliminate revenue leakage.',
              },
            ].map((step) => (
              <div key={step.num} className="step-card">
                <div style={{ marginBottom: 20 }}>{step.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111827', marginBottom: 10, letterSpacing: '-0.3px' }}>
                  {step.num} {step.title}
                </h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#6b7280' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── BUILT FOR HEALTHCARE ────────────────────────────── */}
        <section style={{ background: '#0A1628' }}>
          <div style={{
            maxWidth: 1200, margin: '0 auto', padding: '80px 48px',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center',
          }}>
            {/* Left */}
            <div>
              <h2 style={{ fontSize: 38, fontWeight: 900, color: '#fff', letterSpacing: '-1.2px', lineHeight: 1.15, marginBottom: 20 }}>
                Built for real healthcare workflows
              </h2>
              <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.75 }}>
                Healthcare data is messy. Simpy.ai was designed by clinicians and billing experts to handle the edge cases that standard OCR systems miss.
              </p>
              <button className="schedule-btn">Schedule a Technical Deep-Dive</button>
            </div>

            {/* Right — feature list */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 16, padding: '8px 28px',
            }}>
              {[
                {
                  title: 'Unstructured Data Ingestion',
                  desc: 'Works with PDFs, lab reports, discharge summaries, and handwritten notes.',
                },
                {
                  title: 'Standardized Interoperability',
                  desc: 'Converts all extracted medical records to the FHIR R4 standard for easy EHR integration.',
                },
                {
                  title: 'Automated Reconciliation',
                  desc: 'Detects billing mismatches automatically between clinical notes and submitted claims.',
                },
              ].map((f, i) => (
                <div key={i} className="feature-item">
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: '#0D9488', flexShrink: 0, marginTop: 6,
                  }} />
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{f.title}</p>
                    <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.65 }}>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOTER ──────────────────────────────────────────── */}
        <footer style={{ background: '#fff', borderTop: '1px solid #f3f4f6' }}>
          <div style={{
            maxWidth: 1200, margin: '0 auto', padding: '28px 48px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <span style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>Simpy.ai</span>
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                © 2026 Simpy.ai. Institutional Grade Security.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 36 }}>
              {['Privacy Policy', 'Terms of Service', 'Compliance'].map(l => (
                <span key={l} style={{ fontSize: 12, color: '#6b7280', cursor: 'pointer', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{l}</span>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
