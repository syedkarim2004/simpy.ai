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
  textarea: { width: '100%', padding: '10px 14px', border: '1.5px solid #D9D4CB', borderRadius: '5px', background: '#F4F1EC', color: '#1A1A1A', fontFamily: '"Instrument Sans", Inter, sans-serif', fontSize: '14px', outline: 'none', resize: 'vertical', minHeight: '80px' },
  
  // Buttons
  btnPrimary: { background: '#2D6A4F', color: 'white', padding: '10px 20px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '600', fontFamily: '"Instrument Sans", Inter, sans-serif' },
  btnSecondary: { background: 'transparent', color: '#2D6A4F', padding: '10px 20px', borderRadius: '5px', border: '1.5px solid #2D6A4F', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '600', fontFamily: '"Instrument Sans", Inter, sans-serif' },

  // Grid
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
  gridFull: { gridColumn: '1 / -1' },

  // Table
  th: { textAlign: 'left', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#6B6560', padding: '8px 12px', borderBottom: '1.5px solid #D9D4CB', fontWeight: '600' },
  td: { padding: '12px', borderBottom: '1px solid #D9D4CB', fontSize: '13px', color: '#1A1A1A' },

  // Feedback
  pillAmber: { display: 'inline-block', fontSize: '10px', padding: '3px 8px', borderRadius: '10px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', background: '#FEF3C7', color: '#D97706' },
  pillRed: { display: 'inline-block', fontSize: '10px', padding: '3px 8px', borderRadius: '10px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', background: '#FEE2E2', color: '#991B1B' },
}

const MOCK_ENHANCEMENT_CASES = [
  { id: 1, name: 'Deepak Singh', uhid: 'BH-2024-9908', tpa: 'MD India', originalAuth: 180000, provisionalBill: 203000, gap: 23000 },
  { id: 2, name: 'Suresh Babu', uhid: 'BH-2024-9896', tpa: 'MediAssist', originalAuth: 320000, provisionalBill: 389000, gap: 69000 },
]

export default function Enhancement() {
  const [selectedCase, setSelectedCase] = useState(null)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={S.headerLabel}>Stage 04 · Critical Step</div>
          <h1 style={S.headerTitle}>Enhancement Request</h1>
          <p style={S.headerSub}>Request additional authorization when provisional bills exceed initial limits.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <span style={{ ...S.pillRed, padding: '10px 16px', borderRadius: '6px' }}>3 URGENT</span>
          <button style={S.btnPrimary}>RAISE ENHANCEMENT ↗</button>
        </div>
      </div>

      <div style={{ ...S.card, padding: 0, overflow: 'hidden', marginBottom: '32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={S.th}>Patient</th>
              <th style={S.th}>TPA</th>
              <th style={S.th}>Original Auth</th>
              <th style={S.th}>Current Bill</th>
              <th style={S.th}>Gap</th>
              <th style={S.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {(MOCK_ENHANCEMENT_CASES || []).map(p => (
              <tr key={p?.id || Math.random()}>
                <td style={S.td}>
                  <div style={{ fontWeight: '600' }}>{p?.name || 'Unknown'}</div>
                  <div style={{ fontSize: '11px', color: '#6B6560' }}>{p?.uhid || '-'}</div>
                </td>
                <td style={S.td}>{p?.tpa || '-'}</td>
                <td style={S.td}>₹{(p?.originalAuth || 0).toLocaleString()}</td>
                <td style={S.td}>₹{(p?.provisionalBill || 0).toLocaleString()}</td>
                <td style={S.td}><span style={{ color: '#C0392B', fontWeight: '600' }}>₹{(p?.gap || 0).toLocaleString()}</span></td>
                <td style={S.td}>
                  <button style={S.btnSecondary} onClick={() => setSelectedCase(p)}>Raise</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={S.grid2}>
        <div style={S.card}>
          <span style={S.cardLabel}>Enhancement Request Details</span>
          <div style={S.formGroup}>
            <label style={S.label}>Patient / UHID Selector</label>
            <select style={S.select} value={selectedCase?.name || ''} onChange={(e) => setSelectedCase((MOCK_ENHANCEMENT_CASES || []).find(c => c.name === e.target.value))}>
              <option value="">Select a case...</option>
              {(MOCK_ENHANCEMENT_CASES || []).map(c => <option key={c?.id || Math.random()} value={c?.name}>{c?.name}</option>)}
            </select>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Enhancement Amount Requested ₹</label>
            <input style={S.input} placeholder="e.g. 25,000" />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Reason for Enhancement</label>
            <select style={S.select}>
              <option>Prolonged hospital stay</option>
              <option>Complications / additional surgery</option>
              <option>ICU requirement (unplanned)</option>
            </select>
          </div>
        </div>

        <div style={S.card}>
          <span style={S.cardLabel}>Clinical Justification</span>
          <div style={S.formGroup}>
            <label style={S.label}>Doctor Name</label>
            <input style={S.input} defaultValue="Dr. Vikram Mehta" />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Medical Justification</label>
            <textarea style={S.textarea} placeholder="Enter clinical reason for extension of stay or additional procedure..." />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
        <button style={S.btnPrimary}>SUBMIT ENHANCEMENT → STAGE 05</button>
      </div>
    </div>
  )
}
