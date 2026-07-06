import { SOCKET_EVENTS } from '../utils/socketEvents.js'

const ALLOWED_REACTIONS = ['😂', '🔥', '👏', '😮', '💀']

function isAuthorized(socket, roomCode) {
  return Boolean(socket.data.roomCode) && socket.data.roomCode === roomCode
}

export function registerReactionHandlers(io, socket, withErrorHandling) {
  socket.on(
    SOCKET_EVENTS.REACTION_SEND,
    withErrorHandling(socket, SOCKET_EVENTS.REACTION_SEND, async ({ roomCode, emoji } = {}) => {
      if (!isAuthorized(socket, roomCode) || !ALLOWED_REACTIONS.includes(emoji)) return
      io.to(roomCode).emit(SOCKET_EVENTS.REACTION_SEND, { playerId: socket.data.playerId, emoji })
    }),
  )
}
