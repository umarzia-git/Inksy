import { useState } from 'react'

function GuessInput({ onSubmit, disabled = false, placeholder = 'Type your guess…' }) {
  const [value, setValue] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSubmit?.(trimmed)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={200}
        className="w-full rounded-lg bg-white/5 px-4 py-2 text-ink-text outline-none focus:ring-2 focus:ring-ink-coral disabled:opacity-50"
      />
    </form>
  )
}

export default GuessInput
