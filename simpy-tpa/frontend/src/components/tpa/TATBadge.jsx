import React from 'react'
import { useTATTimer } from '../../hooks/useTATTimer'

export default function TATBadge({ submittedAt, tatMinutes = 60 }) {
  const { minutesElapsed, status, timeRemaining } = useTATTimer(submittedAt, tatMinutes)

  const styles = {
    ok:       { background: '#D8F3DC', color: '#065F46', text: `Within TAT ✓ (${timeRemaining})` },
    warning:  { background: '#FEF3C7', color: '#D97706', text: `⚠ Approaching TAT (${timeRemaining})` },
    breached: { background: '#FEE2E2', color: '#991B1B', text: '🚨 Escalate Now' },
  }

  const s = styles[status] || styles.ok

  return (
    <span style={{
      display: 'inline-block', fontSize: '10px', padding: '3px 9px',
      borderRadius: '10px', fontWeight: '600',
      letterSpacing: '0.06em', textTransform: 'uppercase',
      background: s.background, color: s.color,
    }}>
      {s.text}
    </span>
  )
}
