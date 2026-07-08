import { useEffect, useState } from 'react'
import AnimatedNumber from '../common/AnimatedNumber.jsx'

const STATUS_LABEL = {
  drawing: 'Drawing',
  guessed: 'Guessed!',
  waiting: 'Waiting',
  choosing: 'Choosing…',
  spectating: 'Spectating',
}

function guessStatusIcon(player, phase) {
  if (player.status === 'guessed') return '✅'
  if (phase === 'drawing' && player.status === 'waiting') return '⏳'
  return null
}

function useFlashingPlayerId(flashEvent) {
  const [flashingId, setFlashingId] = useState(null)
  useEffect(() => {
    if (!flashEvent) return
    setFlashingId(flashEvent.playerId)
    const timeout = setTimeout(() => setFlashingId(null), 900)
    return () => clearTimeout(timeout)
  }, [flashEvent])
  return flashingId
}

function PlayerSidebar({ players, compact = false, phase = null, flashEvent = null }) {
  const flashingId = useFlashingPlayerId(flashEvent)

  if (compact) {
    return (
      <div className="flex gap-2 overflow-x-auto">
        {players.map((player) => (
          <div
            key={player.player_id}
            className={`flex shrink-0 flex-col items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 ${
              flashingId === player.player_id ? 'player-flash-green' : ''
            }`}
          >
            <span className="text-lg">
              {player.avatar}
              {guessStatusIcon(player, phase) && <span className="ml-0.5 text-xs">{guessStatusIcon(player, phase)}</span>}
            </span>
            <span className="text-xs text-ink-yellow">
              <AnimatedNumber value={player.score} />
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {players.map((player) => {
        const icon = guessStatusIcon(player, phase)
        const label = phase === 'drawing' && player.status === 'waiting' ? 'Guessing…' : STATUS_LABEL[player.status] || ''
        return (
          <li
            key={player.player_id}
            className={`flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2 ${
              flashingId === player.player_id ? 'player-flash-green' : ''
            }`}
          >
            <span className="text-xl">{player.avatar}</span>
            <span className={`flex-1 truncate text-sm ${player.status === 'guessed' ? 'font-semibold text-green-400' : ''}`}>
              {player.nickname}
            </span>
            <span className="text-sm font-semibold text-ink-yellow">
              <AnimatedNumber value={player.score} />
            </span>
            {icon && <span className="text-sm">{icon}</span>}
            <span className="text-xs text-ink-text/50">{label}</span>
          </li>
        )
      })}
    </ul>
  )
}

export default PlayerSidebar
