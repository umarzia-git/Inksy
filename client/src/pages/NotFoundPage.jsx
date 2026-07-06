import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="font-heading text-3xl text-ink-coral">Page not found</h1>
      <Link to="/" className="text-ink-yellow underline">
        Back to home
      </Link>
    </div>
  )
}

export default NotFoundPage
