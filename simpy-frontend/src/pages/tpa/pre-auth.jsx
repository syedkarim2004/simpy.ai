import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

const S = {
  // Layout & Cards
  card: { background: '#FAFAF7', border: '1px solid #D9D4CB', borderRadius: '8px', padding: '24px' },
  cardLabel: { fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6B6560', marginBottom: '8px', fontWeight: '600', display: 'block' },
  
  // Grid
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  gridFull: { gridColumn: '1 / -1' },
  
  // Headers
  headerLabel: { fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B6560', marginBottom: '4px' },
  headerTitle: { fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '32px', lineHeight: '1.2', marginBottom: '8px', color: '#1A1A1A' },
  headerSub: { color: '#6B6560', fontSize: '14px', lineHeight: '1.7', maxWidth: '480px' },
  
  // Form Elements
  formGroup: { marginBottom: '16px' },
  label: { fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6B6560', marginBottom: '6px', display: 'block', fontWeight: '600' },
  input: { width: '100%', padding: '10px 14px', border: '1.5px solid #D9D4CB', borderRadius: '5px', background: '#F4F1EC', color: '#1A1A1A', fontFamily: '"Instrument Sans", Inter, sans-serif', fontSize: '14px', outline: 'none' },
  select: { width: '100%', padding: '10px 14px', border: '1.5px solid #D9D4CB', borderRadius: '5px', background: '#F4F1EC', color: '#1A1A1A', fontFamily: '"Instrument Sans", Inter, sans-serif', fontSize: '14px', outline: 'none' },
  
  // Buttons
  btnPrimary: { background: '#2D6A4F', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '600', fontFamily: '"Instrument Sans", Inter, sans-serif' },
  btnSecondary: { background: 'transparent', color: '#2D6A4F', padding: '10px 20px', borderRadius: '5px', border: '1.5px solid #2D6A4F', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '600', fontFamily: '"Instrument Sans", Inter, sans-serif' },
  
  // Feedback
  alertInfo: { padding: '14px 18px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', background: '#DBEAFE', border: '1px solid #BFDBFE', color: '#1E40AF', lineHeight: '1.5' },
  alertSuccess: { padding: '14px 18px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', background: '#D8F3DC', border: '1px solid #A7F3D0', color: '#2D6A4F', lineHeight: '1.5' },
  pillGreen: { display: 'inline-block', fontSize: '10px', padding: '3px 8px', borderRadius: '10px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', background: '#D8F3DC', color: '#065F46' },
  pillAmber: { display: 'inline-block', fontSize: '10px', padding: '3px 8px', borderRadius: '10px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', background: '#FEF3C7', color: '#D97706' },
}

const CHECKLIST = [
  { id: 1, label: 'Pre-Auth Form (MediAssist Form / TPA specific form)', mandatory: true, checked: true },
  { id: 2, label: 'Government ID Proof (Aadhar / PAN / Passport)', mandatory: true, checked: true },
  { id: 3, label: 'Insurance Policy Card / E-Card', mandatory: true, checked: true },
  { id: 4, label: 'Diagnostic Reports (Blood reports, X-Ray, MRI, USG etc.)', mandatory: false, checked: false },
]

export default function PreAuth() {
  const { data, loading, moveStage, getTatStatus } = useOutletContext()
  const [selectedCaseId, setSelectedCaseId] = useState(null)
  const [items, setItems] = useState(CHECKLIST)
  const [recommendations, setRecommendations] = useState([]);

  const stageCases = data?.filter(c => c.stage === 1) || []
  const activeCase = selectedCaseId ? stageCases.find(c => c.id === selectedCaseId) : (stageCases.length > 0 ? stageCases[0] : null)

  const generateRecommendations = (data) => {
    if (!data) {
      setRecommendations([]);
      return;
    }
    
    let recs = [];
    // PRE-AUTH LOGIC
    if (data.estimatedCost > 150000) {
      recs.push("⚠ High claim amount – consider requesting additional justification");
    }
    const isEmergency = data.patient === "Rajesh Kumar" // Mocking for now based on data
    if (isEmergency) {
      recs.push("⚡ Emergency case – ensure submission within 24 hrs");
    }
    if (data.tpa === "MediAssist") {
      recs.push("🏥 MediAssist usually responds within 1 hour for planned cases");
    }

    setTimeout(() => setRecommendations(recs), 400);
  };

  React.useEffect(() => {
    generateRecommendations(activeCase);
  }, [activeCase]);

  const toggle = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item))
  }

  if (stageCases.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#FAFAF7', border: '1px solid #D9D4CB', borderRadius: '8px' }}>
        <div style={S.headerTitle}>No Pending Pre-Auths</div>
        <p style={S.headerSub}>All initial requests have been submitted. Total cases: {data?.length || 0}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header Context Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={S.headerLabel}>Stage 01 · Initial Request</div>
          <h1 style={S.headerTitle}>Pre-Auth Request</h1>
          <p style={S.headerSub}>Initiate cashless claim by submitting clinical details and mandatory documents to the TPA.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {loading && <span style={{ ...S.pillAmber, alignSelf: 'center' }}>Processing...</span>}
          <button 
            style={{ ...S.btnPrimary, opacity: loading || !activeCase ? 0.6 : 1, cursor: loading || !activeCase ? 'not-allowed' : 'pointer' }}
            onClick={() => activeCase && moveStage(activeCase.id, 2)}
            disabled={loading || !activeCase}
          >
            {loading ? 'SUBMITTING...' : 'SUBMIT TO TPA'}
          </button>
        </div>
      </div>

      {stageCases.length > 1 && (
        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
          {stageCases.map(c => (
            <button 
              key={c.id} 
              style={activeCase?.id === c.id ? S.btnPrimary : S.btnSecondary}
              onClick={() => setSelectedCaseId(c.id)}
            >
              {c.patient}
            </button>
          ))}
        </div>
      )}

      <div style={S.alertInfo}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>ℹ️</span>
          <div>Pre-Auth must be submitted min 24hrs before planned admission. Emergency: within 24hrs of admission.</div>
        </div>
      </div>

      <div style={S.grid2}>
        <div style={S.card}>
          <span style={S.cardLabel}>Patient Information</span>
          <div style={S.formGroup}>
            <label style={S.label}>Patient Full Name</label>
            <input style={S.input} value={activeCase?.patient || ""} disabled />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Policy Number / ID</label>
            <input style={S.input} value={activeCase?.uhid || ""} disabled />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>TPA Name</label>
            <input style={S.input} value={activeCase?.tpa || ""} disabled />
          </div>
        </div>

        <div style={S.card}>
          <span style={S.cardLabel}>Clinical Details</span>
          <div style={S.formGroup}>
            <label style={S.label}>Diagnosis</label>
            <input style={S.input} value={activeCase?.diagnosis || ""} disabled />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Admission Type</label>
            <input style={S.input} value="Planned" disabled />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Estimated Cost ₹</label>
            <input style={S.input} value={activeCase?.estimatedCost?.toLocaleString() || "0"} disabled />
          </div>
        </div>

        <div style={{ ...S.card, ...S.gridFull }}>
          <span style={S.cardLabel}>Mandatory Documents Checklist</span>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {(items || []).map(item => (
              <li key={item?.id || Math.random()} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 0', borderBottom: '1px solid #D9D4CB'
              }}>
                <div 
                  onClick={() => toggle(item?.id)}
                  style={{
                    width: '20px', height: '20px', borderRadius: '4px',
                    border: '1.5px solid #D9D4CB', cursor: 'pointer',
                    background: item?.checked ? '#2D6A4F' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: '12px'
                  }}
                >
                  {item?.checked && '✓'}
                </div>
                <div style={{ fontSize: '13px', color: '#1A1A1A', flex: 1 }}>
                  {item?.label || 'Untitled Document'}
                  {item?.mandatory && <span style={{ color: '#C0392B', fontSize: '10px', fontWeight: '700', marginLeft: '8px' }}>MANDATORY</span>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <button style={S.btnSecondary} disabled={loading}>SAVE DRAFT</button>
        <button 
          style={{ ...S.btnPrimary, opacity: loading || !activeCase ? 0.6 : 1, cursor: loading || !activeCase ? 'not-allowed' : 'pointer' }}
          onClick={() => activeCase && moveStage(activeCase.id, 2)}
          disabled={loading || !activeCase}
        >
          {loading ? 'PROCESSING...' : 'SUBMIT PRE-AUTH → STAGE 02'}
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
  )
}
