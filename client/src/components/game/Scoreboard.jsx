const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }

function Scoreboard({ players, title = 'Scoreboard' }) {
  // The server already computes a tie-aware `rank` (see rankPlayers in
  // scoringService.js) — equal ranks here mean a genuine tie (score, then
  // correct-guess count, then average guess time all matched), not just
  // equal scores. Sort by that rank for display order; nickname only breaks
  // the on-screen ordering, it never changes the rank number shown.
  const ranked = [...players].sort((a, b) => {
    const rankA = a.rank ?? Infinity
    const rankB = b.rank ?? Infinity
    if (rankA !== rankB) return rankA - rankB
    return a.nickname.localeCompare(b.nickname)
  })

  return (
    <div className="w-full max-w-sm rounded-xl bg-ink-bg p-6">
      <h2 className="mb-4 text-center font-heading text-2xl text-ink-yellow">{title}</h2>
      <ol className="flex flex-col gap-2">
        {ranked.map((player, i) => {
          const rank = player.rank ?? i + 1
          return (
            <li
              key={player.player_id}
              className="scoreboard-row-in flex items-center gap-3"
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <span className="w-6 text-center text-ink-text/50">{MEDALS[rank] || rank}</span>
              <span className="text-xl">{player.avatar}</span>
              <span className="flex-1 truncate">{player.nickname}</span>
              {player.tied && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-yellow">
                  Tie
                </span>
              )}
              <span className="font-semibold text-ink-coral">{player.score}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default Scoreboard
