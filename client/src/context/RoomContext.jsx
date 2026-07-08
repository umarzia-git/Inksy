import { createContext, useReducer } from 'react'

const initialState = {
  roomCode: null,
  settings: null,
  players: [],
  self: null, // { playerId, nickname, avatar, isSpectator }
  canvasStrokes: [],
  initialGameSnapshot: null, // set when joining a room where a game is already in progress
  customWordCount: 0,
}

function roomReducer(state, action) {
  switch (action.type) {
    case 'SET_ROOM':
      return { ...state, roomCode: action.roomCode, settings: action.settings, customWordCount: action.customWordCount || 0 }
    case 'SET_PLAYERS':
      return { ...state, players: action.players }
    case 'SET_SELF':
      return { ...state, self: action.self }
    case 'SET_CANVAS_STROKES':
      return { ...state, canvasStrokes: action.strokes }
    case 'SET_GAME_SNAPSHOT':
      return { ...state, initialGameSnapshot: action.snapshot }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export const RoomContext = createContext({ state: initialState, dispatch: () => {} })

export function RoomProvider({ children }) {
  const [state, dispatch] = useReducer(roomReducer, initialState)
  return <RoomContext.Provider value={{ state, dispatch }}>{children}</RoomContext.Provider>
}
