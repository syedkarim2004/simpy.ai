import React, { useEffect, useState } from 'react'
import axios from 'axios'

const DEFAULT_STATS = {
  activeCases: 24,
  pendingAuthAmount: '₹12.4L',
  dischargeToday: 6,
  enhancementUrgent: 3,
  utrAwaited: '₹4.2L',
}

export default function StatsBar() {
  const [stats, setStats] = useState(DEFAULT_STATS)

  useEffect(() => {
    axios.get('/api/tpa/stats')
      .then(r => setStats(r.data))
      .catch(() => {}) // keep defaults on error
  }, [])

  const items = [
    { label: 'Active Cases', value: stats.activeCases },
    { label: 'Pending Authorization', value: stats.pendingAuthAmount },
    { label: 'Discharge Today', value: stats.dischargeToday },
    { label: 'Enhancement Requests', value: stats.enhancementUrgent },
    { label: 'UTR Awaited', value: stats.utrAwaited },
  ]

  return (
    <div style={{
      display: 'flex',
      borderBottom: '1px solid #D9D4CB',
      borderTop: '1px solid #D9D4CB',
      background: '#FAFAF7',
    }}>
      {(items || []).map((item, i) => (
        <div key={i} style={{
          flex: 1, padding: '20px 36px',
          borderRight: i < items.length - 1 ? '1px solid #D9D4CB' : 'none',
        }}>
          <div style={{
            fontFamily: '"DM Serif Display", Georgia, serif',
            fontSize: '28px', color: '#2D6A4F',
          }}>
            {item?.value || '-'}
          </div>
          <div style={{
            fontSize: '11px', color: '#6B6560',
            letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px',
          }}>
            {item?.label || 'Stat'}
          </div>
        </div>
      ))}
    </div>
  )
}
