function WordDisplay({ pattern }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 border-b border-white/10 py-3">
      {pattern.map((char, i) =>
        char === ' ' ? (
          <span key={i} className="w-3" />
        ) : (
          <span
            // Remounting on the blank->filled transition retriggers the pop
            // animation exactly once, right when the letter is revealed.
            key={`${i}-${char ? 'filled' : 'blank'}`}
            className={`flex h-9 w-8 items-center justify-center rounded-md border-2 font-heading text-lg uppercase ${
              char ? 'letter-pop border-ink-bg bg-ink-canvas text-ink-bg' : 'border-white/25 bg-white/5'
            }`}
          >
            {char || ''}
          </span>
        ),
      )}
    </div>
  )
}

export default WordDisplay
