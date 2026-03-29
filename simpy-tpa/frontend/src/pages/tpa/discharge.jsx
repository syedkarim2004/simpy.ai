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
  pillGreen: { display: 'inline-block', fontSize: '10px', padding: '3px 8px', borderRadius: '10px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', background: '#D8F3DC', color: '#2D6A4F' },
}

const MOCK_DISCHARGE_QUEUE = [
  { id: 1, name: 'Kavita Rao', uhid: 'BH-2024-9910', ward: 'Gynae Ward — Bed 2', admitDate: '23 Mar 2026', totalAuthAmt: 105000, finalBill: 98400, tpa: 'MediAssist', intimationSentAt: new Date(Date.now() - 45 * 60000) },
  { id: 2, name: 'Deepak Singh', uhid: 'BH-2024-9908', ward: 'Ortho Ward — Bed 6B', admitDate: '19 Mar 2026', totalAuthAmt: 240000, finalBill: 228500, tpa: 'MD India', intimationSentAt: null },
]

export default function Discharge() {
  const [selectedCase, setSelectedCase] = useState(null)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  const getWindowProgress = (sentAt) => {
    if (!sentAt) return { text: 'Not Intimated', style: S.pillAmber }
    try {
      const elapsed = differenceInMinutes(now, new Date(sentAt))
      const remaining = 180 - elapsed
      if (remaining <= 0) return { text: 'Window Breached', style: S.pillAmber }
      const h = Math.floor(remaining / 60)
      const m = remaining % 60
      return { text: `⏱ ${h}h ${m}m left`, style: S.pillGreen }
    } catch (e) {
      return { text: 'Unknown', style: S.pillAmber }
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={S.headerLabel}>Stage 06–07 · Discharge</div>
          <h1 style={S.headerTitle}>Discharge & Approval</h1>
          <p style={S.headerSub}>Manage patient discharge intimations and calculate final TPA vs Patient liabilities.</p>
        </div>
        <span style={{ ...S.pillAmber, padding: '10px 16px', borderRadius: '6px' }}>⏱ 3 Hr Window</span>
      </div>

      <div style={{ ...S.card, padding: 0, overflow: 'hidden', marginBottom: '32px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={S.th}>Patient / UHID</th>
              <th style={S.th}>Ward</th>
              <th style={S.th}>Final Bill</th>
              <th style={S.th}>TPA</th>
              <th style={S.th}>Window Progress</th>
              <th style={S.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {(MOCK_DISCHARGE_QUEUE || []).map(p => {
              const win = getWindowProgress(p?.intimationSentAt)
              return (
                <tr key={p?.id || Math.random()}>
                  <td style={S.td}>
                    <div style={{ fontWeight: '600' }}>{p?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '11px', color: '#6B6560' }}>{p?.uhid || '-'}</div>
                  </td>
                  <td style={S.td}>{p?.ward || '-'}</td>
                  <td style={S.td}>₹{(p?.finalBill || 0).toLocaleString()}</td>
                  <td style={S.td}>{p?.tpa || '-'}</td>
                  <td style={S.td}><span style={win.style}>{win.text}</span></td>
                  <td style={S.td}>
                    <button style={S.btnSecondary} onClick={() => setSelectedCase(p)}>Calculate Liability</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {selectedCase && (
        <div style={S.grid2}>
          <div style={S.card}>
            <span style={S.cardLabel}>Financial Reconciliation</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span>Total Final Bill:</span>
                <span style={{ fontWeight: '600' }}>₹{(selectedCase?.finalBill || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#C0392B' }}>
                <span>Non-Payable Deductions:</span>
                <span>- ₹1,850</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#C0392B' }}>
                <span>Co-payment (10%):</span>
                <span>- ₹{Math.floor((selectedCase?.finalBill || 0) * 0.1).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', color: '#2D6A4F', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #D9D4CB' }}>
                <span>TPA Payable Amount:</span>
                <span>₹{Math.floor((selectedCase?.finalBill || 0) * 0.9 - 1850).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div style={S.card}>
            <span style={S.cardLabel}>Deduction Breakdown</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Food & Canteen</span>
                <span>₹1,200</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Toiletries / Hygiene Kit</span>
                <span>₹450</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Registration Fee</span>
                <span>₹200</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
        <button style={S.btnPrimary}>✓ RECORD DISCHARGE APPROVAL → STAGE 08</button>
      </div>
    </div>
  )
}
