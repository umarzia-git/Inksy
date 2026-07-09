import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import Scoreboard from './Scoreboard.jsx'
import { playWinnerFanfare } from '../../utils/sounds.js'

// Joins winner names for the announcement: "A wins!", "A and B win!", or
// "A, B, and C win!".
function joinNames(names) {
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`
}

function winnerAnnouncement(winners) {
  if (!winners || winners.length === 0) return ''
  if (winners.length === 1) return `🎉 ${winners[0].nickname} wins!`
  return `🎉 It's a tie! ${joinNames(winners.map((w) => w.nickname))} win!`
}

function WinnerScreen({ players, winners, isHost, onRematch, onLeave }) {
  useEffect(() => {
    // Fires once for the whole overlay — every client (winners and everyone
    // else) sees the same celebration, so a tie for first doesn't need any
    // special-casing here to make sure "both" tied players get it.
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } })
    playWinnerFanfare()
  }, [])

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-ink-bg/95 p-6 text-center">
      {winners && winners.length > 0 && (
        <div>
          <p className="font-heading text-2xl text-ink-yellow">{winnerAnnouncement(winners)}</p>
          <div className="mt-2 flex justify-center gap-2 text-4xl">
            {winners.map((w) => (
              <span key={w.playerId}>{w.avatar}</span>
            ))}
          </div>
        </div>
      )}
      <Scoreboard players={players} title="Final Scores" />
      <div className="flex gap-3">
        {isHost ? (
          <button type="button" onClick={onRematch} className="rounded-lg bg-ink-coral px-6 py-3 font-heading text-ink-bg">
            Rematch
          </button>
        ) : (
          <p className="text-ink-text/70">Waiting for host to start a rematch…</p>
        )}
        <button type="button" onClick={onLeave} className="rounded-lg bg-white/10 px-6 py-3 font-heading">
          Leave
        </button>
      </div>
    </div>
  )
}

export default WinnerScreen
