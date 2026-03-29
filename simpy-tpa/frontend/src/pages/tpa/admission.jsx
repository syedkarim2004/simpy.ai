import React, { useState } from 'react'

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
  
  // Buttons
  btnPrimary: { background: '#2D6A4F', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '600', fontFamily: '"Instrument Sans", Inter, sans-serif' },
  btnSecondary: { background: 'transparent', color: '#2D6A4F', padding: '10px 20px', borderRadius: '5px', border: '1.5px solid #2D6A4F', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '600', fontFamily: '"Instrument Sans", Inter, sans-serif' },

  // Grid
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  gridFull: { gridColumn: '1 / -1' },

  // Feedback
  pillGreen: { display: 'inline-block', fontSize: '10px', padding: '3px 8px', borderRadius: '10px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', background: '#D8F3DC', color: '#2D6A4F' },
  alertWarn: { padding: '14px 18px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px', background: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E', lineHeight: '1.5' },
}

const CHECKLIST = [
  { id: 1, label: 'Cashless card / E-card verified at counter', checked: false },
  { id: 2, label: 'Patient signed cashless undertaking form', checked: false },
  { id: 3, label: 'Admission intimation sent to TPA (email/portal)', checked: false },
]

export default function Admission() {
  const [items, setItems] = useState(CHECKLIST)

  const toggle = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, checked: !item.checked } : item))
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={S.headerLabel}>Stage 03 · Hospital Admission</div>
          <h1 style={S.headerTitle}>Patient Admission</h1>
          <p style={S.headerSub}>Formally activate cashless at hospital admission and notify TPA within regulatory timelines.</p>
        </div>
        <button style={S.btnPrimary}>NOTIFY TPA ↗</button>
      </div>

      <div style={S.alertWarn}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>⚠</span>
          <div>Admission intimation must be sent to TPA within 24 hrs of admission. Failure to notify may result in cashless cancellation.</div>
        </div>
      </div>

      <div style={S.grid2}>
        <div style={S.card}>
          <span style={S.cardLabel}>Admission Details</span>
          <div style={S.formGroup}>
            <label style={S.label}>Patient Selector</label>
            <select style={S.select}>
              <option>Select from pending list...</option>
              <option>Rajesh Kumar (BH-2024-9921)</option>
              <option>Priya Sharma (BH-2024-9925)</option>
            </select>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Ward / Room No.</label>
            <input style={S.input} placeholder="e.g. General Ward - 11B" />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Admission Date & Time</label>
            <input type="datetime-local" style={S.input} defaultValue={new Date().toISOString().slice(0, 16)} />
          </div>
        </div>

        <div style={S.card}>
          <span style={S.cardLabel}>Treating Doctor</span>
          <div style={S.formGroup}>
            <label style={S.label}>Doctor Name</label>
            <input style={S.input} defaultValue="Dr. Anil Sharma" />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Registration Number</label>
            <input style={S.input} defaultValue="MCI-2015-8821" />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Department</label>
            <select style={S.select} defaultValue="General Medicine">
              <option>General Medicine</option>
              <option>Surgery</option>
              <option>Gynecology</option>
            </select>
          </div>
        </div>

        <div style={{ ...S.card, ...S.gridFull }}>
          <span style={S.cardLabel}>Cashless Activation Checklist</span>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {(items || []).map(item => (
              <li key={item?.id || Math.random()} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #D9D4CB' }}>
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
                <div style={{ fontSize: '13px', color: '#1A1A1A' }}>{item?.label || 'Untitled Task'}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
        <button style={S.btnPrimary}>ACTIVATE CASHLESS → STAGE 04</button>
      </div>
    </div>
  )
}
