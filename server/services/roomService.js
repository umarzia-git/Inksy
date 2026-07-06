import { customAlphabet } from 'nanoid'
import { Room } from '../models/Room.js'
import { MAX_PLAYERS_PER_ROOM } from '../utils/gameConstants.js'

const generateCodeSuffix = customAlphabet('0123456789', 4)

async function generateUniqueRoomCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = `INKSY-${generateCodeSuffix()}`
    const exists = await Room.exists({ room_code: code })
    if (!exists) return code
  }
  throw new Error('Could not generate a unique room code, please try again')
}

export async function createRoom({ hostPlayerId, nickname, avatar, settings }) {
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
  })
  return room
}

export async function joinRoom({ roomCode, playerId, nickname, avatar }) {
  const room = await Room.findOne({ room_code: roomCode })
  if (!room) {
    throw Object.assign(new Error('Room not found'), { code: 'ROOM_NOT_FOUND' })
  }
  if (room.status !== 'lobby') {
    throw Object.assign(new Error('Game already in progress'), { code: 'ROOM_IN_PROGRESS' })
  }
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
  return room
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
