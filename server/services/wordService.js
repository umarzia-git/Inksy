import { pool } from '../config/mysql.js'

async function randomWords(difficulty, count) {
  const [rows] = await pool.query('SELECT word FROM words WHERE difficulty = ? ORDER BY RAND() LIMIT ?', [
    difficulty,
    count,
  ])
  return rows.map((r) => r.word)
}

export async function pickWordChoices(difficulty) {
  if (difficulty === 'mixed') {
    const [easy, medium, hard] = await Promise.all([
      randomWords('easy', 1),
      randomWords('medium', 1),
      randomWords('hard', 1),
    ])
    return [...easy, ...medium, ...hard]
  }
  return randomWords(difficulty, 3)
}
