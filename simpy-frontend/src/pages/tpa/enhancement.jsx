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
  const { data, loading, moveStage, getExtraInfo } = useOutletContext()
  const [selectedCaseId, setSelectedCaseId] = useState(null)
  const [recommendations, setRecommendations] = useState([]);
  const [reason, setReason] = useState("Prolonged hospital stay");

  const requestCases = data?.filter(c => c.stage === 4) || []
  const approvalCases = data?.filter(c => c.stage === 5) || []
  
  const activeCase = selectedCaseId ? [...requestCases, ...approvalCases].find(c => c.id === selectedCaseId) : null

  const generateRecommendations = (data, currentReason) => {
    if (!data) {
      setRecommendations([]);
      return;
    }
    
    let recs = [];
    
    // ENHANCEMENT LOGIC
    if (data.amount > 150000) {
      recs.push("⚠ High enhancement request – ensure detailed clinical justification is provided");
    }

    if (currentReason === "Prolonged hospital stay") {
      recs.push("📝 Attach daily progress notes to support extended stay");
    }

    if (data.tpa === "Vidal Health") {
      recs.push("🏥 Vidal Health cases typically require investigation if stay > 7 days");
    }

    setTimeout(() => setRecommendations(recs), 400);
  };

  React.useEffect(() => {
    generateRecommendations(activeCase, reason);
  }, [activeCase, reason]);

  if (requestCases.length === 0 && approvalCases.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#FAFAF7', border: '1px solid #D9D4CB', borderRadius: '8px' }}>
        <div style={S.headerTitle}>No Pending Enhancements</div>
        <p style={S.headerSub}>All enhancement requests have been processed. Total cases: {data?.length || 0}</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <div style={S.headerLabel}>Stage 04 · Critical Step</div>
          <h1 style={S.headerTitle}>Enhancement Management</h1>
          <p style={S.headerSub}>Request additional authorization and track TPA responses for mid-treatment limit increases.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {loading && <span style={{ ...S.pillAmber, alignSelf: 'center' }}>Processing...</span>}
          <div style={{ ...S.pillRed, padding: '10px 16px', borderRadius: '6px' }}>{requestCases.length + approvalCases.length} PENDING</div>
        </div>
      </div>

      <div style={{ ...S.card, padding: 0, overflow: 'hidden', marginBottom: '32px' }}>
        <span style={{ ...S.cardLabel, padding: '16px 16px 0' }}>Pending Enhancement Requests (Stage 04)</span>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={S.th}>Patient</th>
              <th style={S.th}>TPA</th>
              <th style={S.th}>Current Limit</th>
              <th style={S.th}>Provisional Bill</th>
              <th style={S.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {requestCases.map(p => (
              <tr key={p.id}>
                <td style={S.td}>
                  <div style={{ fontWeight: '600' }}>{p.patient}</div>
                  <div style={{ fontSize: '11px', color: '#6B6560' }}>{p.uhid}</div>
                </td>
                <td style={S.td}>{p.tpa}</td>
                <td style={S.td}>₹{(p.estimatedCost || 0).toLocaleString()}</td>
                <td style={S.td}>₹{(p.estimatedCost * 1.2).toLocaleString()}</td>
                <td style={S.td}>
                  <button 
                    style={selectedCaseId === p.id ? S.btnPrimary : S.btnSecondary} 
                    onClick={() => setSelectedCaseId(p.id)}
                  >
                    SELECT
                  </button>
                </td>
              </tr>
            ))}
            {requestCases.length === 0 && (
              <tr><td colSpan="5" style={{ ...S.td, textAlign: 'center', color: '#6B6560' }}>No pending requests</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ ...S.card, padding: 0, overflow: 'hidden', marginBottom: '32px' }}>
        <span style={{ ...S.cardLabel, padding: '16px 16px 0' }}>Awaiting TPA Response (Stage 05)</span>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={S.th}>Patient</th>
              <th style={S.th}>TPA</th>
              <th style={S.th}>Limit</th>
              <th style={S.th}>Status</th>
              <th style={S.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {approvalCases.map(p => (
              <tr key={p.id}>
                <td style={S.td}>
                  <div style={{ fontWeight: '600' }}>{p.patient}</div>
                  <div style={{ fontSize: '11px', color: '#6B6560' }}>{p.uhid}</div>
                </td>
                <td style={S.td}>{p.tpa}</td>
                <td style={S.td}>₹{(p.estimatedCost || 0).toLocaleString()}</td>
                <td style={S.td}><span style={S.pillAmber}>Under Review</span></td>
                <td style={S.td}>
                  <button 
                    style={{ ...S.btnPrimary, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }} 
                    onClick={() => moveStage(p.id, 6)}
                    disabled={loading}
                  >
                    {loading ? '...' : 'APPROVE'}
                  </button>
                </td>
              </tr>
            ))}
            {approvalCases.length === 0 && (
              <tr><td colSpan="5" style={{ ...S.td, textAlign: 'center', color: '#6B6560' }}>No cases awaiting response</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={S.grid2}>
        <div style={S.card}>
          <span style={S.cardLabel}>Enhancement Request Details</span>
          <div style={S.formGroup}>
            <label style={S.label}>Selected Patient</label>
            <input 
              style={S.input} 
              value={activeCase ? `${activeCase.patient} (${activeCase.uhid})` : "Please select a Stage 04 patient from the table above"} 
              disabled 
            />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Enhancement Amount Requested ₹</label>
            <input style={S.input} placeholder="e.g. 25,000" />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Reason for Enhancement</label>
            <select 
              style={S.select} 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
            >
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
            <input style={S.input} value={activeCase ? getExtraInfo(activeCase.id).doctor : "Dr. Vikram Mehta"} disabled />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Medical Justification</label>
            <textarea style={S.textarea} placeholder="Enter clinical reason for extension of stay or additional procedure..." />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
        <button 
          style={{ ...S.btnPrimary, opacity: loading || !activeCase ? 0.6 : 1, cursor: loading || !activeCase ? 'not-allowed' : 'pointer' }}
          onClick={() => activeCase && moveStage(activeCase.id, 5)}
          disabled={loading || !activeCase}
        >
          {loading ? 'SUBMITTING...' : 'SUBMIT ENHANCEMENT → STAGE 05'}
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
