import { pool } from '../config/mysql.js'
import { WORD_CATEGORIES } from '../utils/gameConstants.js'

const MAX_CUSTOM_WORDS_PER_TURN = 2

// Used only if the MySQL word fetch fails (e.g. the DB is unreachable in
// production) — keeps the game playable instead of leaving the drawer stuck
// with no word choices. Kept large (100+ words, tiered by difficulty and
// tagged with the same categories used for filtering) so a full multi-round
// game never exhausts the pool and starts repeating words — that exhaustion
// (against the old 15-word untagged list) was the actual root cause of words
// like "book"/"house"/"chair"/"sun"/"moon" repeating on live deployments
// where MySQL was unreachable and every turn silently fell back.
const FALLBACK_WORDS = {
  easy: [
    { word: 'cat', category: 'animals' }, { word: 'dog', category: 'animals' },
    { word: 'house', category: 'objects' }, { word: 'tree', category: 'nature' },
    { word: 'car', category: 'objects' }, { word: 'sun', category: 'nature' },
    { word: 'moon', category: 'space' }, { word: 'fish', category: 'animals' },
    { word: 'bird', category: 'animals' }, { word: 'book', category: 'objects' },
    { word: 'phone', category: 'technology' }, { word: 'clock', category: 'technology' },
    { word: 'chair', category: 'objects' }, { word: 'table', category: 'objects' },
    { word: 'shoe', category: 'objects' }, { word: 'mud', category: 'nature' },
    { word: 'rio', category: 'movies' }, { word: 'dancer', category: 'jobs' },
    { word: 'avatar', category: 'movies' }, { word: 'hen', category: 'animals' },
    { word: 'eraser', category: 'school' }, { word: 'chip', category: 'technology' },
    { word: 'china', category: 'countries' }, { word: 'deadpool', category: 'superheroes' },
    { word: 'boot', category: 'clothing' }, { word: 'coco', category: 'movies' },
    { word: 'laptop', category: 'technology' }, { word: 'storm', category: 'nature' },
    { word: 'bear', category: 'animals' }, { word: 'banana', category: 'food' },
    { word: 'goal', category: 'sports' }, { word: 'brave', category: 'movies' },
    { word: 'leg', category: 'body parts' }, { word: 'eye', category: 'body parts' },
    { word: 'truck', category: 'vehicles' }, { word: 'apple', category: 'food' },
    { word: 'moana', category: 'movies' }, { word: 'door', category: 'objects' },
    { word: 'donut', category: 'food' }, { word: 'band', category: 'music' },
    { word: 'taco', category: 'food' }, { word: 'mouse', category: 'animals' },
    { word: 'antman', category: 'superheroes' }, { word: 'jump', category: 'sports' },
    { word: 'globe', category: 'school' }, { word: 'egg', category: 'food' },
    { word: 'calculator', category: 'school' }, { word: 'nurse', category: 'jobs' },
    { word: 'opera', category: 'music' }, { word: 'brazil', category: 'countries' },
    { word: 'ski', category: 'sports' }, { word: 'glue', category: 'school' },
    { word: 'star', category: 'space' }, { word: 'marker', category: 'school' },
    { word: 'flute', category: 'music' }, { word: 'glove', category: 'clothing' },
    { word: 'beat', category: 'music' }, { word: 'pencil', category: 'school' },
    { word: 'doctor', category: 'jobs' },
  ],
  medium: [
    { word: 'tongue', category: 'body parts' }, { word: 'croissant', category: 'food' },
    { word: 'bicycle', category: 'objects' }, { word: 'snowmobile', category: 'vehicles' },
    { word: 'blanket', category: 'objects' }, { word: 'minions', category: 'movies' },
    { word: 'router', category: 'technology' }, { word: 'germany', category: 'countries' },
    { word: 'webcam', category: 'technology' }, { word: 'omelette', category: 'food' },
    { word: 'forklift', category: 'vehicles' }, { word: 'riverbank', category: 'nature' },
    { word: 'marathon', category: 'sports' }, { word: 'hawkeye', category: 'superheroes' },
    { word: 'jumanji', category: 'movies' }, { word: 'pajamas', category: 'clothing' },
    { word: 'thumb', category: 'body parts' }, { word: 'penguin', category: 'animals' },
    { word: 'earrings', category: 'clothing' }, { word: 'classroom', category: 'school' },
    { word: 'eclipse', category: 'nature' }, { word: 'titanic', category: 'movies' },
    { word: 'motorcycle', category: 'vehicles' }, { word: 'godzilla', category: 'movies' },
    { word: 'swimsuit', category: 'clothing' }, { word: 'soccer', category: 'sports' },
    { word: 'football', category: 'sports' }, { word: 'archery', category: 'sports' },
    { word: 'monitor', category: 'technology' }, { word: 'aquaman', category: 'superheroes' },
    { word: 'printer', category: 'technology' }, { word: 'canyon', category: 'nature' },
    { word: 'scientist', category: 'jobs' }, { word: 'wardrobe', category: 'objects' },
    { word: 'starlord', category: 'superheroes' }, { word: 'bookshelf', category: 'objects' },
    { word: 'mirror', category: 'objects' }, { word: 'microphone', category: 'technology' },
    { word: 'supergirl', category: 'superheroes' }, { word: 'vietnam', category: 'countries' },
  ],
  hard: [
    { word: 'smartphone', category: 'technology' }, { word: 'scorpion', category: 'animals' },
    { word: 'ligament', category: 'body parts' }, { word: 'locomotive', category: 'vehicles' },
    { word: 'kazakhstan', category: 'countries' }, { word: 'mozambique', category: 'countries' },
    { word: 'pineapple', category: 'food' }, { word: 'rhinoceros', category: 'animals' },
    { word: 'bobsled', category: 'vehicles' }, { word: 'upholsterer', category: 'jobs' },
    { word: 'spaghetti', category: 'food' }, { word: 'ratatouille', category: 'food' },
    { word: 'orthodontist', category: 'jobs' }, { word: 'cheesecake', category: 'food' },
    { word: 'thermostat', category: 'objects' }, { word: 'lighthouse', category: 'objects' },
    { word: 'bicep', category: 'body parts' }, { word: 'metronome', category: 'objects' },
    { word: 'monsoon', category: 'nature' }, { word: 'waistcoat', category: 'clothing' },
    { word: 'vertebrae', category: 'body parts' }, { word: 'tributary', category: 'nature' },
    { word: 'azerbaijan', category: 'countries' }, { word: 'tuxedo', category: 'clothing' },
    { word: 'chemistry', category: 'school' }, { word: 'crescendo', category: 'music' },
    { word: 'kaleidoscope', category: 'objects' }, { word: 'serenade', category: 'music' },
    { word: 'mauritania', category: 'countries' }, { word: 'algebra', category: 'school' },
  ],
}
const ALL_FALLBACK_WORDS = [...FALLBACK_WORDS.easy, ...FALLBACK_WORDS.medium, ...FALLBACK_WORDS.hard]

