const STATUS_LABEL = {
  drawing: 'Drawing',
  guessed: 'Guessed!',
  waiting: 'Waiting',
  choosing: 'Choosing…',
}

function PlayerSidebar({ players, compact = false }) {
  if (compact) {
    return (
      <div className="flex gap-2 overflow-x-auto">
        {players.map((player) => (
          <div
            key={player.player_id}
            className="flex shrink-0 flex-col items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5"
          >
            <span className="text-lg">{player.avatar}</span>
            <span className="text-xs text-ink-yellow">{player.score}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {players.map((player) => (
        <li key={player.player_id} className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2">
          <span className="text-xl">{player.avatar}</span>
          <span className={`flex-1 truncate text-sm ${player.status === 'guessed' ? 'font-semibold text-green-400' : ''}`}>
            {player.nickname}
          </span>
          <span className="text-sm font-semibold text-ink-yellow">{player.score}</span>
          <span className="text-xs text-ink-text/50">{STATUS_LABEL[player.status] || ''}</span>
        </li>
      ))}
    </ul>
  )
}

export default PlayerSidebar
