const REACTIONS = ['😂', '🔥', '👏', '😮', '💀']

function ReactionBar({ onSend }) {
  return (
    <div className="flex gap-1">
      {REACTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSend(emoji)}
          className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/5 text-lg transition hover:bg-white/10"
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

export default ReactionBar
