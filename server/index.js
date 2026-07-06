import { createServer } from 'node:http'
import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'

import { env } from './config/env.js'
import { connectMysql } from './config/mysql.js'
import { connectMongo } from './config/mongo.js'
import { healthRouter } from './routes/health.js'
import { errorHandler } from './middleware/errorHandler.js'
import { attachSocketHandlers } from './sockets/index.js'
import { logger } from './utils/logger.js'

const app = express()
app.use(cors({ origin: env.clientUrl }))
app.use(express.json())

app.use('/api/health', healthRouter)

app.use(errorHandler)

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: env.clientUrl },
})

attachSocketHandlers(io)

try {
  await connectMysql()
  logger.info('MySQL connected')
} catch (err) {
  logger.error('MySQL connection failed:', err)
}

try {
  await connectMongo()
  logger.info('MongoDB connected')
} catch (err) {
  logger.error('MongoDB connection failed:', err)
}

httpServer.listen(env.port, () => {
  logger.info(`Inksy server listening on port ${env.port}`)
})
