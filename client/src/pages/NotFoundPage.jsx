import { Link } from 'react-router-dom'

function ConfusedFaceDoodle() {
  // Staggered per-path delays so the face draws itself in stroke by stroke,
  // like it's being hand-sketched — then settles into a gentle wobble.
  const paths = [
    { d: 'M100 30c38 0 66 30 66 66s-28 66-66 66-66-30-66-66 28-66 66-66z', delay: 0 }, // head
    { d: 'M64 84l16-8', delay: 0.5 }, // left eyebrow, angled down — furrowed/uncertain
    { d: 'M71 90a5 5 0 1 1 0 .1z', delay: 0.65 }, // left eye
    { d: 'M116 72c7-9 21-9 27 1', delay: 0.8 }, // right eyebrow, raised high — asymmetric, surprised
    { d: 'M130 90a6 6 0 1 1 0 .1z', delay: 0.95 }, // right eye, wider open
    { d: 'M72 124q8-12 16 0t16 0t16 0', delay: 1.1 }, // zigzag squiggle mouth — uncertain, not a smile
    { d: 'M28 45l9 7M34 38l6 9', delay: 1.3 }, // eraser smudge marks, off to the side
    { d: 'M164 145l9-5M170 156l7-6', delay: 1.35 },
  ]

  return (
    <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="h-48 w-48 text-ink-coral sm:h-56 sm:w-56">
      <g className="notfound-face-wobble">
        {paths.map((p, i) => (
          <path key={i} d={p.d} pathLength="1" className="notfound-face-path" style={{ animationDelay: `${p.delay}s` }} />
        ))}
        <text x="150" y="55" className="fill-ink-yellow font-heading" fontSize="28" stroke="none">
          ?
        </text>
        <text x="35" y="115" className="fill-ink-yellow font-heading" fontSize="20" stroke="none" opacity="0.7">
          ?
        </text>
      </g>
    </svg>
  )
}

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <ConfusedFaceDoodle />
      <h1 className="font-heading text-3xl text-ink-coral">Oops! This page got erased.</h1>
      <Link
        to="/"
        className="cursor-pointer rounded-lg bg-ink-coral px-6 py-3 font-heading text-lg text-ink-bg transition-all duration-200 ease-out hover:scale-[1.03] hover:brightness-110 hover:shadow-[0_0_25px_rgba(255,107,107,0.5)]"
      >
        Back to Home
      </Link>
    </div>
  )
}

export default NotFoundPage
