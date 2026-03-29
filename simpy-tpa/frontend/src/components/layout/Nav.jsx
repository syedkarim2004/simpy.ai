import React from 'react'
import { Link } from 'react-router-dom'

export default function Nav() {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 48px',
      background: '#FAFAF7',
      borderBottom: '1px solid #D9D4CB',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      fontFamily: '"Instrument Sans", Inter, sans-serif',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div style={{
          width: '34px', height: '34px',
          background: '#2D6A4F', borderRadius: '6px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
        </div>
        <span style={{ fontFamily: '"DM Serif Display", Georgia, serif', fontSize: '20px', color: '#1A1A1A' }}>
          Simpy.ai
        </span>
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: '32px' }}>
        {['HOW IT WORKS', 'LEDGER', 'AUDIT', 'COMPLIANCE'].map(link => (
          <a key={link} href="#" style={{
            fontSize: '11px', letterSpacing: '0.12em',
            color: '#6B6560', textDecoration: 'none', fontWeight: '500',
            textTransform: 'uppercase',
          }}>{link}</a>
        ))}
      </div>

      {/* Badge */}
      <div style={{
        background: '#2D6A4F', color: 'white',
        fontSize: '11px', padding: '7px 16px',
        borderRadius: '4px', letterSpacing: '0.08em',
        textTransform: 'uppercase', fontWeight: '600',
        cursor: 'pointer',
      }}>
        TPA ADMINISTRATOR ↗
      </div>
    </nav>
  )
}
