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
  const { data, loading, moveStage, getTatStatus, getExtraInfo } = useOutletContext()
  const [selectedCaseId, setSelectedCaseId] = useState(null)
  const [recommendations, setRecommendations] = useState([]);

  const dischargeCases = data?.filter(c => c.stage === 6) || []
  const settlementCases = data?.filter(c => c.stage === 7) || []
  const activeCase = selectedCaseId ? [...dischargeCases, ...settlementCases].find(c => c.id === selectedCaseId) : null

  const generateRecommendations = (data) => {
    if (!data) {
      setRecommendations([]);
      return;
    }
    
    let recs = [];
    const finalBill = (data.estimatedCost * 1.15 || 0);
    
    // DISCHARGE LOGIC
    if (finalBill > 200000) {
      recs.push("🔍 High final bill – verify all line items carefully before submission");
    }

    const documentsComplete = true; // Mocking for now
    if (!documentsComplete) {
      recs.push("❗ Missing documents – may lead to claim rejection or co-pay increase");
    }

    if (data.tpa === "MD India") {
      recs.push("🏥 MD India typically requires the 'Internal Case Paper Summary' (ICPS) for final approval");
    }

    setTimeout(() => setRecommendations(recs), 400);
  };

  React.useEffect(() => {
    generateRecommendations(activeCase);
  }, [activeCase]);

  if (dischargeCases.length === 0 && settlementCases.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#FAFAF7', border: '1px solid #D9D4CB', borderRadius: '8px' }}>
        <div style={S.headerTitle}>No Pending Discharges</div>
        <p style={S.headerSub}>All Stage 06/07 cases have been processed. Total cases: {data?.length || 0}</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={S.headerLabel}>Stage 06–07 · Discharge</div>
          <h1 style={S.headerTitle}>Discharge Management</h1>
          <p style={S.headerSub}>Manage patient discharge intimations and calculate final TPA vs Patient liabilities.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {loading && <span style={{ ...S.pillAmber, alignSelf: 'center' }}>Processing...</span>}
          <span style={{ ...S.pillAmber, padding: '10px 16px', borderRadius: '6px' }}>{dischargeCases.length + settlementCases.length} PENDING</span>
        </div>
      </div>

      <div style={{ ...S.card, padding: 0, overflow: 'hidden', marginBottom: '32px' }}>
        <span style={{ ...S.cardLabel, padding: '16px 16px 0' }}>Discharge & Settlement Pipeline</span>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={S.th}>Patient / UHID</th>
              <th style={S.th}>TPA</th>
              <th style={S.th}>Final Bill</th>
              <th style={S.th}>Stage</th>
              <th style={S.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {[...dischargeCases, ...settlementCases].map(p => {
              return (
                <tr key={p.id}>
                  <td style={S.td}>
                    <div style={{ fontWeight: '600' }}>{p.patient}</div>
                    <div style={{ fontSize: '11px', color: '#6B6560' }}>{p.uhid}</div>
                  </td>
                  <td style={S.td}>{p.tpa}</td>
                  <td style={S.td}>₹{(p.estimatedCost * 1.15 || 0).toLocaleString()}</td>
                  <td style={S.td}>
                    <span style={p.stage === 6 ? S.pillAmber : S.pillGreen}>
                      {p.stage === 6 ? 'Stage 06' : 'Stage 07'}
                    </span>
                  </td>
                  <td style={S.td}>
                    <button 
                      style={selectedCaseId === p.id ? S.btnPrimary : S.btnSecondary} 
                      onClick={() => setSelectedCaseId(p.id)}
                    >
                      {selectedCaseId === p.id ? 'SELECTED' : 'CALC LIABILTY'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {activeCase && (
        <div style={S.grid2}>
          <div style={S.card}>
            <span style={S.cardLabel}>Financial Reconciliation: {activeCase.patient}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span>Total Final Bill:</span>
                <span style={{ fontWeight: '600' }}>₹{(activeCase.estimatedCost * 1.15 || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#C0392B' }}>
                <span>Non-Payable Deductions:</span>
                <span>- ₹1,850</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#C0392B' }}>
                <span>Co-payment (10%):</span>
                <span>- ₹{Math.floor((activeCase.estimatedCost * 1.15 || 0) * 0.1).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', color: '#2D6A4F', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #D9D4CB' }}>
                <span>TPA Payable Amount:</span>
                <span>₹{Math.floor((activeCase.estimatedCost * 1.15 || 0) * 0.9 - 1850).toLocaleString()}</span>
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
        <button 
          style={{ ...S.btnPrimary, opacity: loading || !activeCase ? 0.6 : 1, cursor: loading || !activeCase ? 'not-allowed' : 'pointer' }}
          disabled={loading || !activeCase}
          onClick={() => activeCase && moveStage(activeCase.id, activeCase.stage + 1)}
        >
          {loading ? 'PROCESSING...' : `RECORD ${activeCase?.stage === 6 ? 'DISCHARGE' : 'SETTLEMENT'} → STAGE 0${activeCase ? activeCase.stage + 1 : 8}`}
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
