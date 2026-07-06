import { pool } from '../../config/mysql.js'

export async function recordFinishedGame({ roomCode, startedAt, endedAt, winnerNickname, players }) {
  const [result] = await pool.query(
    'INSERT INTO games (room_code, started_at, ended_at, winner_nickname) VALUES (?, ?, ?, ?)',
    [roomCode, startedAt, endedAt, winnerNickname],
  )
  const gameId = result.insertId

  for (const p of players) {
    await pool.query('INSERT INTO game_players (game_id, nickname, avatar, final_score) VALUES (?, ?, ?, ?)', [
      gameId,
      p.nickname,
      p.avatar,
      p.score,
    ])
  }

  return gameId
}
