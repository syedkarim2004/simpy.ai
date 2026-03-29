import React from 'react'
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
  pillGreen: { display: 'inline-block', fontSize: '10px', padding: '3px 8px', borderRadius: '10px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', background: '#D8F3DC', color: '#2D6A4F' },
  pillAmber: { display: 'inline-block', fontSize: '10px', padding: '3px 8px', borderRadius: '10px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', background: '#FEF3C7', color: '#D97706' },
}

const MOCK_UTR_RECEIVED = [
  { id: 1, name: 'Mohammed Irfan', uhid: 'BH-2024-9935', utr: 'SBIN0000234789012', amount: 368000, tpa: 'Vidal Health' },
  { id: 2, name: 'Ananya Gupta', uhid: 'BH-2024-9901', utr: 'HDFC0000198234771', amount: 91400, tpa: 'Vidal Health' },
]

export default function Settlement() {
  const { data, loading, moveStage, getExtraInfo } = useOutletContext()
  const settledCases = data?.filter(c => c.stage === 8) || []
  const totalAmount = settledCases.reduce((sum, c) => sum + (c.estimatedCost || 0), 0)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={S.headerLabel}>Stage 08 · Post Discharge</div>
          <h1 style={S.headerTitle}>Final Settlement & UTR</h1>
          <p style={S.headerSub}>Track payments from TPA, reconcile Bank UTRs, and file completed cases.</p>
        </div>
        <span style={{ ...S.pillAmber, padding: '10px 16px', borderRadius: '6px' }}>₹{(settledCases.length > 0 ? (totalAmount * 0.9 / 100000).toFixed(2) : "0.00")}L Credited</span>
      </div>

      <div style={S.grid2}>
        <div style={{ ...S.card, background: '#2D6A4F', color: 'white', border: 'none' }}>
           <span style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', display: 'block' }}>LATEST UTR RECEIVED</span>
           <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '24px', margin: '12px 0', fontWeight: '700' }}>SBIN00234789012</div>
           <div style={{ fontSize: '14px', opacity: 0.9 }}>Mohammed Irfan · ₹3,68,000 · Vidal Health</div>
        </div>

        <div style={S.card}>
          <span style={S.cardLabel}>Payment Tracking</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Claims Settled:</span>
              <span style={{ fontWeight: '600' }}>{settledCases.length} Cases</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Amount Credited:</span>
              <span style={{ fontWeight: '600', color: '#2D6A4F' }}>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ ...S.card, padding: 0, overflow: 'hidden', marginBottom: '32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={S.th}>Patient / UHID</th>
              <th style={S.th}>UTR Number</th>
              <th style={S.th}>Amount Received</th>
              <th style={S.th}>TPA</th>
              <th style={S.th}>Status</th>
              <th style={S.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {settledCases.map(u => (
              <tr key={u.id}>
                <td style={S.td}>
                  <div style={{ fontWeight: '600' }}>{u.patient}</div>
                  <div style={{ fontSize: '11px', color: '#6B6560' }}>{u.uhid}</div>
                </td>
                <td style={{ ...S.td, fontFamily: '"DM Mono", monospace' }}>UTR-{u.id}XX{u.uhid.split('-').pop()}</td>
                <td style={S.td}>₹{(u.estimatedCost || 0).toLocaleString()}</td>
                <td style={S.td}>{u.tpa}</td>
                <td style={S.td}><span style={S.pillGreen}>CREDITED</span></td>
                <td style={S.td}>
                  <button style={S.btnSecondary}>Report</button>
                </td>
              </tr>
            ))}
            {settledCases.length === 0 && (
              <tr><td colSpan="6" style={{ ...S.td, textAlign: 'center', color: '#6B6560', padding: '40px' }}>No cases have reached final settlement yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={S.card}>
        <span style={S.cardLabel}>Record UTR & Close Claim</span>
        <div style={S.grid2}>
          <div style={S.formGroup}>
            <label style={S.label}>Patient Selector</label>
            <select style={S.select}><option>Select a pending case...</option></select>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Bank UTR Reference</label>
            <input style={S.input} placeholder="e.g. SBIN88321..." />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Amount Credited ₹</label>
            <input style={S.input} placeholder="Calculate from Bank Statement" />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Date of Credit</label>
            <input type="date" style={S.input} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button style={S.btnSecondary} disabled={loading}>Download Reconciliation Report</button>
          <button 
            style={{ ...S.btnPrimary, opacity: loading || settledCases.length === 0 ? 0.6 : 1 }}
            onClick={() => settledCases.length > 0 && moveStage(settledCases[0].id, 9)}
            disabled={loading || settledCases.length === 0}
          >
            {loading ? 'CLOSING...' : '✓ RECORD UTR & CLOSE CLAIM'}
          </button>
        </div>
      </div>
    </div>
  )
}
