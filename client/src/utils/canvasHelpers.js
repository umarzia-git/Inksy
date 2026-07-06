export const CANVAS_BG = '#FFFDF7'

export function denormalize(point, width, height) {
  return { x: point.x * width, y: point.y * height }
}

// Strokes store points and brush size as fractions of the canvas's logical
// (CSS) width/height, not raw pixels — so a replay looks the same whether
// it's rendered on a phone or a wide desktop canvas of a different size.
export function drawStroke(ctx, stroke, width, height) {
  const { tool, color, size, points } = stroke
  if (!points || points.length === 0) return

  const lineWidth = size * width

  if (tool === 'fill') {
    const seed = denormalize(points[0], width, height)
    floodFill(ctx, Math.round(seed.x), Math.round(seed.y), color)
    return
  }

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth

  if (tool === 'rectangle') {
    const p0 = denormalize(points[0], width, height)
    const p1 = denormalize(points[points.length - 1], width, height)
    ctx.strokeRect(Math.min(p0.x, p1.x), Math.min(p0.y, p1.y), Math.abs(p1.x - p0.x), Math.abs(p1.y - p0.y))
    return
  }

  if (tool === 'circle') {
    const p0 = denormalize(points[0], width, height)
    const p1 = denormalize(points[points.length - 1], width, height)
    const cx = (p0.x + p1.x) / 2
    const cy = (p0.y + p1.y) / 2
    const rx = Math.abs(p1.x - p0.x) / 2
    const ry = Math.abs(p1.y - p0.y) / 2
    ctx.beginPath()
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
    ctx.stroke()
    return
  }

  // pencil / eraser — freehand path through every sampled point
  ctx.beginPath()
  const first = denormalize(points[0], width, height)
  ctx.moveTo(first.x, first.y)
  for (let i = 1; i < points.length; i++) {
    const p = denormalize(points[i], width, height)
    ctx.lineTo(p.x, p.y)
  }
  ctx.stroke()
}

function hexToRgba(hex) {
  const clean = hex.replace('#', '')
  const bigint = parseInt(clean, 16)
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255, 255]
}

function colorsMatch(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3]
}

// Simple stack-based flood fill operating directly on the canvas's device
// pixels (ctx.canvas.width/height already account for devicePixelRatio).
export function floodFill(ctx, startX, startY, fillColorHex) {
  const canvas = ctx.canvas
  const dpr = window.devicePixelRatio || 1
  const imgWidth = canvas.width
  const imgHeight = canvas.height
  const sx = Math.round(startX * dpr)
  const sy = Math.round(startY * dpr)
  if (sx < 0 || sy < 0 || sx >= imgWidth || sy >= imgHeight) return

  const imageData = ctx.getImageData(0, 0, imgWidth, imgHeight)
  const data = imageData.data

  const fillColor = hexToRgba(fillColorHex)
  const startIdx = (sy * imgWidth + sx) * 4
  const startColor = [data[startIdx], data[startIdx + 1], data[startIdx + 2], data[startIdx + 3]]
  if (colorsMatch(startColor, fillColor)) return

  const stack = [[sx, sy]]
  const visited = new Uint8Array(imgWidth * imgHeight)

  while (stack.length) {
    const [x, y] = stack.pop()
    if (x < 0 || y < 0 || x >= imgWidth || y >= imgHeight) continue
    const idx = y * imgWidth + x
    if (visited[idx]) continue
    const dataIdx = idx * 4
    if (!colorsMatch([data[dataIdx], data[dataIdx + 1], data[dataIdx + 2], data[dataIdx + 3]], startColor)) continue

    visited[idx] = 1
    data[dataIdx] = fillColor[0]
    data[dataIdx + 1] = fillColor[1]
    data[dataIdx + 2] = fillColor[2]
    data[dataIdx + 3] = fillColor[3]

    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
  }

  ctx.putImageData(imageData, 0, 0)
}
