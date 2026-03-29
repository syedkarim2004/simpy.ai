import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const STAGES = [
  { num: '01', name: 'Pre-Auth Request', sub: 'MediAssist Form + Docs', path: '/tpa/pre-auth', status: 'Active', statusColor: '#D1FAE5', statusText: '#065F46' },
  { num: '02', name: 'Pre-Auth Approval', sub: 'TAT: 1 Hour', path: '/tpa/approval', status: '3 Pending', statusColor: '#FEF3C7', statusText: '#D97706' },
  { num: '03', name: 'Patient Admission', sub: 'Ward + Cashless', path: '/tpa/admission', status: '2 Today', statusColor: '#D1FAE5', statusText: '#065F46' },
  { num: '04', name: 'Enhancement Request', sub: 'Provisional Bill + Notes', path: '/tpa/enhancement', status: '3 URGENT', statusColor: '#FEE2E2', statusText: '#991B1B' },
  { num: '05', name: 'Enhancement Approval', sub: 'Enhanced Auth Amount', path: '/tpa/enhancement', status: 'Pending', statusColor: '#FEF3C7', statusText: '#D97706' },
  { num: '06', name: 'Discharge Intimation', sub: 'Summary + Bill + ICPS', path: '/tpa/discharge', status: '6 Today', statusColor: '#D1FAE5', statusText: '#065F46' },
  { num: '07', name: 'Discharge Approval', sub: '3 Hr Window · Deductions', path: '/tpa/discharge', status: '2 Pending', statusColor: '#FEF3C7', statusText: '#D97706' },
  { num: '08', name: 'Final Settlement', sub: 'UTR + Settlement Letter', path: '/tpa/settlement', status: 'UTR Track', statusColor: '#E5E7EB', statusText: '#6B7280' },
]

export default function TPASidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <aside style={{
      width: '300px',
      background: '#FAFAF7',
      borderRight: '1px solid #D9D4CB',
      padding: '28px 0',
      position: 'sticky',
      top: '61px',
      height: 'calc(100vh - 61px)',
      overflowY: 'auto',
      flexShrink: 0,
    }}>
      <div style={{
        fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase',
        color: '#6B6560', padding: '0 24px 16px', fontWeight: '600',
      }}>
        TPA Pipeline Stages
      </div>

      {STAGES.map((stage, i) => {
        const isActive = location.pathname === stage.path
        return (
          <React.Fragment key={i}>
            <div
              onClick={() => navigate(stage.path)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px',
                padding: '14px 24px', cursor: 'pointer',
                borderLeft: isActive ? '3px solid #2D6A4F' : '3px solid transparent',
                background: isActive ? '#EBF5EE' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: '26px', height: '26px', borderRadius: '50%',
                background: isActive ? '#2D6A4F' : '#F4F1EC',
                border: isActive ? '1.5px solid #2D6A4F' : '1.5px solid #D9D4CB',
                fontSize: '11px', fontWeight: '600',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                color: isActive ? 'white' : '#6B6560',
                fontFamily: '"DM Mono", monospace',
              }}>
                {stage.num}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#1A1A1A', lineHeight: '1.2' }}>
                  {stage.name}
                </div>
                <div style={{ fontSize: '11px', color: '#6B6560', marginTop: '2px' }}>
                  {stage.sub}
                </div>
                <span style={{
                  display: 'inline-block', marginTop: '5px',
                  fontSize: '10px', padding: '2px 7px', borderRadius: '10px',
                  fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase',
                  background: stage.statusColor, color: stage.statusText,
                }}>
                  {stage.status}
                </span>
              </div>
            </div>
            {i < STAGES.length - 1 && (
              <div style={{ width: '1px', height: '14px', background: '#D9D4CB', marginLeft: '36px' }} />
            )}
          </React.Fragment>
        )
      })}

      {/* Priority box */}
      <div style={{ padding: '16px' }}>
        <div style={{
          background: '#D8F3DC', borderRadius: '6px',
          padding: '12px', fontSize: '12px', color: '#2D6A4F', lineHeight: '1.5',
        }}>
          <strong>Today's Priority</strong><br/>
          6 discharges pending · 3 enhancement requests urgent
        </div>
      </div>
    </aside>
  )
}
