function NicknameForm({ nickname, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="nickname" className="text-sm font-semibold uppercase tracking-wide text-ink-text/60">
        Nickname
      </label>
      <input
        id="nickname"
        type="text"
        value={nickname}
        onChange={(e) => onChange(e.target.value.slice(0, 20))}
        placeholder="Enter a nickname"
        maxLength={20}
        className="rounded-lg bg-white/5 px-4 py-3 text-ink-text outline-none focus:ring-2 focus:ring-ink-coral"
      />
    </div>
  )
}

export default NicknameForm
