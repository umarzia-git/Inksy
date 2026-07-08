import CountdownTimer from '../common/CountdownTimer.jsx'

function TopBar({ roomCode, roundNumber, totalRounds, drawerName, drawerAvatar, secondsLeft, totalSeconds, muted, onToggleMute }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-ink-bg/80 px-4 py-3">
      <div>
        <p className="font-heading text-sm text-ink-text/70">
          Round {roundNumber}/{totalRounds}
        </p>
        <p className="text-xs text-ink-text/40">{roomCode}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{drawerAvatar}</span>
        <span className="font-heading text-sm">{drawerName}</span>
      </div>
      <div className="flex items-center gap-3">
        <CountdownTimer secondsLeft={secondsLeft} totalSeconds={totalSeconds} />
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? 'Unmute sound' : 'Mute sound'}
          title={muted ? 'Unmute sound' : 'Mute sound'}
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/5 text-lg transition hover:bg-white/15"
        >
          {muted ? '🔇' : '🔊'}
        </button>
      </div>
    </div>
  )
}

export default TopBar
