import { SOCKET_EVENTS } from '../utils/socketEvents.js'
import { submitGuess } from '../services/gameStateMachine.js'

function isAuthorized(socket, roomCode) {
  return Boolean(socket.data.roomCode) && socket.data.roomCode === roomCode
}

export function registerGuessHandlers(io, socket, withErrorHandling) {
  socket.on(
    SOCKET_EVENTS.GUESS_SUBMIT,
    withErrorHandling(socket, SOCKET_EVENTS.GUESS_SUBMIT, async ({ roomCode, message } = {}) => {
      if (!isAuthorized(socket, roomCode) || typeof message !== 'string' || !message.trim()) return
      await submitGuess(io, roomCode, socket.data.playerId, message.trim().slice(0, 200))
    }),
  )
}
