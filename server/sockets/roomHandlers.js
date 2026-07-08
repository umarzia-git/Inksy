import crypto from 'node:crypto'
import { SOCKET_EVENTS } from '../utils/socketEvents.js'
import { createRoom, joinRoom, removePlayer, getRoomByCode } from '../services/roomService.js'
import { isValidNickname, isValidAvatar, isValidRoomCode, isValidSettings, isValidCustomWords } from '../utils/validators.js'
import { endTurn, buildGameSnapshot } from '../services/gameStateMachine.js'
import { setRoomTimer } from '../services/timerService.js'
import { DRAWER_DISCONNECT_SKIP_MS } from '../utils/gameConstants.js'

function toPublicRoom(room) {
  return {
    room_code: room.room_code,
    host_player_id: room.host_player_id,
    settings: room.settings,
    status: room.status,
    custom_word_count: room.custom_words.length,
    players: room.players.map((p) => ({
      player_id: p.player_id,
      nickname: p.nickname,
      avatar: p.avatar,
      score: p.score,
      is_host: p.is_host,
      connected: p.connected,
      status: p.status,
      is_spectator: p.is_spectator,
    })),
    canvas_strokes: room.canvas_strokes.map((s) => ({
      type: s.type,
      tool: s.tool,
      color: s.color,
      size: s.size,
      points: s.points,
      playerId: s.playerId,
      ts: s.ts,
    })),
  }
}

export function registerRoomHandlers(io, socket, withErrorHandling) {
  socket.on(
    'room:create',
    withErrorHandling(socket, 'room:create', async ({ nickname, avatar, settings, customWords = [] } = {}, callback) => {
      const normalizedCustomWords = (Array.isArray(customWords) ? customWords : []).map((w) =>
        typeof w === 'string' ? w.trim().toLowerCase() : w,
      )
      if (
        !isValidNickname(nickname) ||
        !isValidAvatar(avatar) ||
        !isValidSettings(settings) ||
        !isValidCustomWords(normalizedCustomWords)
      ) {
        callback?.({ error: 'Invalid room settings or profile' })
        return
      }

      const playerId = crypto.randomUUID()
      const room = await createRoom({
        hostPlayerId: playerId,
        nickname: nickname.trim(),
        avatar,
        settings,
        customWords: normalizedCustomWords,
      })

      socket.data.roomCode = room.room_code
      socket.data.playerId = playerId
      // Joining a private room keyed by the player's own id lets the server
      // address this exact player directly (io.to(playerId)) without having
      // to search through every socket in the room to find them.
      await socket.join([room.room_code, playerId])

      callback?.({ room: toPublicRoom(room), playerId })
    }),
  )

  socket.on(
    'room:join',
    withErrorHandling(socket, 'room:join', async ({ roomCode, nickname, avatar } = {}, callback) => {
      if (!isValidRoomCode(roomCode) || !isValidNickname(nickname) || !isValidAvatar(avatar)) {
        callback?.({ error: 'Invalid join request' })
        return
      }

      try {
        const generatedPlayerId = crypto.randomUUID()
        const { room, playerId, isSpectator, isReconnect } = await joinRoom({
          roomCode,
          playerId: generatedPlayerId,
          nickname: nickname.trim(),
          avatar,
        })

        socket.data.roomCode = room.room_code
        socket.data.playerId = playerId
        socket.data.isSpectator = isSpectator
        // Joining a private room keyed by the player's own id lets the server
        // address this exact player directly (io.to(playerId)) without having
        // to search through every socket in the room to find them.
        await socket.join([room.room_code, playerId])

        const gameSnapshot = buildGameSnapshot(room)
        callback?.({ room: toPublicRoom(room), playerId, isSpectator, isReconnect, game_snapshot: gameSnapshot })
        socket.to(room.room_code).emit(SOCKET_EVENTS.PLAYER_JOINED, { room: toPublicRoom(room) })

        // A reconnecting drawer needs their word re-sent privately — it's never
        // part of the broadcast snapshot above.
        if (isReconnect && playerId === room.game_state.current_drawer_player_id) {
          if (room.status === 'word_select') {
            socket.emit(SOCKET_EVENTS.WORD_CHOICES, { choices: room.game_state.word_choices })
          } else if (room.status === 'drawing' && room.game_state.current_word) {
            socket.emit(SOCKET_EVENTS.WORD_REVEAL, { word: room.game_state.current_word })
          }
        }
      } catch (err) {
        callback?.({ error: err.message })
      }
    }),
  )

  socket.on(
    'disconnect',
    withErrorHandling(socket, 'room:disconnect', async () => {
      const { roomCode, playerId } = socket.data
      if (!roomCode || !playerId) return

      const room = await getRoomByCode(roomCode)
      if (!room) return

      // Before a game exists (or after it's over), a disconnect just frees the seat.
      if (room.status === 'lobby' || room.status === 'game_end') {
        const updated = await removePlayer(roomCode, playerId)
        if (updated) io.to(roomCode).emit(SOCKET_EVENTS.PLAYER_LEFT, { room: toPublicRoom(updated) })
        return
      }

      // Mid-game: keep their seat/score (full rejoin-and-restore is Step 11's job),
      // but don't let a vanished drawer stall the round forever.
      const player = room.players.find((p) => p.player_id === playerId)
      if (player) {
        player.connected = false
        player.disconnected_at = new Date()
        await room.save()
      }

      const isDrawer = room.game_state.current_drawer_player_id === playerId
      const isDrawerTurn = room.status === 'word_select' || room.status === 'drawing'
      if (isDrawer && isDrawerTurn) {
        setRoomTimer(roomCode, 'drawerDisconnectSkip', () => endTurn(io, roomCode, 'drawer_disconnected'), DRAWER_DISCONNECT_SKIP_MS)
      }
    }),
  )
}
