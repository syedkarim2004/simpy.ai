import React, { useState } from 'react'

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
  const [submitted, setSubmitted] = useState(false)
  const [items, setItems] = useState(CHECKLIST)

  const toggle = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item))
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
        <button style={S.btnPrimary}>SUBMIT TO TPA</button>
      </div>

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
            <input style={S.input} defaultValue="Rajesh Kumar" />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Policy Number</label>
            <input style={S.input} defaultValue="HDFC-MED-2024-88721" />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>TPA Name</label>
            <select style={S.select} defaultValue="MediAssist">
              <option>MediAssist</option>
              <option>Vidal Health</option>
              <option>MD India</option>
            </select>
          </div>
        </div>

        <div style={S.card}>
          <span style={S.cardLabel}>Clinical Details</span>
          <div style={S.formGroup}>
            <label style={S.label}>Diagnosis + ICD-10 Code</label>
            <input style={S.input} defaultValue="Dengue Fever · A90" />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Admission Type</label>
            <select style={S.select} defaultValue="Emergency">
              <option>Emergency</option>
              <option>Planned</option>
              <option>Day Care</option>
            </select>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Estimated Cost ₹</label>
            <input style={S.input} defaultValue="85,000" />
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
        <button style={S.btnSecondary}>SAVE DRAFT</button>
        <button 
          style={S.btnPrimary}
          onClick={() => setSubmitted(true)}
        >
          SUBMIT PRE-AUTH → STAGE 02
        </button>
      </div>

      {submitted && (
        <div style={{ ...S.alertSuccess, marginTop: '24px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>✓</span>
            <div>Pre-Auth submitted to MediAssist. TAT: 1 hour.</div>
          </div>
        </div>
      )}
    </div>
  )
}
