import { logger } from '../utils/logger.js'
import { withSocketErrorHandling } from '../utils/withSocketErrorHandling.js'
import { registerRoomHandlers } from './roomHandlers.js'
import { registerDrawHandlers } from './drawHandlers.js'
import { registerGameHandlers } from './gameHandlers.js'
import { registerGuessHandlers } from './guessHandlers.js'
import { registerReactionHandlers } from './reactionHandlers.js'

export function attachSocketHandlers(io) {
  io.on('connection', (socket) => {
    logger.info('socket connected:', socket.id)

    registerRoomHandlers(io, socket, withSocketErrorHandling)
    registerDrawHandlers(io, socket, withSocketErrorHandling)
    registerGameHandlers(io, socket, withSocketErrorHandling)
    registerGuessHandlers(io, socket, withSocketErrorHandling)
    registerReactionHandlers(io, socket, withSocketErrorHandling)

    socket.on(
      'disconnect',
      withSocketErrorHandling(socket, 'disconnect', async (reason) => {
        logger.info('socket disconnected:', socket.id, reason)
      }),
    )
  })
}
