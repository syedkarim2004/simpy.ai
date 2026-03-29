import React, { useState } from 'react'

export default function DocumentChecklist({ items, onChange }) {
  const [checked, setChecked] = useState(
    items.reduce((acc, item) => ({ ...acc, [item.id]: item.defaultChecked || false }), {})
  )

  const toggle = (id) => {
    const updated = { ...checked, [id]: !checked[id] }
    setChecked(updated)
    if (onChange) onChange(updated)
  }

  return (
    <ul style={{ listStyle: 'none' }}>
      {items.map(item => (
        <li key={item.id} style={{
          display: 'flex', alignItems: 'flex-start', gap: '10px',
          padding: '10px 0', borderBottom: '1px solid #D9D4CB', fontSize: '13px',
        }}>
          <div
            onClick={() => toggle(item.id)}
            style={{
              width: '20px', height: '20px', borderRadius: '4px', flexShrink: 0,
              border: checked[item.id] ? 'none' : '1.5px solid #D9D4CB',
              background: checked[item.id] ? '#2D6A4F' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {checked[item.id] && <span style={{ color: 'white', fontSize: '12px', fontWeight: '700' }}>✓</span>}
          </div>
          <div>
            <span style={{ fontWeight: item.mandatory ? '600' : '400' }}>
              {item.mandatory && <span style={{ color: '#2D6A4F', marginRight: '4px' }}>⭐</span>}
              {item.label}
              {item.mandatory && <span style={{ fontSize: '10px', color: '#C0392B', marginLeft: '6px', fontWeight: '600' }}>MANDATORY</span>}
            </span>
            {item.desc && <div style={{ fontSize: '11px', color: '#6B6560', marginTop: '2px' }}>{item.desc}</div>}
          </div>
        </li>
      ))}
    </ul>
  )
}
