import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import TopBar from '../components/game/TopBar.jsx'
import WordDisplay from '../components/game/WordDisplay.jsx'
import PlayerSidebar from '../components/game/PlayerSidebar.jsx'
import ChatPanel from '../components/chat/ChatPanel.jsx'
import GuessInput from '../components/chat/GuessInput.jsx'
import Toolbar from '../components/canvas/Toolbar.jsx'
import DrawingCanvas from '../components/canvas/DrawingCanvas.jsx'
import { useSocket } from '../hooks/useSocket.js'
import { useRoom } from '../hooks/useRoom.js'

// Demo data — real player/game state arrives with the game logic in Step 10.
const DEMO_PLAYERS = [
  { player_id: '1', nickname: 'HostPlayer', avatar: '🦁', score: 120, status: 'drawing' },
  { player_id: '2', nickname: 'GuestPlayer', avatar: '🐸', score: 80, status: 'guessed' },
  { player_id: '3', nickname: 'ThirdPlayer', avatar: '🤖', score: 0, status: 'waiting' },
]

function GamePage() {
  const { code } = useParams()
  const { socket } = useSocket()
  const { state } = useRoom()
  const [chatOpen, setChatOpen] = useState(false)

  const [tool, setTool] = useState('pencil')
  const [color, setColor] = useState('#000000')
  const [brushSize, setBrushSize] = useState(6)
  const [strokeCount, setStrokeCount] = useState(0)
  const canvasRef = useRef(null)

  const playerId = state.self?.playerId || 'anonymous'

  return (
    <div className="flex h-dvh flex-col md:grid md:grid-cols-[240px_1fr_320px] md:grid-rows-[auto_auto_1fr]">
      <div className="shrink-0 md:col-span-3">
        <TopBar
          roomCode={code}
          roundNumber={1}
          totalRounds={3}
          drawerName="HostPlayer"
          drawerAvatar="🦁"
          secondsLeft={72}
          totalSeconds={90}
        />
      </div>
      <div className="shrink-0 md:col-span-3">
        <WordDisplay pattern={['_', '_', '_', '_', '_']} />
      </div>

      <aside className="hidden overflow-y-auto border-r border-white/10 p-3 md:block">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-ink-text/60">Players</p>
        <PlayerSidebar players={DEMO_PLAYERS} />
      </aside>

      <main className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-white/10 p-2 md:hidden">
          <PlayerSidebar players={DEMO_PLAYERS} compact />
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
        />
        <div className="m-2 min-h-0 flex-1 overflow-hidden rounded-lg bg-ink-canvas">
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
          />
        </div>
      </main>

      <aside className="relative flex shrink-0 flex-col border-t border-white/10 p-2 md:h-auto md:min-h-0 md:flex-1 md:border-l md:border-t-0 md:p-3">
        {/* Desktop: chat log is always visible in the sidebar. */}
        <div className="hidden min-h-0 flex-1 overflow-y-auto md:block">
          <ChatPanel />
        </div>

        {/* Mobile: chat is a toggled overlay so it never steals fixed space from
            the canvas — only the guess input bar is a permanent flex child,
            matching the "canvas resizes above it" mobile rule. */}
        {chatOpen && (
          <div className="absolute inset-x-2 bottom-full mb-2 max-h-48 overflow-y-auto rounded-lg bg-ink-bg/95 p-3 shadow-lg md:hidden">
            <ChatPanel />
          </div>
        )}

        <div className="flex shrink-0 items-center gap-2 pt-2 md:pt-0">
          <button
            type="button"
            onClick={() => setChatOpen((open) => !open)}
            className="shrink-0 rounded-lg bg-white/10 px-3 py-2 text-sm md:hidden"
          >
            💬
          </button>
          <div className="flex-1">
            <GuessInput />
          </div>
        </div>
      </aside>
    </div>
  )
}

export default GamePage
