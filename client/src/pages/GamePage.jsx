import { useRef, useState } from 'react'
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

  const playerId = state.self?.playerId || 'anonymous'
  const game = useGameSocket({ socket, roomCode: code, playerId, dispatchRoom: dispatch })

  const isDrawer = Boolean(game.drawer) && game.drawer.playerId === playerId
  const isHost = state.self?.playerId === state.players.find((p) => p.is_host)?.player_id
  const totalSecondsForPhase = game.phase === 'word_select' ? 15 : state.settings?.draw_time_sec || 90
  const wordDisplayPattern = isDrawer && game.ownWord ? game.ownWord.split('') : game.wordPattern
  const canvasDisabled = !(game.phase === 'drawing' && isDrawer)

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
        />
      </div>
      <div className="shrink-0 md:col-span-3">
        {game.phase !== 'lobby' && <WordDisplay pattern={wordDisplayPattern} />}
      </div>

      <aside className="hidden overflow-y-auto border-r border-white/10 p-3 md:block">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-text/60">Players</p>
        <PlayerSidebar players={state.players} />
      </aside>

      <main className="relative flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-white/10 p-2 md:hidden">
          <PlayerSidebar players={state.players} compact />
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
        <div className="relative m-2 min-h-0 flex-1 overflow-hidden rounded-lg bg-ink-canvas">
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
          {game.phase === 'round_end' && (
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
              className="shrink-0 rounded-lg bg-white/10 px-3 py-2 text-sm md:hidden"
            >
              💬
            </button>
            <div className="flex-1">
              <GuessInput
                onSubmit={game.submitGuess}
                disabled={isDrawer}
                placeholder={isDrawer ? "You're drawing!" : game.hasGuessedCorrectly ? 'Chatting…' : 'Type your guess…'}
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
