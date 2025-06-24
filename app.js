const boxes = document.querySelectorAll(".btn");
const resetBoardBtn = document.getElementById("reset-btn");
const resetScoresBtn = document.getElementById("reset-scores");
const turnDisplay = document.getElementById("turn-indicator");
const modeSelect = document.getElementById("mode");
const msgBox = document.querySelector(".msg");
const winContainer = document.querySelector(".win");
const newGameBtn = document.querySelector(".new");

const scoreX = document.getElementById("score-x");
const scoreO = document.getElementById("score-o");
const scoreDraw = document.getElementById("score-draw");

const delay = currentAIType() === "hard" ? 50 : 300;

const winPattern = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

let turnX = true;
let moveCount = 0;
let gameOver = false;
let score = { X: 0, O: 0, draw: 0 };

function updateScoreboard() {
  scoreX.textContent = `X: ${score.X}`;
  scoreO.textContent = `O: ${score.O}`;
  scoreDraw.textContent = `Draws: ${score.draw}`;
}

function resetBoard() {
  boxes.forEach((b) => {
    b.innerText = "";
    b.disabled = false;
    b.classList.remove("winning-box");
  });
  turnX = true;
  moveCount = 0;
  gameOver = false;
  winContainer.classList.add("hide");
  turnDisplay.innerText = "X's Turn";
  turnDisplay.style.color = "#3f72af";

  if (isAIEnabled() && !turnX) makeAIMove();
}

function isAIEnabled() {
  return modeSelect.value !== "pvp";
}

function currentAIType() {
  return modeSelect.value;
}

function getAvailableMoves() {
  return [...boxes]
    .map((b, i) => (b.innerText === "" ? i : null))
    .filter((i) => i !== null);
}

function makeAIMove() {
  if (gameOver) return;
  const available = getAvailableMoves();
  let index;

  switch (currentAIType()) {
    case "easy":
      index = available[Math.floor(Math.random() * available.length)];
      break;
    case "medium":
      index = getMediumMove();
      break;
    case "hard":
      index = getBestMove("O");
      break;
  }

  setTimeout(() => {
    boxes[index].innerText = "O";
    boxes[index].style.color = "#d80032";
    boxes[index].disabled = true;
    moveCount++;
    turnX = true;
    turnDisplay.innerText = "X's Turn";
    checkWinner();
  }, delay);
}

function getMediumMove() {
  for (let i of getAvailableMoves()) {
    boxes[i].innerText = "O";
    if (checkVirtualWin("O")) {
      boxes[i].innerText = "";
      return i;
    }
    boxes[i].innerText = "";
  }
  for (let i of getAvailableMoves()) {
    boxes[i].innerText = "X";
    if (checkVirtualWin("X")) {
      boxes[i].innerText = "";
      return i;
    }
    boxes[i].innerText = "";
  }
  const av = getAvailableMoves();
  return av[Math.floor(Math.random() * av.length)];
}

function getBestMove(player) {
  if (moveCount === 1 && currentAIType() === "hard") {
    // Prefer center
    if (boxes[4].innerText === "") return 4;

    // Else pick a random empty corner (guaranteed available)
    const corners = [0, 2, 6, 8];
    return (
      corners.find((i) => boxes[i].innerText === "") ?? getAvailableMoves()[0]
    );
  }
  let best = -Infinity,
    move;
  for (let i of getAvailableMoves()) {
    boxes[i].innerText = player;
    let score = minimax(false);
    boxes[i].innerText = "";
    if (score > best) {
      best = score;
      move = i;
    }
  }
  return move;
}

function minimax(isMax) {
  const winner = checkVirtualWin("X") ? "X" : checkVirtualWin("O") ? "O" : null;
  if (winner === "X") return -1;
  if (winner === "O") return 1;
  if (getAvailableMoves().length === 0) return 0;

  if (isMax) {
    let best = -Infinity;
    for (let i of getAvailableMoves()) {
      boxes[i].innerText = "O";
      best = Math.max(best, minimax(false));
      boxes[i].innerText = "";
    }
    return best;
  } else {
    let best = Infinity;
    for (let i of getAvailableMoves()) {
      boxes[i].innerText = "X";
      best = Math.min(best, minimax(true));
      boxes[i].innerText = "";
    }
    return best;
  }
}

function checkVirtualWin(player) {
  return winPattern.some(
    ([a, b, c]) =>
      boxes[a].innerText === player &&
      boxes[b].innerText === player &&
      boxes[c].innerText === player
  );
}

boxes.forEach((box) => {
  box.addEventListener("click", () => {
    if (box.innerText || gameOver) return;
    if (!turnX && isAIEnabled()) return;

    // 🛠️ FIX THIS LOGIC
    const currentPlayer = turnX ? "X" : "O";
    const currentColor = turnX ? "#3f72af" : "#d80032";

    box.innerText = currentPlayer;
    box.style.color = currentColor;
    box.disabled = true;

    moveCount++;
    checkWinner();

    // Toggle turn
    if (!gameOver) {
      turnX = !turnX;
      turnDisplay.innerText = `${turnX ? "X" : "O"}'s Turn`;
      turnDisplay.style.color = turnX ? "#3f72af" : "#d80032";
    }

    // If AI and it’s now O’s turn, make AI move
    if (isAIEnabled() && !turnX && !gameOver) {
      setTimeout(makeAIMove, 0);
    }
  });
});

function checkWinner() {
  for (let [a, b, c] of winPattern) {
    let val = boxes[a].innerText;
    if (val && val === boxes[b].innerText && val === boxes[c].innerText) {
      boxes[a].classList.add("winning-box");
      boxes[b].classList.add("winning-box");
      boxes[c].classList.add("winning-box");
      msgBox.innerText = `${val} wins!`;
      winContainer.classList.remove("hide");
      boxes.forEach((b) => (b.disabled = true));
      gameOver = true;
      score[val]++;
      updateScoreboard();
      return;
    }
  }
  if (moveCount === 9) {
    msgBox.innerText = `It's a draw!`;
    winContainer.classList.remove("hide");
    gameOver = true;
    score.draw++;
    updateScoreboard();
  }
}

newGameBtn.addEventListener("click", resetBoard);
resetBoardBtn.addEventListener("click", resetBoard);
resetScoresBtn.addEventListener("click", () => {
  score = { X: 0, O: 0, draw: 0 };
  updateScoreboard();
});
modeSelect.addEventListener("change", resetBoard);
