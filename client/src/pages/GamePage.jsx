import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/game/TopBar.jsx'
import WordDisplay from '../components/game/WordDisplay.jsx'
import PlayerSidebar from '../components/game/PlayerSidebar.jsx'
import Scoreboard from '../components/game/Scoreboard.jsx'
import WinnerScreen from '../components/game/WinnerScreen.jsx'
import WordChoiceModal from '../components/game/WordChoiceModal.jsx'
import ReactionOverlay from '../components/game/ReactionOverlay.jsx'
import ReactionBar from '../components/game/ReactionBar.jsx'
import ChatPanel from '../components/chat/ChatPanel.jsx'
import GuessInput from '../components/chat/GuessInput.jsx'
import Toolbar from '../components/canvas/Toolbar.jsx'
import DrawingCanvas from '../components/canvas/DrawingCanvas.jsx'
import { useSocket } from '../hooks/useSocket.js'
import { useRoom } from '../hooks/useRoom.js'
import { useGameSocket } from '../hooks/useGameSocket.js'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { setSoundMuted, playCorrectGuessChime, playRoundEndSound, playTick } from '../utils/sounds.js'

function GamePage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { socket } = useSocket()
  const { state, dispatch } = useRoom()
  const [chatOpen, setChatOpen] = useState(false)

  const [tool, setTool] = useState('pencil')
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(6)
  const [strokeCount, setStrokeCount] = useState(0)
  const canvasRef = useRef(null)
  const [muted, setMuted] = useLocalStorage('inksy:soundMuted', false)
  const previousPhaseRef = useRef(null)
  const [postRoundStage, setPostRoundStage] = useState('reveal')

  const playerId = state.self?.playerId || 'anonymous'
  const game = useGameSocket({
    socket,
    roomCode: code,
    playerId,
    dispatchRoom: dispatch,
    initialSnapshot: state.initialGameSnapshot,
  })

  const isDrawer = Boolean(game.drawer) && game.drawer.playerId === playerId
  const isHost = state.self?.playerId === state.players.find((p) => p.is_host)?.player_id
  const selfPlayer = state.players.find((p) => p.player_id === playerId)
  const isSpectator = selfPlayer?.is_spectator ?? state.self?.isSpectator ?? false
  const totalSecondsForPhase = game.phase === 'word_select' ? 15 : state.settings?.draw_time_sec || 90
  const wordDisplayPattern = isDrawer && game.ownWord ? game.ownWord.split('') : game.wordPattern
  const canvasDisabled = !(game.phase === 'drawing' && isDrawer) || isSpectator

  useEffect(() => {
    setSoundMuted(muted)
  }, [muted])

  useEffect(() => {
    if (!game.lastCorrectGuess) return
    playCorrectGuessChime()
    if (game.lastCorrectGuess.playerId === playerId) navigator.vibrate?.(200)
  }, [game.lastCorrectGuess, playerId])

  useEffect(() => {
    if (game.phase === 'round_end' && previousPhaseRef.current !== 'round_end') playRoundEndSound()
    previousPhaseRef.current = game.phase
  }, [game.phase])

  // Post-round: show the finished drawing with the word revealed for 3s
  // before switching to the full scoreboard overlay.
  useEffect(() => {
    if (game.phase !== 'round_end') return
    setPostRoundStage('reveal')
    const timeout = setTimeout(() => setPostRoundStage('scoreboard'), 3000)
    return () => clearTimeout(timeout)
  }, [game.phase])

  // Ticking sound while the visible timer is in its red/pulsing state (<=10s).
  // Restarting the interval every time secondsLeft changes lets each
  // successive second use a shorter interval, so the ticking audibly speeds up.
  useEffect(() => {
    const isCountingDown =
      (game.phase === 'word_select' || game.phase === 'drawing') && game.secondsLeft > 0 && game.secondsLeft <= 10
    if (!isCountingDown) return

    const interval = 150 + (game.secondsLeft - 1) * ((500 - 150) / 9)
    playTick(game.secondsLeft)
    const id = setInterval(() => playTick(game.secondsLeft), interval)
    return () => clearInterval(id)
  }, [game.secondsLeft, game.phase])

  function handleLeave() {
    dispatch({ type: 'RESET' })
    navigate('/')
  }

  return (
    <div className="flex h-dvh flex-col md:grid md:grid-cols-[240px_1fr_320px] md:grid-rows-[auto_auto_1fr]">
      <div className="shrink-0 md:col-span-3">
        <TopBar
          roomCode={code}
          roundNumber={game.roundNumber || 1}
          totalRounds={game.totalRounds || state.settings?.rounds || 3}
          drawerName={game.drawer?.nickname || '—'}
          drawerAvatar={game.drawer?.avatar || '🎨'}
          secondsLeft={game.secondsLeft ?? totalSecondsForPhase}
          totalSeconds={totalSecondsForPhase}
          muted={muted}
          onToggleMute={() => setMuted((m) => !m)}
        />
      </div>
      <div className="shrink-0 md:col-span-3">
        {isSpectator && (
          <p className="bg-ink-yellow/90 px-4 py-1.5 text-center text-sm font-semibold text-ink-bg">
            👀 You are spectating — you'll join next round
          </p>
        )}
        {!isSpectator && !isDrawer && game.phase === 'drawing' && game.hasGuessedCorrectly && (
          <p className="bg-green-500/90 px-4 py-1.5 text-center text-sm font-semibold text-ink-bg">
            ✅ You guessed it! Waiting for the round to end…
          </p>
        )}
        {game.phase !== 'lobby' && <WordDisplay pattern={wordDisplayPattern} />}
      </div>

      <aside className="hidden overflow-y-auto border-r border-white/10 p-3 md:block">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-text/60">Players</p>
        <PlayerSidebar players={state.players} phase={game.phase} flashEvent={game.lastCorrectGuess} />
      </aside>

      <main className="relative flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-white/10 p-2 md:hidden">
          <PlayerSidebar players={state.players} compact phase={game.phase} flashEvent={game.lastCorrectGuess} />
        </div>
        <Toolbar
          tool={tool}
          onToolChange={setTool}
          color={color}
          onColorChange={setColor}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          onUndo={() => canvasRef.current?.undo()}
          onClear={() => canvasRef.current?.clear()}
          canUndo={strokeCount > 0}
          disabled={canvasDisabled}
        />
        <div className="canvas-paper-frame relative m-2 min-h-0 flex-1 overflow-hidden rounded-lg p-2">
          <div className="relative h-full w-full overflow-hidden rounded-md bg-ink-canvas">
            <DrawingCanvas
              ref={canvasRef}
              roomCode={code}
              playerId={playerId}
              socket={socket}
              tool={tool}
              color={color}
              brushSize={brushSize}
              initialStrokes={state.canvasStrokes}
              onStrokeCountChange={setStrokeCount}
              disabled={canvasDisabled}
            />
            <ReactionOverlay reactions={game.reactions} />

            {game.phase === 'word_select' && !isDrawer && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink-bg/70 text-center font-heading text-lg">
                {game.drawer?.nickname} is choosing…
              </div>
            )}
            {game.phase === 'word_select' && isDrawer && game.wordChoices && (
              <WordChoiceModal choices={game.wordChoices} secondsLeft={game.secondsLeft} onPick={game.pickWord} />
            )}
            {game.phase === 'round_end' && postRoundStage === 'reveal' && game.lastRoundWord && (
              <div className="absolute inset-x-0 bottom-0 z-10 bg-ink-bg/85 px-4 py-3 text-center">
                <p className="text-ink-text/70">
                  The word was: <span className="font-heading capitalize text-ink-yellow">{game.lastRoundWord}</span>
                </p>
              </div>
            )}
            {game.phase === 'round_end' && postRoundStage === 'scoreboard' && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-ink-bg/90 p-4">
                {game.lastRoundWord && (
                  <p className="text-ink-text/70">
                    The word was: <span className="font-heading capitalize text-ink-yellow">{game.lastRoundWord}</span>
                  </p>
                )}
                <Scoreboard players={state.players} />
              </div>
            )}
          </div>
        </div>
      </main>

      <aside className="relative flex shrink-0 flex-col border-t border-white/10 p-2 md:h-auto md:min-h-0 md:flex-1 md:border-l md:border-t-0 md:p-3">
        <div className="hidden min-h-0 flex-1 overflow-y-auto md:block">
          <ChatPanel messages={game.chatMessages} />
        </div>

        {chatOpen && (
          <div className="absolute inset-x-2 bottom-full mb-2 max-h-48 overflow-y-auto rounded-lg bg-ink-bg/95 p-3 shadow-lg md:hidden">
            <ChatPanel messages={game.chatMessages} />
          </div>
        )}

        <div className="flex shrink-0 flex-col gap-2 pt-2 md:pt-0">
          <ReactionBar onSend={game.sendReaction} />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setChatOpen((open) => !open)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-sm md:hidden"
            >
              💬
            </button>
            <div className="flex-1">
              <GuessInput
                onSubmit={game.submitGuess}
                disabled={isDrawer || isSpectator}
                placeholder={
                  isSpectator
                    ? 'Spectating…'
                    : isDrawer
                      ? "You're drawing!"
                      : game.hasGuessedCorrectly
                        ? 'Chatting…'
                        : 'Type your guess…'
                }
              />
            </div>
          </div>
        </div>
      </aside>

      {game.phase === 'game_end' && (
        <WinnerScreen
          players={state.players}
          winner={game.winner}
          isHost={isHost}
          onRematch={game.startGame}
          onLeave={handleLeave}
        />
      )}
    </div>
  )
}

export default GamePage
