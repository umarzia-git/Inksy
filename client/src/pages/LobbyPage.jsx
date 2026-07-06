import { useParams } from 'react-router-dom'

function LobbyPage() {
  const { code } = useParams()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="font-heading text-3xl text-ink-coral">Lobby — {code}</h1>
      <p className="text-ink-text/70">Step 7 will add live player list and start button.</p>
    </div>
  )
}

export default LobbyPage
