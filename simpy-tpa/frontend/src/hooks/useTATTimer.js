import { useState, useEffect } from 'react'
import { differenceInMinutes } from 'date-fns'

export function useTATTimer(submittedAt, tatMinutes = 60) {
  const [minutesElapsed, setMinutesElapsed] = useState(0)

  useEffect(() => {
    if (!submittedAt) return
    const update = () => {
      const elapsed = differenceInMinutes(new Date(), new Date(submittedAt))
      setMinutesElapsed(elapsed)
    }
    update()
    const interval = setInterval(update, 30000) // update every 30s
    return () => clearInterval(interval)
  }, [submittedAt])

  const remaining = tatMinutes - minutesElapsed
  const mm = Math.max(0, Math.floor(remaining))
  const timeRemaining = remaining > 0 ? `${mm}m left` : 'Breached'

  const status = minutesElapsed < 45 ? 'ok'
    : minutesElapsed < tatMinutes ? 'warning'
    : 'breached'

  return { minutesElapsed, status, timeRemaining }
}
