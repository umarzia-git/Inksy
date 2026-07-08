import crypto from 'node:crypto'
import { Room } from '../models/Room.js'
import { MAX_PLAYERS_PER_ROOM } from '../utils/gameConstants.js'

async function generateUniqueRoomCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = String(crypto.randomInt(100000, 1000000))
    const exists = await Room.exists({ room_code: code })
    if (!exists) return code
  }
  throw new Error('Could not generate a unique room code, please try again')
}

export async function createRoom({ hostPlayerId, nickname, avatar, settings, customWords = [] }) {
  const roomCode = await generateUniqueRoomCode()
  const room = await Room.create({
    room_code: roomCode,
    host_player_id: hostPlayerId,
    settings,
    status: 'lobby',
    players: [
      {
        player_id: hostPlayerId,
        nickname,
        avatar,
        is_host: true,
        connected: true,
        status: 'waiting',
      },
    ],
    custom_words: customWords,
  })
  return room
}

export async function joinRoom({ roomCode, playerId, nickname, avatar }) {
  const room = await Room.findOne({ room_code: roomCode })
  if (!room) {
    throw Object.assign(new Error('Room not found'), { code: 'ROOM_NOT_FOUND' })
  }

  if (room.status === 'lobby') {
    if (room.players.length >= MAX_PLAYERS_PER_ROOM) {
      throw Object.assign(new Error('Room is full'), { code: 'ROOM_FULL' })
    }
    room.players.push({
      player_id: playerId,
      nickname,
      avatar,
      is_host: false,
      connected: true,
      status: 'waiting',
    })
    await room.save()
    return { room, playerId, isSpectator: false, isReconnect: false }
  }

  // A game is already running. Someone with a matching nickname is treated as
  // the same person rejoining (their seat/score is restored); anyone new
  // joins as a spectator until the next round starts.
  const existing = room.players.find((p) => p.nickname.toLowerCase() === nickname.toLowerCase())
  if (existing) {
    existing.connected = true
    existing.disconnected_at = null
    await room.save()
    return { room, playerId: existing.player_id, isSpectator: existing.is_spectator, isReconnect: true }
  }

  room.players.push({
    player_id: playerId,
    nickname,
    avatar,
    is_host: false,
    connected: true,
    status: 'spectating',
    is_spectator: true,
  })
  await room.save()
  return { room, playerId, isSpectator: true, isReconnect: false }
}

export async function removePlayer(roomCode, playerId) {
  const room = await Room.findOne({ room_code: roomCode })
  if (!room) return null
  room.players = room.players.filter((p) => p.player_id !== playerId)
  await room.save()
  return room
}

export async function getRoomByCode(roomCode) {
  return Room.findOne({ room_code: roomCode })
}
