export const MAX_PLAYERS_PER_ROOM = 8

export const WORD_SELECT_DURATION_MS = 15000
export const SCOREBOARD_DURATION_MS = 5000

// Points awarded by guess order: 1st correct guess gets the first entry, 2nd
// gets the second, etc. Anyone guessing after the list runs out gets MIN_GUESS_POINTS.
export const GUESS_POINTS_BY_RANK = [300, 250, 200, 150]
export const MIN_GUESS_POINTS = 50
export const DRAWER_POINTS_PER_GUESSER = 10
export const DRAWER_ALL_GUESSED_BONUS = 50

export const HINT_1_FRACTION = 0.6
export const HINT_2_FRACTION = 0.7

export const DRAWER_DISCONNECT_SKIP_MS = 15000

// Selectable in Create Room's category chips. Must match the `category`
// values used in server/db/seed/words.json exactly (e.g. "school" not
// "school items" — the chip label is friendlier than the underlying slug).
export const WORD_CATEGORIES = [
  'animals',
  'food',
  'sports',
  'countries',
  'school',
  'car brands',
  'movies',
  'music',
  'clothing',
  'technology',
  'superheroes',
  'jobs',
  'nature',
]
