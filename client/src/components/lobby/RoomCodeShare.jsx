import { useState } from 'react'

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
      <p className="font-heading text-3xl tracking-widest text-ink-coral">{roomCode}</p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => copy(roomCode, 'code')}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
        >
          {copiedLabel === 'code' ? 'Copied!' : 'Copy code'}
        </button>
        <button
          type="button"
          onClick={() => copy(joinUrl, 'link')}
          className="rounded-lg bg-white/10 px-4 py-2 text-sm transition hover:bg-white/20"
        >
          {copiedLabel === 'link' ? 'Copied!' : 'Share link'}
        </button>
      </div>
    </div>
  )
}

export default RoomCodeShare
