import CountdownTimer from '../common/CountdownTimer.jsx'

function TopBar({ roomCode, roundNumber, totalRounds, drawerName, drawerAvatar, secondsLeft, totalSeconds }) {
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
      <CountdownTimer secondsLeft={secondsLeft} totalSeconds={totalSeconds} />
    </div>
  )
}

export default TopBar
