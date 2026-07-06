import { pool } from '../config/mysql.js'

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

export async function pickWordChoices(difficulty, usedWords = []) {
  if (difficulty === 'mixed') {
    const [easy, medium, hard] = await Promise.all([
      randomWords('easy', 1, usedWords),
      randomWords('medium', 1, usedWords),
      randomWords('hard', 1, usedWords),
    ])
    return [...easy, ...medium, ...hard]
  }
  return randomWords(difficulty, 3, usedWords)
}
