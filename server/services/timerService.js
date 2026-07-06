import { logger } from '../utils/logger.js'

// Tracks setTimeout/setInterval handles per room so a room's timers can
// always be fully cancelled before scheduling new ones (phase transitions,
// rematch, or the room emptying out).
const roomTimers = new Map()

// Timer callbacks run outside any socket event, so withSocketErrorHandling
// never sees them — an uncaught throw/rejection here would crash the whole
// process (Node has no handler for it), taking down every room, not just
// one player's. Every timer must go through this.
function safe(fn) {
  return (...args) => {
    Promise.resolve()
      .then(() => fn(...args))
      .catch((err) => logger.error('room timer callback failed:', err))
  }
}

export function setRoomTimer(roomCode, key, fn, ms) {
  let timers = roomTimers.get(roomCode)
  if (!timers) {
    timers = {}
    roomTimers.set(roomCode, timers)
  }
  clearTimeout(timers[key])
  clearInterval(timers[key])
  timers[key] = setTimeout(safe(fn), ms)
}

export function setRoomInterval(roomCode, key, fn, ms) {
  let timers = roomTimers.get(roomCode)
  if (!timers) {
    timers = {}
    roomTimers.set(roomCode, timers)
  }
  clearTimeout(timers[key])
  clearInterval(timers[key])
  timers[key] = setInterval(safe(fn), ms)
}

export function clearRoomTimer(roomCode, key) {
  const timers = roomTimers.get(roomCode)
  if (!timers || !(key in timers)) return
  clearTimeout(timers[key])
  clearInterval(timers[key])
  delete timers[key]
}

export function clearAllRoomTimers(roomCode) {
  const timers = roomTimers.get(roomCode)
  if (!timers) return
  for (const handle of Object.values(timers)) {
    clearTimeout(handle)
    clearInterval(handle)
  }
  roomTimers.delete(roomCode)
}
