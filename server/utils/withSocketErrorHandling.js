import { logger } from './logger.js'

// Wraps a socket event handler so a thrown/rejected error can never crash
// the process or take down other players' connections in the same room.
export function withSocketErrorHandling(socket, eventName, handler) {
  return async (...args) => {
    try {
      await handler(...args)
    } catch (err) {
      logger.error(`socket event "${eventName}" failed:`, err)
      socket.emit('error', { event: eventName, message: 'Something went wrong, please try again.' })
    }
  }
}
