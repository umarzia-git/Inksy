import { useState } from 'react'

const LETTERS = 'Inksy'.split('')
const LETTER_STAGGER_S = 0.18

function InksyLogo() {
  const [wobbling, setWobbling] = useState(false)

  function handleClick() {
    if (wobbling) return
    setWobbling(true)
    // Let the wobble animation (0.5s) play out before reloading.
    setTimeout(() => window.location.reload(), 550)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Inksy — tap to refresh"
      className={`relative z-10 flex cursor-pointer items-center gap-2 border-none bg-transparent ${wobbling ? 'logo-wobble' : 'logo-float'}`}
    >
      <span className="flex">
        {LETTERS.map((letter, index) => (
          <span
            key={index}
            className="logo-letter bg-linear-to-r from-ink-coral to-ink-yellow bg-clip-text font-hand text-7xl font-bold leading-none text-transparent sm:text-8xl"
            style={{
              // One continuous coral->yellow gradient across the word: each
              // letter shows its own slice of a 5x-wide gradient.
              backgroundSize: '500% 100%',
              backgroundPosition: `${(index / (LETTERS.length - 1)) * 100}% 0%`,
              animationDelay: `${index * LETTER_STAGGER_S}s`,
            }}
          >
            {letter}
          </span>
        ))}
      </span>
      <span className="logo-pencil text-4xl sm:text-5xl" style={{ animationDelay: `${LETTERS.length * LETTER_STAGGER_S + 0.1}s` }}>
        ✏️
      </span>
    </button>
  )
}

export default InksyLogo
