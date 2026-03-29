import React from 'react'
import { useNavigate } from 'react-router-dom'
import StatsBar from '../../components/layout/StatsBar'

const PIPELINE_CARDS = [
  { num: '01', title: 'Pre-Auth Request', desc: 'Submit pre-auth form to MediAssist / Vidal / MD India with all mandatory documents.', path: '/tpa/pre-auth', tag: 'Entry Point' },
  { num: '02', title: 'Pre-Auth Approval', desc: '1-Hour TAT monitoring. Track approval status, respond to queries, escalate breached cases.', path: '/tpa/approval', tag: '⚡ 1Hr TAT' },
  { num: '03', title: 'Patient Admission', desc: 'Activate cashless on admission. Notify TPA within 24hrs. Assign ward and treating doctor.', path: '/tpa/admission', tag: '2 Today' },
  { num: '04', title: 'Enhancement Request', desc: 'Raise enhancement when bill exceeds initial auth. Mandatory: Provisional Bill + Lab + OT Notes.', path: '/tpa/enhancement', tag: '🚨 3 Urgent' },
  { num: '05', title: 'Enhancement Approval', desc: 'Track TPA response to enhancement. Record new enhanced authorized amount.', path: '/tpa/enhancement', tag: 'Pending' },
  { num: '06', title: 'Discharge Intimation', desc: 'Send discharge intimation with Summary, Final Bill, and ICPS. Starts 3-hour window.', path: '/tpa/discharge', tag: '⏱ 3Hr Window' },
  { num: '07', title: 'Discharge Approval', desc: 'Record TPA payable amount, non-payable deductions, copay. Generate final approval letter.', path: '/tpa/discharge', tag: '6 Today' },
  { num: '08', title: 'Final Settlement', desc: 'Record UTR, track payment, handle further deductions (non-payable items), close claim.', path: '/tpa/settlement', tag: '₹4.2L Awaited' },
]

export default function TPADashboard() {
  const navigate = useNavigate()

  return (
    <div>
      {/* Hero */}
      <div style={{ paddingBottom: '32px', marginBottom: '0', borderBottom: '1px solid #D9D4CB' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: '#D8F3DC', color: '#2D6A4F',
          fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
          padding: '5px 12px', borderRadius: '20px', marginBottom: '16px', fontWeight: '600',
        }}>
          <span style={{ width: '6px', height: '6px', background: '#2D6A4F', borderRadius: '50%', display: 'inline-block' }} />
          MediAssist · Vidal Health · MD India · Cashless Claims
        </div>
        <h1 style={{
          fontFamily: '"DM Serif Display", Georgia, serif',
          fontSize: '42px', lineHeight: '1.1', marginBottom: '12px',
        }}>
          TPA <em style={{ color: '#2D6A4F' }}>Administrator</em><br/>Control Panel
        </h1>
        <p style={{ color: '#6B6560', fontSize: '15px', maxWidth: '520px', lineHeight: '1.7' }}>
          End-to-end cashless claim pipeline across MediAssist, Vidal Health & MD India.
          Pre-Auth TAT: <strong style={{ color: '#2D6A4F' }}>~1 Hour</strong>. Non-payable deductions tracked automatically.
        </p>
      </div>

      <StatsBar />

      {/* Pipeline Cards Grid */}
      <div style={{ marginTop: '32px' }}>
        <div style={{
          fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase',
          color: '#6B6560', marginBottom: '20px', fontWeight: '600',
        }}>
          8-STAGE CLAIM PIPELINE
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px',
        }}>
          {(PIPELINE_CARDS || []).map((card, i) => (
            <div
              key={card?.num || i}
              onClick={() => card?.path && navigate(card.path)}
              style={{
                background: '#FAFAF7', border: '1px solid #D9D4CB',
                borderRadius: '8px', padding: '24px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#2D6A4F'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(45,106,79,0.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#D9D4CB'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '28px', color: '#2D6A4F', fontWeight: '500', lineHeight: '1',
                }}>{card?.num || '--'}</span>
                <span style={{
                  fontSize: '10px', padding: '3px 8px', borderRadius: '10px',
                  background: '#D8F3DC', color: '#2D6A4F',
                  fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>{card?.tag || 'Next'}</span>
              </div>
              <div style={{
                fontFamily: '"DM Serif Display", Georgia, serif',
                fontSize: '18px', marginBottom: '8px', color: '#1A1A1A',
              }}>{card?.title || 'Untitled Stage'}</div>
              <p style={{ fontSize: '13px', color: '#6B6560', lineHeight: '1.6' }}>{card?.desc || ''}</p>
              <div style={{
                marginTop: '20px', fontSize: '11px', color: '#2D6A4F',
                letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '600',
              }}>
                OPEN STAGE →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
