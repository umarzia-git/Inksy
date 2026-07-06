export function isValidNickname(nickname) {
  return typeof nickname === 'string' && nickname.trim().length > 0 && nickname.trim().length <= 20
}

export function isValidAvatar(avatar) {
  return typeof avatar === 'string' && avatar.length > 0 && avatar.length <= 4
}

export function isValidRoomCode(roomCode) {
  return typeof roomCode === 'string' && /^INKSY-\d{4}$/.test(roomCode)
}

export function isValidSettings(settings) {
  if (!settings || typeof settings !== 'object') return false
  const validRounds = [3, 5, 7].includes(settings.rounds)
  const validDrawTime = [60, 90, 120].includes(settings.draw_time_sec)
  const validDifficulty = ['easy', 'medium', 'hard', 'mixed'].includes(settings.difficulty)
  return validRounds && validDrawTime && validDifficulty
}
