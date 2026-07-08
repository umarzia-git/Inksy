export function isValidNickname(nickname) {
  return typeof nickname === 'string' && nickname.trim().length > 0 && nickname.trim().length <= 20
}

export function isValidAvatar(avatar) {
  return typeof avatar === 'string' && avatar.length > 0 && avatar.length <= 4
}

export function isValidRoomCode(roomCode) {
  return typeof roomCode === 'string' && /^\d{6}$/.test(roomCode)
}

export function isValidSettings(settings) {
  if (!settings || typeof settings !== 'object') return false
  const validRounds = [3, 5, 7].includes(settings.rounds)
  const validDrawTime = [60, 90, 120].includes(settings.draw_time_sec)
  const validDifficulty = ['easy', 'medium', 'hard', 'mixed'].includes(settings.difficulty)
  return validRounds && validDrawTime && validDifficulty
}

// Custom words are optional — an empty list just means the feature is off. If the
// host provides any, at least 10 are required so the pool isn't trivially small.
export function isValidCustomWords(customWords) {
  if (!Array.isArray(customWords)) return false
  if (customWords.length === 0) return true
  if (customWords.length > 200) return false
  return customWords.length >= 10 && customWords.every((w) => typeof w === 'string' && w.trim().length > 0 && w.trim().length <= 50)
}
