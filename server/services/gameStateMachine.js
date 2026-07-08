import { Room } from '../models/Room.js'
import { SOCKET_EVENTS } from '../utils/socketEvents.js'
import { pickWordChoices } from './wordService.js'
import { calculateGuessPoints, calculateDrawerBonus } from './scoringService.js'
import { recordFinishedGame } from '../db/queries/gamesQueries.js'
import { setRoomTimer, setRoomInterval, clearRoomTimer, clearAllRoomTimers } from './timerService.js'
import { logger } from '../utils/logger.js'
import { WORD_SELECT_DURATION_MS, SCOREBOARD_DURATION_MS, HINT_1_FRACTION, HINT_2_FRACTION } from '../utils/gameConstants.js'

function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function blankPattern(word, revealedIndices) {
  return word.split('').map((ch, i) => (ch === ' ' || revealedIndices.includes(i) ? ch : null))
}

// Snapshot of the current turn for a player joining/rejoining mid-game, so their
// client can render the right phase instead of defaulting to 'lobby'. Never
// includes current_word — a reconnecting drawer gets that separately via a
// direct WORD_REVEAL/WORD_CHOICES emit, never through this broadcast-shaped payload.
export function buildGameSnapshot(room) {
  if (room.status === 'lobby' || room.status === 'game_end') return null

  const drawerId = room.game_state.current_drawer_player_id
  const drawer = room.players.find((p) => p.player_id === drawerId)
  const revealed = room.status === 'word_select' ? [] : blankPattern(room.game_state.current_word || '', room.game_state.revealed_indices)

  return {
    phase: room.status,
    round_number: room.game_state.round_number,
    total_rounds: room.game_state.total_rounds,
    drawer: drawer && { playerId: drawer.player_id, nickname: drawer.nickname, avatar: drawer.avatar },
    word_length: room.game_state.word_length,
    revealed,
    turn_ends_at: room.game_state.turn_ends_at,
    players: publicPlayers(room),
  }
}

// Every socket joins a private room keyed by its own playerId on connect (see
// roomHandlers.js), so a specific player can always be addressed directly —
// no need to enumerate every socket in the room and search for a match.
function emitToPlayer(io, playerId, event, payload) {
  io.to(playerId).emit(event, payload)
}

function publicPlayers(room) {
  return room.players.map((p) => ({
    player_id: p.player_id,
    nickname: p.nickname,
    avatar: p.avatar,
    score: p.score,
    is_host: p.is_host,
    connected: p.connected,
    status: p.status,
    is_spectator: p.is_spectator,
  }))
}

async function updateSocketSpectatorFlags(io, roomCode, playerIds, isSpectator) {
  if (playerIds.length === 0) return
  const sockets = await io.in(roomCode).fetchSockets()
  for (const s of sockets) {
    if (playerIds.includes(s.data.playerId)) s.data.isSpectator = isSpectator
  }
}

function startRoundTimerBroadcast(io, roomCode, turnEndsAt) {
  setRoomInterval(
    roomCode,
    'tick',
    () => {
      const secondsLeft = Math.max(0, Math.ceil((new Date(turnEndsAt).getTime() - Date.now()) / 1000))
      io.to(roomCode).emit(SOCKET_EVENTS.ROUND_TIMER, { secondsLeft })
      if (secondsLeft <= 0) clearRoomTimer(roomCode, 'tick')
    },
    1000,
  )
}

export async function startGame(io, roomCode) {
  const room = await Room.findOne({ room_code: roomCode })
  if (!room || (room.status !== 'lobby' && room.status !== 'game_end') || room.players.length < 2) return

  room.status = 'word_select'
  room.game_state.round_number = 1
  room.game_state.total_rounds = room.settings.rounds
  room.game_state.draw_order = shuffle(room.players.filter((p) => !p.is_spectator).map((p) => p.player_id))
  room.game_state.turn_index = 0
  await room.save()

  io.to(roomCode).emit(SOCKET_EVENTS.GAME_START, {})
  await startTurn(io, roomCode)
}

