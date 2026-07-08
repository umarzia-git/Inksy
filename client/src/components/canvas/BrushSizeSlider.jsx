function BrushSizeSlider({ value, onChange }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <input
        type="range"
        min={2}
        max={30}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-24 accent-ink-coral"
      />
      <span className="w-6 text-center text-xs text-ink-text/60">{value}</span>
    </div>
  )
}

export default BrushSizeSlider
