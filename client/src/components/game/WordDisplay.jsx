function WordDisplay({ pattern }) {
  return (
    <div className="flex items-center justify-center gap-2 border-b border-white/10 py-3">
      {pattern.map((char, i) => (
        <span
          key={i}
          className="flex h-8 w-6 items-center justify-center border-b-2 border-ink-text/40 font-heading text-lg uppercase"
        >
          {char || ''}
        </span>
      ))}
    </div>
  )
}

export default WordDisplay
