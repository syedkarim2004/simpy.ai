import React, { useState, useEffect } from 'react'
import { differenceInMinutes } from 'date-fns'

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
  const [activeTab, setActiveTab] = useState('PENDING')
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  const getTATStatus = (submittedAt) => {
    if (!submittedAt) return { style: S.pillAmber, text: 'Pending' }
    try {
      const elapsed = differenceInMinutes(now, new Date(submittedAt))
      if (elapsed < 45) return { style: S.pillGreen, text: `Within TAT · ${45 - elapsed}m left` }
      if (elapsed < 60) return { style: S.pillAmber, text: `Approaching · ${60 - elapsed}m left` }
    } catch (e) {
      return { style: S.pillAmber, text: 'Unknown' }
    }
    return { style: S.pillRed, text: 'Breached' }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={S.headerLabel}>Stage 02 · TPA Response</div>
          <h1 style={S.headerTitle}>Pre-Auth Approval</h1>
          <p style={S.headerSub}>Track TPA real-time responses, respond to queries, and record authorized amounts.</p>
        </div>
        <button style={S.btnSecondary} onClick={() => setNow(new Date())}>REFRESH STATUS ↻</button>
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
              {(MOCK_PATIENTS || []).map(p => {
                const tat = getTATStatus(p?.submittedAt)
                return (
                  <tr key={p?.id || Math.random()}>
                    <td style={S.td}>
                      <div style={{ fontWeight: '600' }}>{p?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '11px', color: '#6B6560' }}>{p?.uhid || '-'}</div>
                    </td>
                    <td style={S.td}>{p?.tpa || '-'}</td>
                    <td style={S.td}>{p?.diagnosis || '-'}</td>
                    <td style={S.td}><span style={tat.style}>{tat.text}</span></td>
                    <td style={S.td}>
                      <button style={S.btnSecondary}>VIEW →</button>
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
            <label style={S.label}>Patient Selector</label>
            <select style={S.select}>
              <option>Select from pending list...</option>
              {(MOCK_PATIENTS || []).map(p => <option key={p?.id || Math.random()}>{p?.name} ({p?.uhid})</option>)}
            </select>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Authorized Amount ₹</label>
            <input style={S.input} placeholder="Enter TPA approved amount" />
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
          <button style={S.btnPrimary}>RECORD APPROVAL → PROCEED TO ADMISSION</button>
        </div>
      </div>
    </div>
  )
}
