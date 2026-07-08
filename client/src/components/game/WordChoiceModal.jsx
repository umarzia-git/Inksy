function WordChoiceModal({ choices, secondsLeft, onPick }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-ink-bg/90 p-4 text-center">
      <p className="font-heading text-lg text-ink-yellow">Pick a word to draw ({secondsLeft ?? 15}s)</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {choices.map((word) => (
          <button
            key={word}
            type="button"
            onClick={() => onPick(word)}
            className="rounded-lg bg-ink-coral px-6 py-3 font-heading text-lg capitalize text-ink-bg transition hover:brightness-110"
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  )
}

export default WordChoiceModal
