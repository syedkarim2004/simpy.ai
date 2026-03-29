import React from 'react'

const VARIANTS = {
  warn:    { background: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E' },
  info:    { background: '#DBEAFE', border: '1px solid #BFDBFE', color: '#1E40AF' },
  success: { background: '#D8F3DC', border: '1px solid #A7F3D0', color: '#2D6A4F' },
  error:   { background: '#FEE2E2', border: '1px solid #FECACA', color: '#991B1B' },
}

export default function Alert({ type = 'info', icon, children }) {
  const s = VARIANTS[type] || VARIANTS.info
  return (
    <div style={{
      padding: '14px 18px', borderRadius: '6px',
      fontSize: '13px', marginBottom: '16px',
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      lineHeight: '1.5', ...s
    }}>
      {icon && <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>}
      <div>{children}</div>
    </div>
  )
}
