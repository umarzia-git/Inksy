import { useState } from 'react'

function ClipboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
    </svg>
  )
}

function RoomCodeShare({ roomCode }) {
  const [copiedLabel, setCopiedLabel] = useState('')

  async function copy(text, label) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedLabel(label)
      setTimeout(() => setCopiedLabel(''), 2000)
    } catch {
      // clipboard API unavailable — nothing else to fall back to here
    }
  }

  const joinUrl = `${window.location.origin}/join?code=${roomCode}`

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-2xl border border-ink-coral/30 bg-white/5 px-8 py-4 shadow-[0_0_30px_rgba(255,107,107,0.15)]">
        <p className="font-mono text-4xl font-bold tracking-[0.2em] text-ink-coral">{roomCode}</p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => copy(roomCode, 'code')}
          className="flex h-11 cursor-pointer items-center gap-1.5 rounded-lg bg-white/10 px-4 text-sm transition hover:bg-white/20"
        >
          <ClipboardIcon />
          {copiedLabel === 'code' ? 'Copied!' : 'Copy code'}
        </button>
        <button
          type="button"
          onClick={() => copy(joinUrl, 'link')}
          className="flex h-11 cursor-pointer items-center gap-1.5 rounded-lg bg-white/10 px-4 text-sm transition hover:bg-white/20"
        >
          <ClipboardIcon />
          {copiedLabel === 'link' ? 'Copied!' : 'Share link'}
        </button>
      </div>
    </div>
  )
}

export default RoomCodeShare
