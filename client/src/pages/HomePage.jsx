import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NicknameForm from '../components/home/NicknameForm.jsx'
import AvatarPicker from '../components/home/AvatarPicker.jsx'
import DoodleBackground from '../components/home/DoodleBackground.jsx'
import InksyLogo from '../components/home/InksyLogo.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

function HomePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useLocalStorage('inksy:profile', { nickname: '', avatar: '' })
  const [showQuickMatchNote, setShowQuickMatchNote] = useState(false)

  const canEnter = profile.nickname.trim().length > 0 && Boolean(profile.avatar)

  return (
    <div className="home-animated-bg relative flex min-h-screen flex-col items-center gap-8 px-4 py-12">
      <DoodleBackground />
      <InksyLogo />

      <div className="relative z-10 flex w-full max-w-md flex-col gap-6 rounded-3xl border border-white/[0.08] bg-white/[0.04] p-10 shadow-[0_0_50px_rgba(124,58,237,0.25)] backdrop-blur-[20px]">
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
            className="cursor-pointer rounded-lg bg-ink-coral px-6 py-3 font-heading text-lg text-ink-bg transition-all duration-200 ease-out enabled:hover:scale-[1.03] enabled:hover:brightness-110 enabled:hover:shadow-[0_0_25px_rgba(255,107,107,0.5)] disabled:opacity-40"
          >
            Create Room
          </button>
          <button
            type="button"
            disabled={!canEnter}
            onClick={() => navigate('/join')}
            className="cursor-pointer rounded-lg bg-ink-yellow px-6 py-3 font-heading text-lg text-ink-bg transition-all duration-200 ease-out enabled:hover:scale-[1.03] enabled:hover:brightness-110 enabled:hover:shadow-[0_0_25px_rgba(255,217,61,0.5)] disabled:opacity-40"
          >
            Join Room
          </button>
          <button
            type="button"
            disabled={!canEnter}
            onClick={() => setShowQuickMatchNote(true)}
            className="cursor-pointer rounded-lg bg-white/10 px-6 py-3 font-heading text-lg transition-all duration-200 ease-out enabled:hover:scale-[1.03] enabled:hover:brightness-125 disabled:opacity-40"
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
