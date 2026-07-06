const DEMO_MESSAGES = [
  { id: 1, nickname: 'System', message: 'Game starting soon…', isSystem: true },
]

function ChatPanel({ messages = DEMO_MESSAGES }) {
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {messages.map((m) => (
        <li key={m.id} className={m.isSystem ? 'italic text-ink-text/50' : ''}>
          {!m.isSystem && <span className="font-semibold">{m.nickname}: </span>}
          {m.message}
        </li>
      ))}
    </ul>
  )
}

export default ChatPanel
