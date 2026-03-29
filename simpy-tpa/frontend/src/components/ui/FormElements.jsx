import React from 'react'

export function FormGroup({ children }) {
  return <div style={{ marginBottom: '16px' }}>{children}</div>
}

export function FormLabel({ children }) {
  return (
    <label style={{
      display: 'block', fontSize: '11px', letterSpacing: '0.08em',
      textTransform: 'uppercase', color: '#6B6560', marginBottom: '6px', fontWeight: '600',
    }}>
      {children}
    </label>
  )
}

export function Input({ ...props }) {
  return (
    <input {...props} style={{
      width: '100%', padding: '10px 14px',
      border: '1.5px solid #D9D4CB', borderRadius: '5px',
      background: '#F4F1EC', color: '#1A1A1A',
      fontFamily: '"Instrument Sans", Inter, sans-serif', fontSize: '14px',
      outline: 'none', transition: 'border-color 0.2s',
      ...props.style
    }}
    onFocus={e => e.target.style.borderColor = '#2D6A4F'}
    onBlur={e => e.target.style.borderColor = '#D9D4CB'}
    />
  )
}

export function Select({ children, ...props }) {
  return (
    <select {...props} style={{
      width: '100%', padding: '10px 14px',
      border: '1.5px solid #D9D4CB', borderRadius: '5px',
      background: '#F4F1EC', color: '#1A1A1A',
      fontFamily: '"Instrument Sans", Inter, sans-serif', fontSize: '14px',
      outline: 'none',
      ...props.style
    }}>
      {children}
    </select>
  )
}

export function Textarea({ ...props }) {
  return (
    <textarea {...props} style={{
      width: '100%', padding: '10px 14px',
      border: '1.5px solid #D9D4CB', borderRadius: '5px',
      background: '#F4F1EC', color: '#1A1A1A',
      fontFamily: '"Instrument Sans", Inter, sans-serif', fontSize: '14px',
      outline: 'none', resize: 'vertical', minHeight: '80px',
      ...props.style
    }} />
  )
}

export function Button({ children, variant = 'primary', onClick, style = {} }) {
  const base = {
    padding: '10px 20px', borderRadius: '5px', border: 'none',
    cursor: 'pointer', fontSize: '12px', letterSpacing: '0.08em',
    textTransform: 'uppercase', fontWeight: '600',
    fontFamily: '"Instrument Sans", Inter, sans-serif',
    transition: 'all 0.2s', ...style
  }
  const variants = {
    primary: { background: '#2D6A4F', color: 'white' },
    secondary: { background: 'transparent', color: '#2D6A4F', border: '1.5px solid #2D6A4F' },
    danger: { background: '#C0392B', color: 'white' },
  }
  return (
    <button style={{ ...base, ...variants[variant] }} onClick={onClick}>
      {children}
    </button>
  )
}
