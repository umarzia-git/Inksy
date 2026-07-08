import { SOCKET_EVENTS } from '../utils/socketEvents.js'
import { Room } from '../models/Room.js'

// A socket may only draw in the room it actually joined via room:create/room:join,
// and spectators can't draw until they're promoted to a full player next round.
function isAuthorized(socket, roomCode) {
  return Boolean(socket.data.roomCode) && socket.data.roomCode === roomCode && !socket.data.isSpectator
}

export function registerDrawHandlers(io, socket, withErrorHandling) {
  socket.on(
    SOCKET_EVENTS.DRAW_STROKE,
    withErrorHandling(socket, SOCKET_EVENTS.DRAW_STROKE, async ({ roomCode, stroke } = {}) => {
      if (!isAuthorized(socket, roomCode) || !stroke) return
      await Room.updateOne({ room_code: roomCode }, { $push: { canvas_strokes: stroke } })
      socket.to(roomCode).emit(SOCKET_EVENTS.DRAW_STROKE, { stroke })
    }),
  )

  socket.on(
    SOCKET_EVENTS.DRAW_CLEAR,
    withErrorHandling(socket, SOCKET_EVENTS.DRAW_CLEAR, async ({ roomCode } = {}) => {
      if (!isAuthorized(socket, roomCode)) return
      await Room.updateOne({ room_code: roomCode }, { $set: { canvas_strokes: [] } })
      socket.to(roomCode).emit(SOCKET_EVENTS.DRAW_CLEAR)
    }),
  )

  socket.on(
    SOCKET_EVENTS.DRAW_UNDO,
    withErrorHandling(socket, SOCKET_EVENTS.DRAW_UNDO, async ({ roomCode } = {}) => {
      if (!isAuthorized(socket, roomCode)) return
      await Room.updateOne({ room_code: roomCode }, { $pop: { canvas_strokes: 1 } })
      socket.to(roomCode).emit(SOCKET_EVENTS.DRAW_UNDO)
    }),
  )
}
