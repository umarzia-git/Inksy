import { useCallback, useEffect, useReducer } from 'react'
import { SOCKET_EVENTS } from '../utils/socketEvents.js'

const initialState = {
  phase: 'lobby',
  roundNumber: 0,
  totalRounds: 0,
  drawer: null,
  wordPattern: [],
  secondsLeft: null,
  wordChoices: null, // only set on the drawer's own client
  ownWord: null, // only set on the drawer's own client
  hasGuessedCorrectly: false,
  lastRoundWord: null,
  winner: null,
  chatMessages: [],
  reactions: [],
}

function reducer(state, action) {
  switch (action.type) {
    case 'ROUND_START':
      return {
        ...state,
        phase: action.payload.phase,
        roundNumber: action.payload.round_number,
        totalRounds: action.payload.total_rounds,
        drawer: action.payload.drawer,
        wordPattern: action.payload.revealed,
        secondsLeft: null,
        hasGuessedCorrectly: false,
        lastRoundWord: null,
        ...(action.payload.phase === 'word_select' ? {} : { wordChoices: null }),
      }
    case 'WORD_CHOICES':
      return { ...state, wordChoices: action.payload.choices }
    case 'WORD_REVEAL':
      return { ...state, ownWord: action.payload.word, wordChoices: null }
    case 'WORD_HINT':
      return { ...state, wordPattern: action.payload.revealed }
    case 'ROUND_TIMER':
      return { ...state, secondsLeft: action.payload.secondsLeft }
    case 'GUESS_RESULT': {
      const entry = {
        id: `${Date.now()}-${Math.random()}`,
        nickname: action.payload.nickname,
        message: action.correct ? 'guessed it!' : action.payload.message,
        isCorrect: action.correct,
      }
      return {
        ...state,
        chatMessages: [...state.chatMessages, entry],
        hasGuessedCorrectly: state.hasGuessedCorrectly || (action.correct && action.payload.playerId === action.selfId),
      }
    }
    case 'ROUND_END':
      return { ...state, phase: 'round_end', lastRoundWord: action.payload.word, ownWord: null, wordChoices: null }
    case 'GAME_END':
      return { ...state, phase: 'game_end', winner: action.payload.winner }
    case 'REACTION':
      return { ...state, reactions: [...state.reactions, { id: action.id, emoji: action.payload.emoji }] }
    case 'REACTION_EXPIRE':
      return { ...state, reactions: state.reactions.filter((r) => r.id !== action.id) }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export function useGameSocket({ socket, roomCode, playerId, dispatchRoom }) {
  const [state, localDispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (!socket) return

    function handleGameStart() {
      localDispatch({ type: 'RESET' })
    }
    function handleRoundStart(payload) {
      localDispatch({ type: 'ROUND_START', payload })
      dispatchRoom({ type: 'SET_PLAYERS', players: payload.players })
    }
    function handleWordChoices(payload) {
      localDispatch({ type: 'WORD_CHOICES', payload })
    }
    function handleWordReveal(payload) {
      localDispatch({ type: 'WORD_REVEAL', payload })
    }
    function handleWordHint(payload) {
      localDispatch({ type: 'WORD_HINT', payload })
    }
    function handleRoundTimer(payload) {
      localDispatch({ type: 'ROUND_TIMER', payload })
    }
    function handleGuessCorrect(payload) {
      localDispatch({ type: 'GUESS_RESULT', payload, correct: true, selfId: playerId })
      dispatchRoom({ type: 'SET_PLAYERS', players: payload.players })
    }
    function handleGuessWrong(payload) {
      localDispatch({ type: 'GUESS_RESULT', payload, correct: false, selfId: playerId })
    }
    function handleRoundEnd(payload) {
      localDispatch({ type: 'ROUND_END', payload })
      dispatchRoom({ type: 'SET_PLAYERS', players: payload.players })
    }
    function handleGameEnd(payload) {
      localDispatch({ type: 'GAME_END', payload })
      dispatchRoom({ type: 'SET_PLAYERS', players: payload.players })
    }
    function handleReaction(payload) {
      const id = `${Date.now()}-${Math.random()}`
      localDispatch({ type: 'REACTION', payload, id })
      setTimeout(() => localDispatch({ type: 'REACTION_EXPIRE', id }), 2500)
    }

    socket.on(SOCKET_EVENTS.GAME_START, handleGameStart)
    socket.on(SOCKET_EVENTS.ROUND_START, handleRoundStart)
    socket.on(SOCKET_EVENTS.WORD_CHOICES, handleWordChoices)
    socket.on(SOCKET_EVENTS.WORD_REVEAL, handleWordReveal)
    socket.on(SOCKET_EVENTS.WORD_HINT, handleWordHint)
    socket.on(SOCKET_EVENTS.ROUND_TIMER, handleRoundTimer)
    socket.on(SOCKET_EVENTS.GUESS_CORRECT, handleGuessCorrect)
    socket.on(SOCKET_EVENTS.GUESS_WRONG, handleGuessWrong)
    socket.on(SOCKET_EVENTS.ROUND_END, handleRoundEnd)
    socket.on(SOCKET_EVENTS.GAME_END, handleGameEnd)
    socket.on(SOCKET_EVENTS.REACTION_SEND, handleReaction)

    return () => {
      socket.off(SOCKET_EVENTS.GAME_START, handleGameStart)
      socket.off(SOCKET_EVENTS.ROUND_START, handleRoundStart)
      socket.off(SOCKET_EVENTS.WORD_CHOICES, handleWordChoices)
      socket.off(SOCKET_EVENTS.WORD_REVEAL, handleWordReveal)
      socket.off(SOCKET_EVENTS.WORD_HINT, handleWordHint)
      socket.off(SOCKET_EVENTS.ROUND_TIMER, handleRoundTimer)
      socket.off(SOCKET_EVENTS.GUESS_CORRECT, handleGuessCorrect)
      socket.off(SOCKET_EVENTS.GUESS_WRONG, handleGuessWrong)
      socket.off(SOCKET_EVENTS.ROUND_END, handleRoundEnd)
      socket.off(SOCKET_EVENTS.GAME_END, handleGameEnd)
      socket.off(SOCKET_EVENTS.REACTION_SEND, handleReaction)
    }
  }, [socket, dispatchRoom, playerId])

  const pickWord = useCallback((word) => socket?.emit('word:pick', { roomCode, word }), [socket, roomCode])
  const submitGuess = useCallback(
    (message) => socket?.emit(SOCKET_EVENTS.GUESS_SUBMIT, { roomCode, message }),
    [socket, roomCode],
  )
  const sendReaction = useCallback(
    (emoji) => socket?.emit(SOCKET_EVENTS.REACTION_SEND, { roomCode, emoji }),
    [socket, roomCode],
  )
  const startGame = useCallback(() => socket?.emit(SOCKET_EVENTS.GAME_START, { roomCode }), [socket, roomCode])

  return { ...state, pickWord, submitGuess, sendReaction, startGame }
}
