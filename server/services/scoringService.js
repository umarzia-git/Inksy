import { GUESS_POINTS_BY_RANK, MIN_GUESS_POINTS, DRAWER_POINTS_PER_GUESSER, DRAWER_ALL_GUESSED_BONUS } from '../utils/gameConstants.js'

// rank is 1-indexed: 1 for the first correct guess, 2 for the second, etc.
export function calculateGuessPoints(rank) {
  return GUESS_POINTS_BY_RANK[rank - 1] ?? MIN_GUESS_POINTS
}

export function calculateDrawerBonus(correctGuesserCount, allGuessed) {
  return correctGuesserCount * DRAWER_POINTS_PER_GUESSER + (allGuessed ? DRAWER_ALL_GUESSED_BONUS : 0)
}

// Tie-aware competition ranking (1, 2, 2, 4 — not 1, 2, 2, 3). Players tied on
// score are broken first by who guessed correctly more often, then by who had
// the faster average guess time; anyone still exactly tied after that shares
// the same rank number. Returns a Map of player_id -> rank; the underlying
// stats (correct_guesses_count / total_guess_time_ms) are only ever used here
// to compute that number — callers should not forward the raw stats to clients.
export function rankPlayers(players) {
  const stats = players.map((p) => {
    const correctGuessesCount = p.correct_guesses_count || 0
    const avgGuessTimeMs = correctGuessesCount > 0 ? p.total_guess_time_ms / correctGuessesCount : Infinity
    return { player_id: p.player_id, score: p.score, correctGuessesCount, avgGuessTimeMs }
  })

  const sorted = [...stats].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.correctGuessesCount !== a.correctGuessesCount) return b.correctGuessesCount - a.correctGuessesCount
    return a.avgGuessTimeMs - b.avgGuessTimeMs
  })

  const ranks = new Map()
  let rank = 0
  let previousKey = null
  sorted.forEach((p, i) => {
    const key = `${p.score}|${p.correctGuessesCount}|${p.avgGuessTimeMs}`
    if (key !== previousKey) {
      rank = i + 1
      previousKey = key
    }
    ranks.set(p.player_id, rank)
  })
  return ranks
}
