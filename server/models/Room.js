import mongoose from 'mongoose'

const { Schema } = mongoose

const playerSchema = new Schema(
  {
    player_id: { type: String, required: true },
    nickname: { type: String, required: true },
    avatar: { type: String, required: true },
    score: { type: Number, default: 0 },
    is_host: { type: Boolean, default: false },
    connected: { type: Boolean, default: true },
    socket_id: { type: String, default: null },
    disconnected_at: { type: Date, default: null },
    status: { type: String, enum: ['waiting', 'drawing', 'guessed', 'choosing'], default: 'waiting' },
  },
  { _id: false },
)

const strokeSchema = new Schema(
  {
    type: { type: String },
    tool: { type: String },
    color: { type: String },
    size: { type: Number },
    points: [{ x: Number, y: Number }],
    playerId: { type: String },
    ts: { type: Date, default: Date.now },
  },
  { _id: false },
)

const chatMessageSchema = new Schema(
  {
    player_id: { type: String },
    nickname: { type: String },
    message: { type: String },
    is_correct_guess: { type: Boolean, default: false },
    ts: { type: Date, default: Date.now },
  },
  { _id: false },
)

const roomSchema = new Schema(
  {
    room_code: { type: String, required: true, unique: true },
    host_player_id: { type: String, required: true },
    settings: {
      rounds: { type: Number, enum: [3, 5, 7], default: 3 },
      draw_time_sec: { type: Number, enum: [60, 90, 120], default: 90 },
      difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'mixed' },
    },
    status: {
      type: String,
      enum: ['lobby', 'word_select', 'drawing', 'round_end', 'game_end'],
      default: 'lobby',
    },
    players: { type: [playerSchema], default: [] },
    game_state: {
      round_number: { type: Number, default: 0 },
      total_rounds: { type: Number, default: 0 },
      draw_order: { type: [String], default: [] },
      turn_index: { type: Number, default: 0 },
      current_drawer_player_id: { type: String, default: null },
      word_choices: { type: [String], default: [] }, // server-only, never broadcast
      current_word: { type: String, default: null }, // server-only, never broadcast
      word_length: { type: Number, default: 0 },
      revealed_indices: { type: [Number], default: [] },
      turn_started_at: { type: Date, default: null },
      turn_ends_at: { type: Date, default: null },
      correct_guessers: { type: [String], default: [] },
      used_words: { type: [String], default: [] }, // offered this game, excluded from future picks to avoid repeats
    },
    canvas_strokes: { type: [strokeSchema], default: [] },
    chat_log: { type: [chatMessageSchema], default: [] },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
)

export const Room = mongoose.model('Room', roomSchema)
