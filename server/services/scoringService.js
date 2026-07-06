import { MAX_GUESS_POINTS, MIN_GUESS_POINTS, DRAWER_POINTS_PER_GUESSER, DRAWER_ALL_GUESSED_BONUS } from '../utils/gameConstants.js'

export function calculateGuessPoints(elapsedMs, totalMs) {
  const fraction = Math.max(0, Math.min(1, elapsedMs / totalMs))
  return Math.max(MIN_GUESS_POINTS, Math.round(MAX_GUESS_POINTS * (1 - fraction)))
}

export function calculateDrawerBonus(correctGuesserCount, allGuessed) {
  return correctGuesserCount * DRAWER_POINTS_PER_GUESSER + (allGuessed ? DRAWER_ALL_GUESSED_BONUS : 0)
}
