import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectMongo() {
  await mongoose.connect(env.mongoUri)
}

export function mongoStatus() {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
}