function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// Degrades gracefully in stages rather than ever leaving the drawer with too
// few choices: same difficulty + category > same difficulty (any category) >
// any word at all. Each stage still excludes already-used words where possible.
function fallbackWords(difficulty, count, excludeWords, categories) {
  const tier = FALLBACK_WORDS[difficulty] || ALL_FALLBACK_WORDS
  const usedFilter = (w) => !excludeWords.includes(w.word)
  const categoryFilter = (w) => categories.includes(w.category)

  const result = []
  const seen = new Set()
  function addFrom(pool) {
    for (const w of shuffle(pool)) {
      if (result.length >= count) break
      if (seen.has(w.word)) continue
      seen.add(w.word)
      result.push(w.word)
    }
  }

  addFrom(tier.filter((w) => usedFilter(w) && categoryFilter(w)))
  if (result.length < count) addFrom(tier.filter(usedFilter))
  if (result.length < count) addFrom(ALL_FALLBACK_WORDS.filter(usedFilter))
  if (result.length < count) addFrom(ALL_FALLBACK_WORDS)
  return result
}

async function randomWords(difficulty, count, excludeWords, categories) {
  try {
    const categoryPlaceholders = categories.map(() => '?').join(',')
    const conditions = [`difficulty = ?`, `category IN (${categoryPlaceholders})`]
    const params = [difficulty, ...categories]

    if (excludeWords.length > 0) {
      conditions.push(`word NOT IN (${excludeWords.map(() => '?').join(',')})`)
      params.push(...excludeWords)
    }

    const [rows] = await pool.query(
      `SELECT word FROM words WHERE ${conditions.join(' AND ')} ORDER BY RAND() LIMIT ?`,
      [...params, count],
    )
    if (rows.length >= count) return rows.map((r) => r.word)

    // The used-words-excluded pool for this difficulty+category selection is
    // exhausted for the game — allow repeats rather than leaving the drawer
    // with fewer than the requested number of choices.
    const remaining = count - rows.length
    const [fallbackRows] = await pool.query(
      `SELECT word FROM words WHERE difficulty = ? AND category IN (${categoryPlaceholders}) ORDER BY RAND() LIMIT ?`,
      [difficulty, ...categories, remaining],
    )
    return [...rows.map((r) => r.word), ...fallbackRows.map((r) => r.word)]
  } catch (err) {
    console.error(`wordService: MySQL word fetch failed for difficulty="${difficulty}", falling back to built-in words:`, err)
    return fallbackWords(difficulty, count, excludeWords, categories)
  }
}

async function defaultWordChoices(difficulty, usedWords, categories) {
  if (difficulty === 'mixed') {
    const [easy, medium, hard] = await Promise.all([
      randomWords('easy', 2, usedWords, categories),
      randomWords('medium', 2, usedWords, categories),
      randomWords('hard', 1, usedWords, categories),
    ])
    return [...easy, ...medium, ...hard]
  }
  return randomWords(difficulty, 5, usedWords, categories)
}

// Swaps a couple of the default choices out for host-provided custom words (if
// any are left unused this game), so custom word packs surface regularly
// without crowding out the normal difficulty-tiered pool entirely. Custom
// words aren't tied to a category, so they're unaffected by category filtering.
function mixInCustomWords(choices, customWords, usedWords) {
  const available = shuffle(customWords.filter((w) => !usedWords.includes(w) && !choices.includes(w)))
  if (available.length === 0) return choices

  const replaceCount = Math.min(MAX_CUSTOM_WORDS_PER_TURN, available.length, choices.length)
  const result = [...choices]
  for (let i = 0; i < replaceCount; i++) {
    result[i] = available[i]
  }
  return shuffle(result)
}

export async function pickWordChoices(difficulty, usedWords = [], customWords = [], categories = WORD_CATEGORIES) {
  const safeCategories = Array.isArray(categories) && categories.length > 0 ? categories : WORD_CATEGORIES
  const choices = await defaultWordChoices(difficulty, usedWords, safeCategories)
  return mixInCustomWords(choices, customWords, usedWords)
}
