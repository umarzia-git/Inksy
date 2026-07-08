import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { useSocket } from '../hooks/useSocket.js'
import { useRoom } from '../hooks/useRoom.js'

function JoinRoomPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [profile] = useLocalStorage('inksy:profile', { nickname: '', avatar: '' })
  const { socket } = useSocket()
  const { dispatch } = useRoom()

  const [roomCode, setRoomCode] = useState((searchParams.get('code') || '').replace(/\D/g, '').slice(0, 6))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!profile.nickname || !profile.avatar) navigate('/')
  }, [profile, navigate])

  function handleJoin() {
    setIsSubmitting(true)
    setError('')

    socket
      .timeout(5000)
      .emit('room:join', { roomCode: roomCode.trim(), nickname: profile.nickname, avatar: profile.avatar }, (ackErr, response) => {
        setIsSubmitting(false)
        if (ackErr) {
          setError('Server did not respond, please try again.')
          return
        }
        if (response.error) {
          setError(response.error)
          return
        }
        dispatch({
          type: 'SET_ROOM',
          roomCode: response.room.room_code,
          settings: response.room.settings,
          customWordCount: response.room.custom_word_count,
        })
        dispatch({ type: 'SET_PLAYERS', players: response.room.players })
        dispatch({ type: 'SET_SELF', self: { playerId: response.playerId, ...profile, isSpectator: response.isSpectator } })
        dispatch({ type: 'SET_CANVAS_STROKES', strokes: response.room.canvas_strokes || [] })

        if (response.room.status !== 'lobby') {
          dispatch({ type: 'SET_GAME_SNAPSHOT', snapshot: response.game_snapshot })
          navigate(`/room/${response.room.room_code}/game`)
        } else {
          navigate(`/room/${response.room.room_code}/lobby`)
        }
      })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12">
      <h1 className="font-heading text-4xl text-ink-yellow">Join Room</h1>

      <div className="flex w-full max-w-md flex-col gap-4">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="482913"
          className="rounded-lg bg-white/5 px-4 py-3 text-center font-heading text-xl tracking-widest text-ink-text outline-none focus:ring-2 focus:ring-ink-coral"
        />

        {error && <p className="text-center text-sm text-ink-coral">{error}</p>}

        <button
          type="button"
          disabled={isSubmitting || !roomCode.trim()}
          onClick={handleJoin}
          className="rounded-lg bg-ink-yellow px-6 py-3 font-heading text-lg text-ink-bg transition disabled:opacity-40"
        >
          {isSubmitting ? 'Joining…' : 'Join Room'}
        </button>
      </div>
    </div>
  )
}

export default JoinRoomPage
