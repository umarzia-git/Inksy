import ColorPalette from './ColorPalette.jsx'
import BrushSizeSlider from './BrushSizeSlider.jsx'

const TOOLS = [
  { id: 'pencil', label: '✏️' },
  { id: 'eraser', label: '🧽' },
  { id: 'fill', label: '🪣' },
  { id: 'rectangle', label: '▭' },
  { id: 'circle', label: '◯' },
]

function Toolbar({ tool, onToolChange, color, onColorChange, brushSize, onBrushSizeChange, onUndo, onClear, canUndo, disabled }) {
  return (
    <div className="flex flex-nowrap items-center gap-3 overflow-x-auto border-b border-white/10 p-2">
      <div className="flex shrink-0 gap-1">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={disabled}
            aria-pressed={tool === t.id}
            onClick={() => onToolChange(t.id)}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-lg transition disabled:opacity-40 ${
              tool === t.id ? 'bg-ink-coral' : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ColorPalette selectedColor={color} onSelect={onColorChange} />
      <BrushSizeSlider value={brushSize} onChange={onBrushSizeChange} />

      <div className="ml-auto flex shrink-0 gap-1">
        <button
          type="button"
          disabled={!canUndo}
          onClick={onUndo}
          className="flex h-11 shrink-0 items-center rounded-lg bg-white/5 px-3 text-sm transition hover:bg-white/10 disabled:opacity-30"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={onClear}
          className="flex h-11 shrink-0 items-center rounded-lg bg-white/5 px-3 text-sm transition hover:bg-white/10"
        >
          Clear
        </button>
      </div>
    </div>
  )
}

export default Toolbar
