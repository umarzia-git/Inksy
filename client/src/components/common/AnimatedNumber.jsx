import { useEffect, useRef, useState } from 'react'

const DURATION_MS = 700

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3
}

function AnimatedNumber({ value }) {
  const [displayed, setDisplayed] = useState(value)
  const fromRef = useRef(value)
  const rafRef = useRef(null)

  useEffect(() => {
    const from = fromRef.current
    const to = value
    if (from === to) return

    const start = performance.now()
    cancelAnimationFrame(rafRef.current)

    function tick(now) {
      const progress = Math.min(1, (now - start) / DURATION_MS)
      setDisplayed(Math.round(from + (to - from) * easeOutCubic(progress)))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value])

  return displayed
}

export default AnimatedNumber
