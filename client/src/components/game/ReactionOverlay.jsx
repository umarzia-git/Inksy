// Small stable horizontal jitter derived from the reaction's own id, so it
// stays fixed for that reaction's whole lifetime — never recalculated from
// its position in the (shrinking, as older reactions expire) reactions array.
function jitterFor(id, spreadPx) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 1000
  }
  return (hash / 999) * spreadPx - spreadPx / 2
}

function ReactionOverlay({ reactions }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {reactions.map((r) => (
        <span
          key={r.id}
          className="reaction-float absolute bottom-4 left-1/2 text-3xl"
          style={{ '--reaction-x': `calc(-50% + ${jitterFor(r.id, 56)}px)` }}
        >
          {r.emoji}
        </span>
      ))}
    </div>
  )
}

export default ReactionOverlay
