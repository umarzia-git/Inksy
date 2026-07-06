import { logger } from '../utils/logger.js'

// Express error-handling middleware (4 args is what marks it as one to Express).
export function errorHandler(err, req, res, next) {
  logger.error(`${req.method} ${req.path} failed:`, err)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
}
