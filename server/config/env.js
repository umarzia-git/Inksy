import 'dotenv/config'

const isProduction = process.env.NODE_ENV === 'production'

export const env = {
  port: process.env.PORT || 4000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  // In production, only the configured client URL may connect. In dev, reflect
  // whatever origin asked (so LAN-IP access from a phone works for testing
  // without needing to update config every time the device/network changes).
  corsOrigin: isProduction ? process.env.CLIENT_URL : true,
  mongoUri: process.env.MONGO_URI,
  mysql: {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  },
}
