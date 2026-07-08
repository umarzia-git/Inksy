// All game sounds are synthesized on the fly with the Web Audio API — no
// audio files. A single AudioContext is created lazily (browsers block
// AudioContext creation/autoplay before a user gesture) and reused for every
// sound, resuming it if the browser suspended it.
let audioCtx = null
let muted = false

function getContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    audioCtx = new AudioContextClass()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export function setSoundMuted(value) {
  muted = value
}

export function isSoundMuted() {
  return muted
}

function playTone(ctx, freq, startTime, duration, { type = 'sine', gain = 0.2 } = {}) {
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, startTime)
  gainNode.gain.setValueAtTime(0, startTime)
  gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.015)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)
  osc.connect(gainNode)
  gainNode.connect(ctx.destination)
  osc.start(startTime)
  osc.stop(startTime + duration + 0.02)
}

// Two quick ascending notes — a happy little "ding-ding".
export function playCorrectGuessChime() {
  if (muted) return
  const ctx = getContext()
  const now = ctx.currentTime
  playTone(ctx, 783.99, now, 0.12, { type: 'sine', gain: 0.22 }) // G5
  playTone(ctx, 1046.5, now + 0.09, 0.18, { type: 'sine', gain: 0.22 }) // C6
}

// A short three-note completion phrase.
export function playRoundEndSound() {
  if (muted) return
  const ctx = getContext()
  const now = ctx.currentTime
  playTone(ctx, 523.25, now, 0.1, { type: 'triangle', gain: 0.18 }) // C5
  playTone(ctx, 659.25, now + 0.09, 0.1, { type: 'triangle', gain: 0.18 }) // E5
  playTone(ctx, 783.99, now + 0.18, 0.22, { type: 'triangle', gain: 0.18 }) // G5
}

// A four-note ascending fanfare with a held final note.
export function playWinnerFanfare() {
  if (muted) return
  const ctx = getContext()
  const now = ctx.currentTime
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
  notes.forEach((freq, i) => playTone(ctx, freq, now + i * 0.14, 0.3, { type: 'square', gain: 0.15 }))
  playTone(ctx, 1046.5, now + notes.length * 0.14, 0.6, { type: 'square', gain: 0.18 })
}

// A soft click; pitch rises slightly as secondsLeft drops, for urgency.
export function playTick(secondsLeft) {
  if (muted) return
  const ctx = getContext()
  const freq = 700 + (10 - secondsLeft) * 25
  playTone(ctx, freq, ctx.currentTime, 0.045, { type: 'square', gain: 0.12 })
}
