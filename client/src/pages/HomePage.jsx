import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NicknameForm from '../components/home/NicknameForm.jsx'
import AvatarPicker from '../components/home/AvatarPicker.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

function HomePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useLocalStorage('inksy:profile', { nickname: '', avatar: '' })
  const [showQuickMatchNote, setShowQuickMatchNote] = useState(false)

  const canEnter = profile.nickname.trim().length > 0 && Boolean(profile.avatar)

  return (
    <div className="flex min-h-screen flex-col items-center gap-8 px-4 py-12">
      <h1 className="font-heading text-5xl text-ink-coral">Inksy</h1>

      <div className="flex w-full max-w-md flex-col gap-6">
        <NicknameForm
          nickname={profile.nickname}
          onChange={(nickname) => setProfile((p) => ({ ...p, nickname }))}
        />
        <AvatarPicker
          selected={profile.avatar}
          onSelect={(avatar) => setProfile((p) => ({ ...p, avatar }))}
        />

        <div className="flex flex-col gap-3 pt-4">
          <button
            type="button"
            disabled={!canEnter}
            onClick={() => navigate('/create')}
            className="rounded-lg bg-ink-coral px-6 py-3 font-heading text-lg text-ink-bg transition disabled:opacity-40"
          >
            Create Room
          </button>
          <button
            type="button"
            disabled={!canEnter}
            onClick={() => navigate('/join')}
            className="rounded-lg bg-ink-yellow px-6 py-3 font-heading text-lg text-ink-bg transition disabled:opacity-40"
          >
            Join Room
          </button>
          <button
            type="button"
            disabled={!canEnter}
            onClick={() => setShowQuickMatchNote(true)}
            className="rounded-lg bg-white/10 px-6 py-3 font-heading text-lg transition disabled:opacity-40"
          >
            Quick Match
          </button>
          {showQuickMatchNote && (
            <p className="text-center text-sm text-ink-text/60">Quick Match is coming soon.</p>
          )}
          {!canEnter && (
            <p className="text-center text-sm text-ink-text/60">
              Pick a nickname and an avatar to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default HomePage
