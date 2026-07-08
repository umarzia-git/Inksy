/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'ink-bg': '#0F0E17',
        'ink-coral': '#FF6B6B',
        'ink-yellow': '#FFD93D',
        'ink-canvas': '#FFFDF7',
        'ink-text': '#FFFFFE',
      },
      fontFamily: {
        heading: ['"Fredoka One"', 'system-ui', 'sans-serif'],
        body: ['"Nunito"', 'system-ui', 'sans-serif'],
        hand: ['"Caveat"', '"Comic Sans MS"', 'cursive'],
      },
    },
  },
  plugins: [],
}
