import React from 'react'

export default function Card({ children, style = {}, className = '' }) {
  return (
    <div style={{
      background: '#FAFAF7', border: '1px solid #D9D4CB',
      borderRadius: '8px', padding: '24px', ...style
    }}>
      {children}
    </div>
  )
}
