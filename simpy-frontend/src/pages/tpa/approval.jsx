import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

const S = {
  // Layout & Cards
  card: { background: '#FAFAF7', border: '1px solid #D9D4CB', borderRadius: '8px', padding: '24px' },
  cardLabel: { fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B6560', marginBottom: '8px', fontWeight: '600', display: 'block' },
  
  // Headers
  headerLabel: { fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B6560', marginBottom: '4px' },
  headerTitle: { fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '32px', lineHeight: '1.2', marginBottom: '8px', color: '#1A1A1A' },
  headerSub: { color: '#6B6560', fontSize: '14px', lineHeight: '1.7', maxWidth: '480px' },
  
  // Form Elements
  formGroup: { marginBottom: '16px' },
  label: { fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6560', marginBottom: '6px', display: 'block', fontWeight: '600' },
  input: { width: '100%', padding: '10px 14px', border: '1.5px solid #D9D4CB', borderRadius: '5px', background: '#F4F1EC', color: '#1A1A1A', fontFamily: '"Instrument Sans", Inter, sans-serif', fontSize: '14px', outline: 'none' },
  select: { width: '100%', padding: '10px 14px', border: '1.5px solid #D9D4CB', borderRadius: '5px', background: '#F4F1EC', color: '#1A1A1A', fontFamily: '"Instrument Sans", Inter, sans-serif', fontSize: '14px', outline: 'none' },
  textarea: { width: '100%', padding: '10px 14px', border: '1.5px solid #D9D4CB', borderRadius: '5px', background: '#F4F1EC', color: '#1A1A1A', fontFamily: '"Instrument Sans", Inter, sans-serif', fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '80px' },
  
  // Buttons
  btnPrimary: { background: '#2D6A4F', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '600', fontFamily: '"Instrument Sans", Inter, sans-serif' },
  btnSecondary: { background: 'transparent', color: '#2D6A4F', padding: '10px 20px', borderRadius: '5px', border: '1.5px solid #2D6A4F', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '600', fontFamily: '"Instrument Sans", Inter, sans-serif' },

  // Grid
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },

  // Table
  th: { textAlign: 'left', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B6560', padding: '8px 12px', borderBottom: '1.5px solid #D9D4CB', fontWeight: '600' },
  td: { padding: '12px', borderBottom: '1px solid #D9D4CB', fontSize: '13px', color: '#1A1A1A' },

  // Pills
  pillGreen: { display: 'inline-block', fontSize: '10px', padding: '3px 8px', borderRadius: '10px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', background: '#D8F3DC', color: '#006D44' },
  pillAmber: { display: 'inline-block', fontSize: '10px', padding: '3px 8px', borderRadius: '10px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', background: '#FEF3C7', color: '#92400E' },
  pillRed: { display: 'inline-block', fontSize: '10px', padding: '3px 8px', borderRadius: '10px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', background: '#FEE2E2', color: '#991B1B' },
}

const MOCK_PATIENTS = [
  { id: 1, name: 'Rajesh Kumar', uhid: 'BH-2024-9921', tpa: 'MediAssist', diagnosis: 'Dengue Fever', estimatedCost: 85000, submittedAt: new Date(Date.now() - 42 * 60000), status: 'UNDER_REVIEW' },
  { id: 2, name: 'Priya Sharma', uhid: 'BH-2024-9925', tpa: 'Vidal Health', diagnosis: 'Acute Appendicitis', estimatedCost: 120000, submittedAt: new Date(Date.now() - 67 * 60000), status: 'QUERY_RAISED' },
]

export default function Approval() {
  const { data, loading: globalLoading, moveStage, getTatStatus, getExtraInfo } = useOutletContext()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('PENDING')
  const [selectedCaseId, setSelectedCaseId] = useState(null)
  const [recommendations, setRecommendations] = useState([]);

  const stageCases = data?.filter(c => c.stage === 2) || []
  const activeCase = selectedCaseId ? stageCases.find(c => c.id === selectedCaseId) : null

  const generateRecommendations = (data) => {
    if (!data) {
      setRecommendations([]);
      return;
    }
    
    let recs = [];
    // APPROVAL LOGIC
    if (data.estimatedCost > 150000) {
      recs.push("⚠ High claim amount – consider requesting additional justification");
    }
    if (data.tat > 60) {
      recs.push("🚨 TAT breached – escalate to TPA immediately");
    }
    if (data.tpa === "MediAssist") {
      recs.push("🏥 MediAssist cases usually respond within 1 hour");
    }
    if (data.diagnosis?.toLowerCase().includes("fracture")) {
      recs.push("🦴 Ensure X-ray and orthopedic notes are attached");
    }

    setTimeout(() => setRecommendations(recs), 400);
  };

  React.useEffect(() => {
    generateRecommendations(activeCase);
  }, [activeCase]);

  const simulateAction = (callback) => {
    setLoading(true);
    setTimeout(() => {
      callback();
      setLoading(false);
    }, Math.random() * 800 + 800);
  };

  const getPillStyle = (res) => ({
    display: 'inline-block', fontSize: '10px', padding: '3px 8px', borderRadius: '10px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase',
    background: res.bg, color: res.color
  });

  if (stageCases.length === 0 && activeTab === 'PENDING') {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#FAFAF7', border: '1px solid #D9D4CB', borderRadius: '8px' }}>
        <div style={S.headerTitle}>No Pending Approvals</div>
        <p style={S.headerSub}>All Stage 02 cases have been processed. Total cases: {data?.length || 0}</p>
      </div>
    )
  }

  return (
    <div>
      {loading && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            width: 40,
            height: 40,
            border: "4px solid #e5e7eb",
            borderTop: "4px solid #166534",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }} />
        </div>
      )}
      {globalLoading && (
        <div style={{ background: '#FEF3C7', padding: '12px 16px', borderRadius: '6px', marginBottom: '24px', color: '#D97706', fontSize: '12px', fontWeight: '600', border: '1px solid #D9D4CB' }}>
          ⌛ Processing request...
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={S.headerLabel}>Stage 02 · TPA Response</div>
          <h1 style={S.headerTitle}>Pre-Auth Approval</h1>
          <p style={S.headerSub}>Track TPA real-time responses, respond to queries, and record authorized amounts.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {globalLoading && <span style={{ ...S.pillAmber, alignSelf: 'center' }}>Processing...</span>}
          <button style={S.btnSecondary} disabled={globalLoading || loading}>REFRESH STATUS ↻</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #D9D4CB' }}>
        {['PENDING', 'APPROVED', 'QUERY'].map(tab => (
          <div
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 20px', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
              color: activeTab === tab ? '#2D6A4F' : '#6B6560',
              borderBottom: activeTab === tab ? '2px solid #2D6A4F' : '2px solid transparent',
            }}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </div>
        ))}
      </div>

      {activeTab === 'PENDING' && (
        <div style={{ ...S.card, padding: 0, overflow: 'hidden', marginBottom: '32px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAF7' }}>
                <th style={S.th}>Patient / UHID</th>
                <th style={S.th}>TPA</th>
                <th style={S.th}>Diagnosis</th>
                <th style={S.th}>TAT Status</th>
                <th style={S.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {stageCases.map(p => {
                const tatStatus = getTatStatus(p.tat)
                return (
                  <tr key={p.id}>
                    <td style={S.td}>
                      <div style={{ fontWeight: '600' }}>{p.patient}</div>
                      <div style={{ fontSize: '11px', color: '#6B6560' }}>{p.uhid}</div>
                    </td>
                    <td style={S.td}>{p.tpa}</td>
                    <td style={S.td}>{p.diagnosis}</td>
                    <td style={S.td}><span style={getPillStyle(tatStatus)}>{tatStatus.text} · {p.tat}m</span></td>
                    <td style={S.td}>
                      <button 
                        style={{ ... (selectedCaseId === p.id ? S.btnPrimary : S.btnSecondary), opacity: loading ? 0.6 : 1 }}
                        onClick={() => {
                          simulateAction(() => {
                            setSelectedCaseId(p.id);
                          });
                        }}
                        disabled={loading}
                      >
                        {loading && selectedCaseId === p.id ? 'SELECTING...' : (selectedCaseId === p.id ? 'SELECTED' : 'SELECT')}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div style={S.card}>
        <span style={S.cardLabel}>Record TPA Authorization Letter</span>
        <div style={S.grid2}>
          <div style={S.formGroup}>
            <label style={S.label}>Selected Patient</label>
            <input 
              style={S.input} 
              value={activeCase ? `${activeCase.patient} (${activeCase.uhid})` : "Select a patient from the list above"} 
              disabled 
            />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Authorized Amount ₹</label>
            <input style={S.input} defaultValue={activeCase?.estimatedCost?.toLocaleString() || ""} />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Auth Letter No.</label>
            <input style={S.input} placeholder="e.g. MA-2024-XXXX" />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Conditions / Notes</label>
            <textarea style={S.textarea} placeholder="Copy-paste conditions from letter..." />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            style={{ ...S.btnPrimary, opacity: globalLoading || loading || !activeCase ? 0.6 : 1, cursor: globalLoading || loading || !activeCase ? 'not-allowed' : 'pointer' }}
            onClick={() => activeCase && moveStage(activeCase.id, 3)}
            disabled={globalLoading || loading || !activeCase}
          >
            {globalLoading ? 'RECORDING...' : 'RECORD APPROVAL → PROCEED TO ADMISSION'}
          </button>
        </div>

        {recommendations.length > 0 && (
          <div style={{
            marginTop: 20,
            padding: 15,
            background: "#fef9c3",
            borderRadius: 10,
            border: "1px solid #fde047"
          }}>
            <strong style={{ fontSize: '13px', color: '#854d0e', display: 'block', marginBottom: '8px' }}>Smart Suggestions:</strong>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#854d0e' }}>
              {recommendations.map((rec, i) => (
                <li key={i} style={{ marginBottom: '4px' }}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
