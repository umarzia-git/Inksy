CREATE TABLE IF NOT EXISTS words (
  id INT AUTO_INCREMENT PRIMARY KEY,
  word VARCHAR(50) NOT NULL,
  difficulty ENUM('easy', 'medium', 'hard') NOT NULL,
  category VARCHAR(50),
  UNIQUE KEY uq_word_difficulty (word, difficulty)
);

CREATE TABLE IF NOT EXISTS games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_code VARCHAR(20) NOT NULL,
  started_at DATETIME NOT NULL,
  ended_at DATETIME NULL,
  winner_nickname VARCHAR(50) NULL
);

CREATE TABLE IF NOT EXISTS game_players (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id INT NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  avatar VARCHAR(10) NOT NULL,
  final_score INT NOT NULL DEFAULT 0,
  FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
);
