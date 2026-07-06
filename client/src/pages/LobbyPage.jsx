import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSocket } from '../hooks/useSocket.js'
import { useRoom } from '../hooks/useRoom.js'
import RoomCodeShare from '../components/lobby/RoomCodeShare.jsx'
import PlayerList from '../components/lobby/PlayerList.jsx'

function LobbyPage() {
  const { code } = useParams()
  const { socket } = useSocket()
  const { state, dispatch } = useRoom()
  const [startNote, setStartNote] = useState(false)

  useEffect(() => {
    function handleRoomUpdate({ room }) {
      dispatch({ type: 'SET_PLAYERS', players: room.players })
    }

    socket.on('player:joined', handleRoomUpdate)
    socket.on('player:left', handleRoomUpdate)

    return () => {
      socket.off('player:joined', handleRoomUpdate)
      socket.off('player:left', handleRoomUpdate)
    }
  }, [socket, dispatch])

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
  const canStart = isHost && state.players.length >= 2

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 px-4 py-12">
      <h1 className="font-heading text-3xl text-ink-coral">Lobby</h1>
      <RoomCodeShare roomCode={code} />

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
            onClick={() => setStartNote(true)}
            className="w-full rounded-lg bg-ink-coral px-6 py-3 font-heading text-lg text-ink-bg transition disabled:opacity-40"
          >
            Start Game
          </button>
        ) : (
          <p className="text-ink-text/70">Waiting for the host to start the game…</p>
        )}
        {isHost && !canStart && <p className="text-sm text-ink-text/60">Need at least 2 players to start.</p>}
        {startNote && <p className="text-sm text-ink-text/60">Game logic arrives in Step 10.</p>}
      </div>
    </div>
  )
}

export default LobbyPage
