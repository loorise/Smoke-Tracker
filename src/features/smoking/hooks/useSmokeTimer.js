import { useCallback, useEffect, useState } from 'react'
import { formatTimerParts, getSecondsSince } from '../utils/timer.js'

export function useSmokeTimer(lastSmokedAt) {
  const computeSeconds = useCallback(
    () => getSecondsSince(lastSmokedAt),
    [lastSmokedAt],
  )

  const [seconds, setSeconds] = useState(computeSeconds)

  useEffect(() => {
    setSeconds(computeSeconds())
    const id = setInterval(() => setSeconds(computeSeconds()), 1000)
    return () => clearInterval(id)
  }, [computeSeconds])

  return {
    parts: formatTimerParts(seconds),
  }
}
