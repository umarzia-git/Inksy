import { useParams } from 'react-router-dom'

function GamePage() {
  const { code } = useParams()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="font-heading text-3xl text-ink-coral">Game — {code}</h1>
      <p className="text-ink-text/70">Step 8 will add the 3-column game layout.</p>
    </div>
  )
}

export default GamePage
