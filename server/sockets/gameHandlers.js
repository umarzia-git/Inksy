import { SOCKET_EVENTS } from '../utils/socketEvents.js'
import { Room } from '../models/Room.js'
import { startGame, pickWord, rematch, buildGameSnapshot } from '../services/gameStateMachine.js'

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

  // Called once by GamePage right after it mounts, so the client's own view
  // of the round is always correct regardless of whether it missed the
  // round:start broadcast (e.g. it fires the instant game:start does, before
  // this client has necessarily finished navigating and attaching listeners).
  socket.on(
    'game:sync',
    withErrorHandling(socket, 'game:sync', async ({ roomCode } = {}, callback) => {
      if (!isAuthorized(socket, roomCode)) return callback?.({ snapshot: null })
      const room = await Room.findOne({ room_code: roomCode })
      if (!room) return callback?.({ snapshot: null })

      callback?.({ snapshot: buildGameSnapshot(room) })

      if (room.game_state.current_drawer_player_id === socket.data.playerId) {
        if (room.status === 'word_select') {
          socket.emit(SOCKET_EVENTS.WORD_CHOICES, { choices: room.game_state.word_choices })
        } else if (room.status === 'drawing' && room.game_state.current_word) {
          socket.emit(SOCKET_EVENTS.WORD_REVEAL, { word: room.game_state.current_word })
        }
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
