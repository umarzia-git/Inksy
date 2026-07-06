export const SOCKET_EVENTS = {
  PLAYER_JOINED: 'player:joined',
  PLAYER_LEFT: 'player:left',
  PLAYER_RECONNECTED: 'player:reconnected',

  GAME_START: 'game:start',
  GAME_END: 'game:end',

  DRAW_STROKE: 'draw:stroke',
  DRAW_CLEAR: 'draw:clear',
  DRAW_UNDO: 'draw:undo',

  GUESS_SUBMIT: 'guess:submit',
  GUESS_CORRECT: 'guess:correct',
  GUESS_WRONG: 'guess:wrong',

  ROUND_START: 'round:start',
  ROUND_END: 'round:end',
  ROUND_TIMER: 'round:timer',

  WORD_CHOICES: 'word:choices',
  WORD_HINT: 'word:hint',

  REACTION_SEND: 'reaction:send',
}
