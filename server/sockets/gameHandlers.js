import { SOCKET_EVENTS } from '../utils/socketEvents.js'
import { Room } from '../models/Room.js'
import { startGame, pickWord, rematch } from '../services/gameStateMachine.js'

function isAuthorized(socket, roomCode) {
  return Boolean(socket.data.roomCode) && socket.data.roomCode === roomCode
}

export function registerGameHandlers(io, socket, withErrorHandling) {
  socket.on(
    SOCKET_EVENTS.GAME_START,
    withErrorHandling(socket, SOCKET_EVENTS.GAME_START, async ({ roomCode } = {}) => {
      if (!isAuthorized(socket, roomCode)) return
      const room = await Room.findOne({ room_code: roomCode })
      if (!room || room.host_player_id !== socket.data.playerId) return

      if (room.status === 'game_end') {
        await rematch(io, roomCode)
      } else {
        await startGame(io, roomCode)
      }
    }),
  )

  socket.on(
    'word:pick',
    withErrorHandling(socket, 'word:pick', async ({ roomCode, word } = {}) => {
      if (!isAuthorized(socket, roomCode) || typeof word !== 'string') return
      await pickWord(io, roomCode, socket.data.playerId, word)
    }),
  )
}