export async function startTurn(io, roomCode) {
  const room = await Room.findOne({ room_code: roomCode })
  if (!room) return

  const drawerId = room.game_state.draw_order[room.game_state.turn_index]
  const drawer = room.players.find((p) => p.player_id === drawerId)
  if (!drawer) return // drawer no longer in the room — full handling is Step 11's reconnection work

  room.status = 'word_select'
  room.game_state.current_drawer_player_id = drawerId
  room.game_state.word_choices = await pickWordChoices(room.settings.difficulty, room.game_state.used_words, room.custom_words)
  room.game_state.used_words = [...room.game_state.used_words, ...room.game_state.word_choices]
  room.game_state.current_word = null
  room.game_state.word_length = 0
  room.game_state.revealed_indices = []
  room.game_state.correct_guessers = []
  room.game_state.turn_started_at = new Date()
  room.game_state.turn_ends_at = new Date(Date.now() + WORD_SELECT_DURATION_MS)
  room.canvas_strokes = []
  for (const p of room.players) {
    if (p.is_spectator) continue
    p.status = p.player_id === drawerId ? 'choosing' : 'waiting'
  }
  await room.save()

  io.to(roomCode).emit(SOCKET_EVENTS.DRAW_CLEAR)
  io.to(roomCode).emit(SOCKET_EVENTS.ROUND_START, {
    phase: 'word_select',
    round_number: room.game_state.round_number,
    total_rounds: room.game_state.total_rounds,
    drawer: { playerId: drawer.player_id, nickname: drawer.nickname, avatar: drawer.avatar },
    word_length: 0,
    revealed: [],
    turn_ends_at: room.game_state.turn_ends_at,
    players: publicPlayers(room),
  })
  emitToPlayer(io, drawerId, SOCKET_EVENTS.WORD_CHOICES, { choices: room.game_state.word_choices })

  startRoundTimerBroadcast(io, roomCode, room.game_state.turn_ends_at)
  setRoomTimer(roomCode, 'phase', () => autoPickWord(io, roomCode), WORD_SELECT_DURATION_MS)
}

export async function pickWord(io, roomCode, playerId, word) {
  const room = await Room.findOne({ room_code: roomCode })
  if (!room || room.status !== 'word_select') return
  if (room.game_state.current_drawer_player_id !== playerId) return
  if (!room.game_state.word_choices.includes(word)) return

  clearRoomTimer(roomCode, 'phase')
  await beginDrawing(io, roomCode, word)
}

async function autoPickWord(io, roomCode) {
  const room = await Room.findOne({ room_code: roomCode })
  if (!room || room.status !== 'word_select') return
  const middle = room.game_state.word_choices[Math.floor(room.game_state.word_choices.length / 2)]
  await beginDrawing(io, roomCode, middle)
}

async function beginDrawing(io, roomCode, word) {
  const room = await Room.findOne({ room_code: roomCode })
  if (!room) return

  const drawTimeMs = room.settings.draw_time_sec * 1000
  room.status = 'drawing'
  room.game_state.current_word = word
  room.game_state.word_length = word.length
  room.game_state.revealed_indices = []
  room.game_state.turn_started_at = new Date()
  room.game_state.turn_ends_at = new Date(Date.now() + drawTimeMs)
  for (const p of room.players) {
    if (p.is_spectator) continue
    p.status = p.player_id === room.game_state.current_drawer_player_id ? 'drawing' : 'waiting'
  }
  await room.save()

  const drawer = room.players.find((p) => p.player_id === room.game_state.current_drawer_player_id)
  io.to(roomCode).emit(SOCKET_EVENTS.ROUND_START, {
    phase: 'drawing',
    round_number: room.game_state.round_number,
    total_rounds: room.game_state.total_rounds,
    drawer: { playerId: drawer.player_id, nickname: drawer.nickname, avatar: drawer.avatar },
    word_length: word.length,
    revealed: blankPattern(word, []),
    turn_ends_at: room.game_state.turn_ends_at,
    players: publicPlayers(room),
  })
  emitToPlayer(io, drawer.player_id, SOCKET_EVENTS.WORD_REVEAL, { word })

  startRoundTimerBroadcast(io, roomCode, room.game_state.turn_ends_at)
  setRoomTimer(roomCode, 'hint1', () => revealHint(io, roomCode), Math.round(drawTimeMs * HINT_1_FRACTION))
  setRoomTimer(roomCode, 'hint2', () => revealHint(io, roomCode), Math.round(drawTimeMs * HINT_2_FRACTION))
  setRoomTimer(roomCode, 'phase', () => endTurn(io, roomCode, 'timeout'), drawTimeMs)
}

async function revealHint(io, roomCode) {
  const room = await Room.findOne({ room_code: roomCode })
  if (!room || room.status !== 'drawing') return

  const word = room.game_state.current_word
  const hidden = []
  for (let i = 0; i < word.length; i++) {
    if (word[i] !== ' ' && !room.game_state.revealed_indices.includes(i)) hidden.push(i)
  }
  if (hidden.length === 0) return

  const index = hidden[Math.floor(Math.random() * hidden.length)]
  room.game_state.revealed_indices.push(index)
  await room.save()

  io.to(roomCode).emit(SOCKET_EVENTS.WORD_HINT, { revealed: blankPattern(word, room.game_state.revealed_indices) })
}

