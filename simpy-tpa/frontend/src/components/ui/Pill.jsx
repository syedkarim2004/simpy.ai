import React from 'react'

const VARIANTS = {
  green:  { background: '#D8F3DC', color: '#065F46' },
  amber:  { background: '#FEF3C7', color: '#D97706' },
  red:    { background: '#FEE2E2', color: '#991B1B' },
  gray:   { background: '#F3F4F6', color: '#6B7280' },
}

export default function Pill({ label, variant = 'gray' }) {
  const s = VARIANTS[variant] || VARIANTS.gray
  return (
    <span style={{
      display: 'inline-block', fontSize: '10px', padding: '3px 8px',
      borderRadius: '10px', fontWeight: '600',
      letterSpacing: '0.06em', textTransform: 'uppercase',
      ...s
    }}>
      {label}
    </span>
  )
}
