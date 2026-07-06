import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import mysql from 'mysql2/promise'
import { env } from '../config/env.js'
import { logger } from '../utils/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsDir = path.join(__dirname, 'migrations')

async function migrate() {
  // Connect without selecting a database first, since it may not exist yet.
  const connection = await mysql.createConnection({
    host: env.mysql.host,
    port: env.mysql.port,
    user: env.mysql.user,
    password: env.mysql.password,
    multipleStatements: true,
  })

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${env.mysql.database}\``)
  await connection.changeUser({ database: env.mysql.database })

  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename VARCHAR(255) PRIMARY KEY,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  const [applied] = await connection.query('SELECT filename FROM schema_migrations')
  const appliedNames = new Set(applied.map((row) => row.filename))

  const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()

  for (const file of files) {
    if (appliedNames.has(file)) continue
    const sql = readFileSync(path.join(migrationsDir, file), 'utf8')
    logger.info(`applying migration ${file}`)
    await connection.query(sql)
    await connection.query('INSERT INTO schema_migrations (filename) VALUES (?)', [file])
  }

  await connection.end()
  logger.info('migrations up to date')
}

migrate().catch((err) => {
  logger.error('migration failed:', err)
  process.exit(1)
})
