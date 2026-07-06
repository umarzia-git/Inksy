function GuessInput({ disabled = true, placeholder = 'Type your guess…' }) {
  return (
    <input
      type="text"
      disabled={disabled}
      placeholder={placeholder}
      className="w-full rounded-lg bg-white/5 px-4 py-2 text-ink-text outline-none focus:ring-2 focus:ring-ink-coral disabled:opacity-50"
    />
  )
}

export default GuessInput
