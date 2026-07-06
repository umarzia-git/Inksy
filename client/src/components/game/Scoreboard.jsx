function Scoreboard({ players }) {
  const ranked = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-sm rounded-xl bg-ink-bg p-6">
        <h2 className="mb-4 text-center font-heading text-2xl text-ink-yellow">Scoreboard</h2>
        <ol className="flex flex-col gap-2">
          {ranked.map((player, i) => (
            <li key={player.player_id} className="flex items-center gap-3">
              <span className="w-5 text-ink-text/50">{i + 1}</span>
              <span className="text-xl">{player.avatar}</span>
              <span className="flex-1 truncate">{player.nickname}</span>
              <span className="font-semibold text-ink-coral">{player.score}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

export default Scoreboard
