import crypto from 'node:crypto'
import { SOCKET_EVENTS } from '../utils/socketEvents.js'
import { createRoom, joinRoom, removePlayer, getRoomByCode } from '../services/roomService.js'
import { isValidNickname, isValidAvatar, isValidRoomCode, isValidSettings } from '../utils/validators.js'

function toPublicRoom(room) {
  return {
    room_code: room.room_code,
    host_player_id: room.host_player_id,
    settings: room.settings,
    status: room.status,
    players: room.players.map((p) => ({
      player_id: p.player_id,
      nickname: p.nickname,
      avatar: p.avatar,
      score: p.score,
      is_host: p.is_host,
      connected: p.connected,
      status: p.status,
    })),
  }
}

export function registerRoomHandlers(io, socket, withErrorHandling) {
  socket.on(
    'room:create',
    withErrorHandling(socket, 'room:create', async ({ nickname, avatar, settings } = {}, callback) => {
      if (!isValidNickname(nickname) || !isValidAvatar(avatar) || !isValidSettings(settings)) {
        callback?.({ error: 'Invalid room settings or profile' })
        return
      }

      const playerId = crypto.randomUUID()
      const room = await createRoom({ hostPlayerId: playerId, nickname: nickname.trim(), avatar, settings })

      socket.data.roomCode = room.room_code
      socket.data.playerId = playerId
      await socket.join(room.room_code)

      callback?.({ room: toPublicRoom(room), playerId })
    }),
  )

  socket.on(
    'room:join',
    withErrorHandling(socket, 'room:join', async ({ roomCode, nickname, avatar } = {}, callback) => {
      if (!isValidRoomCode(roomCode) || !isValidNickname(nickname) || !isValidAvatar(avatar)) {
        callback?.({ error: 'Invalid join request' })
        return
      }

      let room
      try {
        const playerId = crypto.randomUUID()
        room = await joinRoom({ roomCode, playerId, nickname: nickname.trim(), avatar })

        socket.data.roomCode = room.room_code
        socket.data.playerId = playerId
        await socket.join(room.room_code)

        callback?.({ room: toPublicRoom(room), playerId })
        socket.to(room.room_code).emit(SOCKET_EVENTS.PLAYER_JOINED, { room: toPublicRoom(room) })
      } catch (err) {
        callback?.({ error: err.message })
      }
    }),
  )

  socket.on(
    'disconnect',
    withErrorHandling(socket, 'room:disconnect', async () => {
      const { roomCode, playerId } = socket.data
      if (!roomCode || !playerId) return

      const room = await getRoomByCode(roomCode)
      if (!room || room.status !== 'lobby') return // in-game disconnects are handled by reconnection logic (Step 11)

      const updated = await removePlayer(roomCode, playerId)
      if (updated) {
        io.to(roomCode).emit(SOCKET_EVENTS.PLAYER_LEFT, { room: toPublicRoom(updated) })
      }
    }),
  )
}
