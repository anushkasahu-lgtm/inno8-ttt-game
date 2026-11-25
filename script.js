const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

let boardState = Array(9).fill(null);
let currentPlayer = 'X';
let isGameActive = true;
let isAiMode = false;
let scores = { X: 0, O: 0, ties: 0 };

const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const restartBtn = document.getElementById('restart-btn');
const resetScoreBtn = document.getElementById('reset-score-btn');
const pvpBtn = document.getElementById('pvp-btn');
const aiBtn = document.getElementById('ai-btn');
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreTiesEl = document.getElementById('score-ties');
const labelOEl = document.getElementById('label-o');

function initGame() {
  cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
  });

  restartBtn.addEventListener('click', restartGame);
  resetScoreBtn.addEventListener('click', resetScores);
  pvpBtn.addEventListener('click', () => setMode(false));
  aiBtn.addEventListener('click', () => setMode(true));

  updateStatus();
}

function setMode(aiMode) {
  if (isAiMode === aiMode) return;
  isAiMode = aiMode;
  pvpBtn.classList.toggle('active', !aiMode);
  aiBtn.classList.toggle('active', aiMode);
  labelOEl.textContent = aiMode ? 'AI (O)' : 'Player O';
  resetScores();
  restartGame();
}

function handleCellClick(e) {
  const cell = e.target;
  const index = parseInt(cell.getAttribute('data-index'));

  if (boardState[index] !== null || !isGameActive) return;

  makeMove(index, currentPlayer);

  if (isGameActive && isAiMode && currentPlayer === 'O') {
    disableBoard(true);
    setTimeout(() => {
      makeAiMove();
      disableBoard(false);
    }, 400);
  }
}

function disableBoard(disable) {
  cells.forEach(cell => {
    if (disable) {
      cell.classList.add('disabled');
    } else {
      cell.classList.remove('disabled');
    }
  });
}

function makeMove(index, player) {
  boardState[index] = player;
  const cell = cells[index];
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());

  const winCombo = checkWin(player);

  if (winCombo) {
    endGame(false, winCombo);
  } else if (checkDraw()) {
    endGame(true);
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateStatus();
  }
}

function makeAiMove() {
  if (!isGameActive) return;

  const bestMove = getBestMove();
  if (bestMove !== null) {
    makeMove(bestMove, 'O');
  }
}

function getBestMove() {
  // 1. Try to win
  for (let i = 0; i < 9; i++) {
    if (boardState[i] === null) {
      boardState[i] = 'O';
      if (checkWin('O')) {
        boardState[i] = null;
        return i;
      }
      boardState[i] = null;
    }
  }

  // 2. Block player X win
  for (let i = 0; i < 9; i++) {
    if (boardState[i] === null) {
      boardState[i] = 'X';
      if (checkWin('X')) {
        boardState[i] = null;
        return i;
      }
      boardState[i] = null;
    }
  }

  // 3. Take center if available
  if (boardState[4] === null) return 4;

  // 4. Take available corner
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter(i => boardState[i] === null);
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }

  // 5. Take any remaining empty cell
  const emptyIndices = boardState
    .map((val, idx) => val === null ? idx : null)
    .filter(val => val !== null);

  if (emptyIndices.length > 0) {
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  return null;
}

function checkWin(player) {
  return WINNING_COMBINATIONS.find(combination => {
    return combination.every(index => boardState[index] === player);
  }) || null;
}

function checkDraw() {
  return boardState.every(cell => cell !== null);
}

function endGame(isDraw, winCombo = null) {
  isGameActive = false;

  if (isDraw) {
    statusText.textContent = "It's a Draw!";
    scores.ties++;
    scoreTiesEl.textContent = scores.ties;
  } else {
    const winnerName = isAiMode && currentPlayer === 'O' ? 'AI' : `Player ${currentPlayer}`;
    statusText.textContent = `${winnerName} Wins!`;
    scores[currentPlayer]++;
    if (currentPlayer === 'X') {
      scoreXEl.textContent = scores.X;
    } else {
      scoreOEl.textContent = scores.O;
    }

    if (winCombo) {
      winCombo.forEach(index => {
        cells[index].classList.add('winning');
      });
    }
  }
}

function updateStatus() {
  const turnName = isAiMode && currentPlayer === 'O' ? "AI's" : `Player ${currentPlayer}'s`;
  statusText.textContent = `${turnName} turn`;
}

function restartGame() {
  boardState.fill(null);
  currentPlayer = 'X';
  isGameActive = true;

  cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'cell';
  });

  updateStatus();
}

function resetScores() {
  scores = { X: 0, O: 0, ties: 0 };
  scoreXEl.textContent = '0';
  scoreOEl.textContent = '0';
  scoreTiesEl.textContent = '0';
}

initGame();
