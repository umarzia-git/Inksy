import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import { CANVAS_BG, drawStroke } from '../../utils/canvasHelpers.js'
import { SOCKET_EVENTS } from '../../utils/socketEvents.js'

// A ring cursor sized to match the eraser's actual footprint, so it's obvious
// how much will be erased before you click — plain crosshair/arrow gave no
// sense of scale, which made the (previously tiny, fixed) eraser feel even
// slower to use than it was.
function eraserCursor(size) {
  const diameter = Math.round(Math.max(8, Math.min(size, 100)))
  const radius = diameter / 2
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${diameter}' height='${diameter}'><circle cx='${radius}' cy='${radius}' r='${radius - 1}' fill='rgba(255,255,255,0.35)' stroke='%23000000' stroke-width='1.5'/></svg>`
  return `url("data:image/svg+xml,${svg}") ${radius} ${radius}, crosshair`
}

const DrawingCanvas = forwardRef(function DrawingCanvas(
  { roomCode, playerId, socket, tool, color, brushSize, initialStrokes, onStrokeCountChange, disabled = false },
  ref,
) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const strokesRef = useRef(initialStrokes ? [...initialStrokes] : [])
  const currentStrokeRef = useRef(null)
  const sizeRef = useRef({ width: 0, height: 0 })

  const cursor = useMemo(() => (tool === 'eraser' ? eraserCursor(brushSize) : undefined), [tool, brushSize])

  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const { width, height } = sizeRef.current
    if (width === 0 || height === 0) return

    ctx.fillStyle = CANVAS_BG
    ctx.fillRect(0, 0, width, height)

    for (const stroke of strokesRef.current) drawStroke(ctx, stroke, width, height)
    if (currentStrokeRef.current) drawStroke(ctx, currentStrokeRef.current, width, height)
  }, [])

  // Resize the backing store to match devicePixelRatio and redraw every
  // stroke from the vector log — never CSS-scale the existing bitmap, or it
  // blurs on any resize (rotation, keyboard, window resize, etc).
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    function handleResize() {
      const dpr = window.devicePixelRatio || 1
      const { clientWidth, clientHeight } = container
      sizeRef.current = { width: clientWidth, height: clientHeight }
      canvas.width = Math.round(clientWidth * dpr)
      canvas.height = Math.round(clientHeight * dpr)
      canvas.style.width = `${clientWidth}px`
      canvas.style.height = `${clientHeight}px`
      const ctx = canvas.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      redraw()
    }

    handleResize()
    const observer = new ResizeObserver(handleResize)
    observer.observe(container)
    return () => observer.disconnect()
  }, [redraw])

  // Remote strokes from other players in the room.
  useEffect(() => {
    if (!socket) return

    function handleRemoteStroke({ stroke }) {
      strokesRef.current.push(stroke)
      onStrokeCountChange?.(strokesRef.current.length)
      redraw()
    }
    function handleRemoteClear() {
      strokesRef.current = []
      onStrokeCountChange?.(0)
      redraw()
    }
    function handleRemoteUndo() {
      strokesRef.current.pop()
      onStrokeCountChange?.(strokesRef.current.length)
      redraw()
    }

    socket.on(SOCKET_EVENTS.DRAW_STROKE, handleRemoteStroke)
    socket.on(SOCKET_EVENTS.DRAW_CLEAR, handleRemoteClear)
    socket.on(SOCKET_EVENTS.DRAW_UNDO, handleRemoteUndo)
    return () => {
      socket.off(SOCKET_EVENTS.DRAW_STROKE, handleRemoteStroke)
      socket.off(SOCKET_EVENTS.DRAW_CLEAR, handleRemoteClear)
      socket.off(SOCKET_EVENTS.DRAW_UNDO, handleRemoteUndo)
    }
  }, [socket, redraw, onStrokeCountChange])

  function commitStroke(stroke) {
    strokesRef.current.push(stroke)
    onStrokeCountChange?.(strokesRef.current.length)
    redraw()
    socket?.emit(SOCKET_EVENTS.DRAW_STROKE, { roomCode, stroke })
  }

  function getRelativePoint(e) {
    const rect = containerRef.current.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    }
  }

  function handlePointerDown(e) {
    if (disabled) return
    e.preventDefault()
    canvasRef.current.setPointerCapture(e.pointerId)
    const point = getRelativePoint(e)
    const normalizedSize = brushSize / sizeRef.current.width

    if (tool === 'fill') {
      commitStroke({ type: 'fill', tool: 'fill', color, size: normalizedSize, points: [point], playerId, ts: Date.now() })
      return
    }

    currentStrokeRef.current = {
      type: tool === 'rectangle' || tool === 'circle' ? tool : 'stroke',
      tool,
      color: tool === 'eraser' ? CANVAS_BG : color,
      size: normalizedSize,
      points: [point],
      playerId,
      ts: Date.now(),
    }
    redraw()
  }

  function handlePointerMove(e) {
    if (disabled || !currentStrokeRef.current) return
    e.preventDefault()
    const point = getRelativePoint(e)
    const stroke = currentStrokeRef.current
    if (stroke.tool === 'rectangle' || stroke.tool === 'circle') {
      stroke.points = [stroke.points[0], point]
    } else {
      stroke.points.push(point)
    }
    redraw()
  }

  function handlePointerUp() {
    if (disabled || !currentStrokeRef.current) return
    const stroke = currentStrokeRef.current
    currentStrokeRef.current = null
    commitStroke(stroke)
  }

  useImperativeHandle(ref, () => ({
    undo() {
      if (strokesRef.current.length === 0) return
      strokesRef.current.pop()
      onStrokeCountChange?.(strokesRef.current.length)
      redraw()
      socket?.emit(SOCKET_EVENTS.DRAW_UNDO, { roomCode })
    },
    clear() {
      strokesRef.current = []
      onStrokeCountChange?.(0)
      redraw()
      socket?.emit(SOCKET_EVENTS.DRAW_CLEAR, { roomCode })
    },
  }))

  return (
    <div ref={containerRef} className="relative h-full w-full touch-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none rounded-lg"
        style={cursor ? { cursor } : undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  )
})

export default DrawingCanvas
