import { useEffect, useRef, useState } from 'react'

function PlayerList({ players, selfPlayerId }) {
  // Seed with whoever's already here on first render so the initial list
  // doesn't animate — only players who join afterward should slide in.
  const seenIds = useRef(null)
  if (seenIds.current === null) {
    seenIds.current = new Set(players.map((p) => p.player_id))
  }
  const [enteringIds, setEnteringIds] = useState(new Set())

  useEffect(() => {
    const newIds = players.map((p) => p.player_id).filter((id) => !seenIds.current.has(id))
    if (newIds.length === 0) return

    newIds.forEach((id) => seenIds.current.add(id))
    setEnteringIds(new Set(newIds))
    const timeout = setTimeout(() => setEnteringIds(new Set()), 500)
    return () => clearTimeout(timeout)
  }, [players])

  return (
    <ul className="flex flex-col gap-2">
      {players.map((player) => (
        <li
          key={player.player_id}
          className={`flex items-center gap-3 rounded-lg bg-white/5 px-4 py-2 ${
            enteringIds.has(player.player_id) ? 'player-join-in' : ''
          }`}
        >
          <span className="text-2xl">{player.avatar}</span>
          <span className="flex-1 truncate">
            {player.nickname}
            {player.is_host && (
              <span className="ml-1.5" title="Host">
                👑
              </span>
            )}
            {player.player_id === selfPlayerId && ' (you)'}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default PlayerList
