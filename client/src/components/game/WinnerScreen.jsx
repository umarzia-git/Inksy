import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import Scoreboard from './Scoreboard.jsx'

function WinnerScreen({ players, winner, isHost, onRematch, onLeave }) {
  useEffect(() => {
    confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } })
  }, [])

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center gap-6 bg-ink-bg/95 p-6 text-center">
      {winner && (
        <div>
          <p className="font-heading text-2xl text-ink-yellow">🏆 {winner.nickname} wins!</p>
          <p className="text-4xl">{winner.avatar}</p>
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
