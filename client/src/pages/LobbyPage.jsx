import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket.js'
import { useRoom } from '../hooks/useRoom.js'
import { SOCKET_EVENTS } from '../utils/socketEvents.js'
import RoomCodeShare from '../components/lobby/RoomCodeShare.jsx'
import PlayerList from '../components/lobby/PlayerList.jsx'
import { WORD_CATEGORIES } from '../utils/constants.js'

function LobbyPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { socket } = useSocket()
  const { state, dispatch } = useRoom()

  useEffect(() => {
    function handleRoomUpdate({ room }) {
      dispatch({ type: 'SET_PLAYERS', players: room.players })
    }
    function handleGameStart() {
      navigate(`/room/${code}/game`)
    }

    socket.on('player:joined', handleRoomUpdate)
    socket.on('player:left', handleRoomUpdate)
    socket.on(SOCKET_EVENTS.GAME_START, handleGameStart)

    // Listeners above only catch broadcasts that arrive after this point — if a
    // player joined in the moment between this client's own join/create and
    // this effect running, that broadcast is already missed. Pulling the
    // current player list directly closes that gap.
    socket.emit('room:sync', { roomCode: code }, (res) => {
      if (res?.room) dispatch({ type: 'SET_PLAYERS', players: res.room.players })
    })

    return () => {
      socket.off('player:joined', handleRoomUpdate)
      socket.off('player:left', handleRoomUpdate)
      socket.off(SOCKET_EVENTS.GAME_START, handleGameStart)
    }
  }, [socket, dispatch, navigate, code])

  if (!state.self || state.roomCode !== code) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-ink-text/70">Your session for this room isn't active.</p>
        <Link to="/" className="text-ink-yellow underline">
          Back to home
        </Link>
      </div>
    )
  }

  const isHost = state.self.playerId === state.players.find((p) => p.is_host)?.player_id
  const connectedPlayerCount = state.players.filter((p) => p.connected && !p.is_spectator).length
  const canStart = isHost && connectedPlayerCount >= 2

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 px-4 py-12">
      <h1 className="font-heading text-3xl text-ink-coral">Lobby</h1>
      <RoomCodeShare roomCode={code} />

      {state.settings && (
        <div className="flex flex-wrap justify-center gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-text/70">
            {state.settings.rounds} Rounds
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-text/70">
            {state.settings.draw_time_sec}s Draw Time
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-text/70 capitalize">
            {state.settings.difficulty}
          </span>
          {state.settings.categories && (
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-text/70">
              {state.settings.categories.length === WORD_CATEGORIES.length
                ? 'All Categories'
                : `${state.settings.categories.length} ${state.settings.categories.length === 1 ? 'Category' : 'Categories'}`}
            </span>
          )}
        </div>
      )}

      {state.customWordCount > 0 && (
        <p className="text-sm text-ink-yellow">🎨 {state.customWordCount} custom words added by the host</p>
      )}

      <div className="w-full max-w-md">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-text/60">
          Players ({state.players.length})
        </p>
        <PlayerList players={state.players} selfPlayerId={state.self.playerId} />
      </div>

      <div className="flex w-full max-w-md flex-col items-center gap-2">
        {isHost ? (
          <button
            type="button"
            disabled={!canStart}
            onClick={() => socket.emit(SOCKET_EVENTS.GAME_START, { roomCode: code })}
            className={`w-full rounded-lg px-6 py-3 font-heading text-lg transition-all duration-200 ${
              canStart
                ? 'btn-glow-pulse cursor-pointer bg-ink-coral text-ink-bg hover:scale-[1.02] hover:brightness-110'
                : 'cursor-not-allowed bg-white/10 text-ink-text/40'
            }`}
          >
            {canStart ? 'Start Game' : 'Waiting for players…'}
          </button>
        ) : (
          <p className="text-ink-text/70">Waiting for the host to start the game…</p>
        )}
      </div>
    </div>
  )
}

export default LobbyPage
