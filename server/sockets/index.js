import { logger } from '../utils/logger.js'

// Wraps a socket event handler so a thrown/rejected error can never crash
// the process or take down other players' connections in the same room.
function withErrorHandling(socket, eventName, handler) {
  return async (...args) => {
    try {
      await handler(...args)
    } catch (err) {
      logger.error(`socket event "${eventName}" failed:`, err)
      socket.emit('error', { event: eventName, message: 'Something went wrong, please try again.' })
    }
  }
}

export function attachSocketHandlers(io) {
  io.on('connection', (socket) => {
    logger.info('socket connected:', socket.id)

    socket.on('disconnect', withErrorHandling(socket, 'disconnect', async (reason) => {
      logger.info('socket disconnected:', socket.id, reason)
    }))
  })
}
