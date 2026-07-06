function CountdownTimer({ secondsLeft, totalSeconds, size = 56 }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const fraction = totalSeconds > 0 ? Math.max(0, Math.min(1, secondsLeft / totalSeconds)) : 0
  const offset = circumference * (1 - fraction)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={6} className="stroke-white/10" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="stroke-ink-coral transition-[stroke-dashoffset] duration-1000 ease-linear"
          fill="none"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-heading text-sm">{secondsLeft}</span>
    </div>
  )
}

export default CountdownTimer