export async function submitGuess(io, roomCode, playerId, message) {
  const room = await Room.findOne({ room_code: roomCode })
  if (!room) return
  const player = room.players.find((p) => p.player_id === playerId)
  if (!player || player.is_spectator) return

  const isDrawer = playerId === room.game_state.current_drawer_player_id
  const alreadyGuessed = room.game_state.correct_guessers.includes(playerId)
  const isCorrectGuess =
    room.status === 'drawing' &&
    !isDrawer &&
    !alreadyGuessed &&
    message.trim().toLowerCase() === (room.game_state.current_word || '').toLowerCase()

  if (isCorrectGuess) {
    const rank = room.game_state.correct_guessers.length + 1
    const points = calculateGuessPoints(rank)
    player.score += points
    player.status = 'guessed'
    room.game_state.correct_guessers.push(playerId)
    room.chat_log.push({ player_id: playerId, nickname: player.nickname, message: 'guessed it!', is_correct_guess: true })
    await room.save()

    io.to(roomCode).emit(SOCKET_EVENTS.GUESS_CORRECT, {
      playerId,
      nickname: player.nickname,
      points,
      players: publicPlayers(room),
    })

    const nonDrawerCount = room.players.filter(
      (p) => p.player_id !== room.game_state.current_drawer_player_id && p.connected && !p.is_spectator,
    ).length
    if (room.game_state.correct_guessers.length >= nonDrawerCount) {
      await endTurn(io, roomCode, 'all_guessed')
    }
    return
  }

  room.chat_log.push({ player_id: playerId, nickname: player.nickname, message, is_correct_guess: false })
  await room.save()
  io.to(roomCode).emit(SOCKET_EVENTS.GUESS_WRONG, { playerId, nickname: player.nickname, message })
}

export async function endTurn(io, roomCode, reason) {
  clearRoomTimer(roomCode, 'phase')
  clearRoomTimer(roomCode, 'hint1')
  clearRoomTimer(roomCode, 'hint2')
  clearRoomTimer(roomCode, 'tick')

  const room = await Room.findOne({ room_code: roomCode })
  if (!room) return

  const drawer = room.players.find((p) => p.player_id === room.game_state.current_drawer_player_id)
  if (drawer && room.game_state.current_word) {
    drawer.score += calculateDrawerBonus(room.game_state.correct_guessers.length, reason === 'all_guessed')
  }
  room.status = 'round_end'
  await room.save()

  io.to(roomCode).emit(SOCKET_EVENTS.ROUND_END, {
    reason,
    word: room.game_state.current_word,
    players: publicPlayers(room),
  })

  setRoomTimer(roomCode, 'scoreboard', () => advanceTurn(io, roomCode), SCOREBOARD_DURATION_MS)
}

async function advanceTurn(io, roomCode) {
  const room = await Room.findOne({ room_code: roomCode })
  if (!room) return

  const nextTurnIndex = room.game_state.turn_index + 1
  if (nextTurnIndex < room.game_state.draw_order.length) {
    room.game_state.turn_index = nextTurnIndex
    await room.save()
    await startTurn(io, roomCode)
    return
  }

  const nextRound = room.game_state.round_number + 1
  if (nextRound <= room.game_state.total_rounds) {
    const spectators = room.players.filter((p) => p.is_spectator)
    for (const p of spectators) {
      p.is_spectator = false
      p.status = 'waiting'
    }
    if (spectators.length > 0) {
      room.game_state.draw_order = [...room.game_state.draw_order, ...spectators.map((p) => p.player_id)]
      await updateSocketSpectatorFlags(io, roomCode, spectators.map((p) => p.player_id), false)
    }

    room.game_state.round_number = nextRound
    room.game_state.turn_index = 0
    await room.save()
    await startTurn(io, roomCode)
    return
  }

  await endGame(io, roomCode)
}

async function endGame(io, roomCode) {
  const room = await Room.findOne({ room_code: roomCode })
  if (!room) return

  clearAllRoomTimers(roomCode)
  room.status = 'game_end'
  await room.save()

  const winner = [...room.players].sort((a, b) => b.score - a.score)[0]

  io.to(roomCode).emit(SOCKET_EVENTS.GAME_END, {
    players: publicPlayers(room),
    winner: winner && { playerId: winner.player_id, nickname: winner.nickname, avatar: winner.avatar, score: winner.score },
  })

  try {
    await recordFinishedGame({
      roomCode,
      startedAt: room.created_at,
      endedAt: new Date(),
      winnerNickname: winner?.nickname || null,
      players: room.players,
    })
  } catch (err) {
    logger.error('failed to persist finished game to MySQL:', err)
  }
}

export async function rematch(io, roomCode) {
  const room = await Room.findOne({ room_code: roomCode })
  if (!room || room.status !== 'game_end') return

  clearAllRoomTimers(roomCode)
  room.canvas_strokes = []
  room.chat_log = []
  for (const p of room.players) {
    p.score = 0
    p.status = 'waiting'
    p.is_spectator = false
  }
  room.status = 'lobby'
  await room.save()

  await startGame(io, roomCode)
}
