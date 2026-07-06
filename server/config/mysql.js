import mysql from 'mysql2/promise'
import { env } from './env.js'

export const pool = mysql.createPool({
  host: env.mysql.host,
  port: env.mysql.port,
  user: env.mysql.user,
  password: env.mysql.password,
  database: env.mysql.database,
  waitForConnections: true,
  connectionLimit: 10,
})

export async function connectMysql() {
  const connection = await pool.getConnection()
  connection.release()
}

export async function mysqlStatus() {
  try {
    await pool.query('SELECT 1')
    return 'connected'
  } catch {
    return 'disconnected'
  }
}
