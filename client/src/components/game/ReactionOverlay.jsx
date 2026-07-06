function ReactionOverlay({ reactions }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {reactions.map((r, i) => (
        <span key={r.id} className="reaction-float absolute bottom-4 text-3xl" style={{ left: `${10 + ((i * 37) % 80)}%` }}>
          {r.emoji}
        </span>
      ))}
    </div>
  )
}

export default ReactionOverlay
