import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { useSocket } from '../hooks/useSocket.js'
import { useRoom } from '../hooks/useRoom.js'

const ROUND_OPTIONS = [3, 5, 7]
const DRAW_TIME_OPTIONS = [60, 90, 120]
const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard', 'mixed']

function CreateRoomPage() {
  const navigate = useNavigate()
  const [profile] = useLocalStorage('inksy:profile', { nickname: '', avatar: '' })
  const { socket } = useSocket()
  const { dispatch } = useRoom()

  const [rounds, setRounds] = useState(3)
  const [drawTimeSec, setDrawTimeSec] = useState(90)
  const [difficulty, setDifficulty] = useState('mixed')
  const [customWordsInput, setCustomWordsInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!profile.nickname || !profile.avatar) navigate('/')
  }, [profile, navigate])

  const customWords = customWordsInput
    .split(',')
    .map((w) => w.trim())
    .filter((w) => w.length > 0)
  const hasCustomWordsInput = customWordsInput.trim().length > 0
  const customWordsTooFew = hasCustomWordsInput && customWords.length < 10

  function handleCreate() {
    if (customWordsTooFew) {
      setError(`Add at least 10 custom words (you have ${customWords.length}), or clear the field to skip custom words.`)
      return
    }

    setIsSubmitting(true)
    setError('')

    socket
      .timeout(5000)
      .emit(
        'room:create',
        {
          nickname: profile.nickname,
          avatar: profile.avatar,
          settings: { rounds, draw_time_sec: drawTimeSec, difficulty },
          customWords,
        },
        (ackErr, response) => {
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
          dispatch({ type: 'SET_SELF', self: { playerId: response.playerId, ...profile } })
          dispatch({ type: 'SET_CANVAS_STROKES', strokes: response.room.canvas_strokes || [] })
          navigate(`/room/${response.room.room_code}/lobby`)
        },
      )
  }

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 px-4 py-12">
      <h1 className="font-heading text-4xl text-ink-yellow">Create Room</h1>

      <div className="flex w-full max-w-md flex-col gap-6">
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold uppercase tracking-wide text-ink-text/60">Rounds</legend>
          <div className="flex gap-2">
            {ROUND_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setRounds(option)}
                className={`flex h-11 flex-1 items-center justify-center rounded-lg font-heading transition ${
                  rounds === option ? 'bg-ink-coral text-ink-bg' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold uppercase tracking-wide text-ink-text/60">Draw time (sec)</legend>
          <div className="flex gap-2">
            {DRAW_TIME_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDrawTimeSec(option)}
                className={`flex h-11 flex-1 items-center justify-center rounded-lg font-heading transition ${
                  drawTimeSec === option ? 'bg-ink-coral text-ink-bg' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold uppercase tracking-wide text-ink-text/60">Difficulty</legend>
          <div className="flex gap-2">
            {DIFFICULTY_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setDifficulty(option)}
                className={`flex h-11 flex-1 items-center justify-center rounded-lg font-heading capitalize transition ${
                  difficulty === option ? 'bg-ink-coral text-ink-bg' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold uppercase tracking-wide text-ink-text/60">
            Custom words (optional)
          </legend>
          <textarea
            value={customWordsInput}
            onChange={(e) => setCustomWordsInput(e.target.value)}
            placeholder="pizza, robot, sunset, guitar… (comma separated, min 10 to enable)"
            rows={3}
            className="rounded-lg bg-white/5 px-4 py-3 text-ink-text outline-none focus:ring-2 focus:ring-ink-coral"
          />
          <p className={`text-xs ${customWordsTooFew ? 'text-ink-coral' : 'text-ink-text/50'}`}>
            {hasCustomWordsInput
              ? `${customWords.length} word${customWords.length === 1 ? '' : 's'} — these get mixed into the pool during the game.`
              : 'Leave blank to use only the default word pool.'}
          </p>
        </fieldset>

        {error && <p className="text-center text-sm text-ink-coral">{error}</p>}

        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleCreate}
          className="rounded-lg bg-ink-coral px-6 py-3 font-heading text-lg text-ink-bg transition disabled:opacity-40"
        >
          {isSubmitting ? 'Creating…' : 'Create Room'}
        </button>
      </div>
    </div>
  )
}

export default CreateRoomPage
