import 'dotenv/config'

const isProduction = process.env.NODE_ENV === 'production'

// CLIENT_URL is the primary frontend origin (e.g. the Vercel deployment).
// EXTRA_CORS_ORIGINS is an optional comma-separated list of additional
// allowed origins (e.g. "http://localhost:5173" so the live Railway backend
// can still be reached from a local dev build). Both Express and Socket.io
// read this same list, so they can never drift out of sync with each other.
const productionOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.EXTRA_CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
].filter(Boolean)

export const env = {
  port: process.env.PORT || 4000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  // In production, only the configured origins may connect. In dev, reflect
  // whatever origin asked (so LAN-IP access from a phone works for testing
  // without needing to update config every time the device/network changes).
  corsOrigin: isProduction ? productionOrigins : true,
  mongoUri: process.env.MONGO_URI,
  mysql: {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
}
