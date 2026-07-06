# Inksy — Multiplayer Drawing & Guessing Game

## Project structure
/client → React + Vite + Tailwind CSS (frontend)
/server → Node.js + Express + Socket.io (backend)
/server/models → MongoDB (Mongoose) room-state schema
/server/db → MySQL migrations, seeds, and queries (word lists, game history)

## Tech stack
- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, Socket.io
- Cache / session store: MongoDB (room state, active players, scores, canvas strokes — replaces Redis)
- Database: MySQL (word lists, game history)
- Deploy: Vercel (frontend), Railway (backend)

## UI style
- Dark background: #0F0E17
- Primary accent: #FF6B6B (coral red)
- Secondary: #FFD93D (yellow)
- Canvas color: #FFFDF7 (warm white)
- Text: #FFFFFE
- Heading font: Fredoka One (Google Fonts)
- Body font: Nunito (Google Fonts)
- Style: clean, modern, mobile-first, premium feel

## Key rules
- Never hardcode config — use .env variables always
- Socket events must be handled with error catching
- Canvas touch events must work on mobile
- Keyboard must NEVER cover the canvas on mobile
- Correct word is NEVER sent to guessers' browsers — server-side validation only
- Always keep code clean and modular
- Git commit after each working feature

## Socket events
- player:joined, player:left, player:reconnected
- game:start, game:end
- draw:stroke, draw:clear, draw:undo
- guess:submit, guess:correct, guess:wrong
- round:start, round:end, round:timer
- word:choices (to drawer only), word:hint (to guessers)
- reaction:send

## Database design
- MySQL: `words` (id, word, difficulty, category), `games` (id, room_code, started_at, ended_at, winner_nickname), `game_players` (id, game_id, nickname, avatar, final_score)
- MongoDB: collection `rooms` — room_code, settings, players[], game_state, current_word, canvas_strokes[], created_at

## Current status
- [x] Project scaffold (git init, docs)
- [x] Full client/server scaffold
- [x] Express + Socket.io server
- [x] MySQL + MongoDB connections
- [x] Home + lobby screen
- [x] Socket.io room system
- [x] Game screen layout
- [x] Drawing canvas
- [x] Game logic (word system, guessing, scoring, rounds, reactions)
- [ ] Reconnection system (rejoin-and-restore within 30s — currently only a minimal drawer-disconnect turn-skip exists)
- [ ] Mobile fixes (beyond the keyboard-safe layout already built in Step 8)
