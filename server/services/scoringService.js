import { GUESS_POINTS_BY_RANK, MIN_GUESS_POINTS, DRAWER_POINTS_PER_GUESSER, DRAWER_ALL_GUESSED_BONUS } from '../utils/gameConstants.js'

// rank is 1-indexed: 1 for the first correct guess, 2 for the second, etc.
export function calculateGuessPoints(rank) {
  return GUESS_POINTS_BY_RANK[rank - 1] ?? MIN_GUESS_POINTS
}

export function calculateDrawerBonus(correctGuesserCount, allGuessed) {
  return correctGuesserCount * DRAWER_POINTS_PER_GUESSER + (allGuessed ? DRAWER_ALL_GUESSED_BONUS : 0)
}
