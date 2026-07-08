const PRESET_COLORS = [
  '#000000', '#FFFFFF', '#7F7F7F', '#C3C3C3',
  '#FF0000', '#FF6B6B', '#FFA500', '#FFD93D',
  '#00A651', '#00FF00', '#00AEEF', '#0000FF',
  '#800080', '#FF00FF', '#8B4513', '#FFC0CB',
]

function ColorPalette({ selectedColor, onSelect }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="grid grid-cols-8 grid-rows-2 gap-1">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={selectedColor === c}
            onClick={() => onSelect(c)}
            style={{ backgroundColor: c }}
            className={`h-11 w-11 shrink-0 rounded border-2 ${selectedColor === c ? 'border-ink-coral' : 'border-white/20'}`}
          />
        ))}
      </div>
      <input
        type="color"
        value={selectedColor}
        onChange={(e) => onSelect(e.target.value)}
        aria-label="Custom color"
        className="h-11 w-11 shrink-0 cursor-pointer rounded border border-white/20 bg-transparent"
      />
    </div>
  )
}

export default ColorPalette
