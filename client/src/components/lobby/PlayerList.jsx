function PlayerList({ players, selfPlayerId }) {
  return (
    <ul className="flex flex-col gap-2">
      {players.map((player) => (
        <li
          key={player.player_id}
          className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-2"
        >
          <span className="text-2xl">{player.avatar}</span>
          <span className="flex-1 truncate">
            {player.nickname}
            {player.player_id === selfPlayerId && ' (you)'}
          </span>
          {player.is_host && (
            <span className="rounded bg-ink-yellow px-2 py-0.5 text-xs font-semibold text-ink-bg">HOST</span>
          )}
        </li>
      ))}
    </ul>
  )
}

export default PlayerList
