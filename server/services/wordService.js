import { pool } from '../config/mysql.js'

const MAX_CUSTOM_WORDS_PER_TURN = 2

function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

async function randomWords(difficulty, count, excludeWords) {
  if (excludeWords.length === 0) {
    const [rows] = await pool.query('SELECT word FROM words WHERE difficulty = ? ORDER BY RAND() LIMIT ?', [
      difficulty,
      count,
    ])
    return rows.map((r) => r.word)
  }

  const placeholders = excludeWords.map(() => '?').join(',')
  const [rows] = await pool.query(
    `SELECT word FROM words WHERE difficulty = ? AND word NOT IN (${placeholders}) ORDER BY RAND() LIMIT ?`,
    [difficulty, ...excludeWords, count],
  )
  if (rows.length >= count) return rows.map((r) => r.word)

  // This difficulty's pool is exhausted for the game — allow repeats rather
  // than leaving the drawer with fewer than 3 choices.
  const remaining = count - rows.length
  const [fallbackRows] = await pool.query('SELECT word FROM words WHERE difficulty = ? ORDER BY RAND() LIMIT ?', [
    difficulty,
    remaining,
  ])
  return [...rows.map((r) => r.word), ...fallbackRows.map((r) => r.word)]
}

async function defaultWordChoices(difficulty, usedWords) {
  if (difficulty === 'mixed') {
    const [easy, medium, hard] = await Promise.all([
      randomWords('easy', 2, usedWords),
      randomWords('medium', 2, usedWords),
      randomWords('hard', 1, usedWords),
    ])
    return [...easy, ...medium, ...hard]
  }
  return randomWords(difficulty, 5, usedWords)
}

// Swaps a couple of the default choices out for host-provided custom words (if
// any are left unused this game), so custom word packs surface regularly
// without crowding out the normal difficulty-tiered pool entirely.
function mixInCustomWords(choices, customWords, usedWords) {
  const available = shuffle(customWords.filter((w) => !usedWords.includes(w) && !choices.includes(w)))
  if (available.length === 0) return choices

  const replaceCount = Math.min(MAX_CUSTOM_WORDS_PER_TURN, available.length, choices.length)
  const result = [...choices]
  for (let i = 0; i < replaceCount; i++) {
    result[i] = available[i]
  }
  return shuffle(result)
}

export async function pickWordChoices(difficulty, usedWords = [], customWords = []) {
  const choices = await defaultWordChoices(difficulty, usedWords)
  return mixInCustomWords(choices, customWords, usedWords)
}
