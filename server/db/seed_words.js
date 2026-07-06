import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { pool } from '../config/mysql.js'
import { logger } from '../utils/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const words = JSON.parse(readFileSync(path.join(__dirname, 'seed', 'words.json'), 'utf8'))

async function seed() {
  for (const { word, difficulty, category } of words) {
    await pool.query(
      'INSERT IGNORE INTO words (word, difficulty, category) VALUES (?, ?, ?)',
      [word, difficulty, category],
    )
  }
  const [[{ count }]] = await pool.query('SELECT COUNT(*) AS count FROM words')
  logger.info(`words table now has ${count} rows`)
  await pool.end()
}

seed().catch((err) => {
  logger.error('seeding failed:', err)
  process.exit(1)
})
