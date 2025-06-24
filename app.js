let resetbtn = document.querySelector(".reset");
let boxes = document.querySelectorAll(".btn");
let message = document.querySelector(".msg");
let container = document.querySelector(".win");
let newGame = document.querySelector(".new");
let turnDisplay = document.getElementById("turn-indicator");
let modeSelect = document.getElementById("mode");

const winPattern = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

let turnX = true;
let moveCount = 0;
let isGameOver = false;

function resetBoard() {
  boxes.forEach((box) => {
    box.disabled = false;
    box.innerText = "";
    box.style.color = "#3f72af";
  });
  turnX = true;
  moveCount = 0;
  isGameOver = false;
  container.classList.add("hide");
  resetbtn.classList.remove("hide");
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
  return [...boxes].map((b, i) => b.innerText === "" ? i : null).filter(i => i !== null);
}

function makeAIMove() {
  if (isGameOver) return;

  let index;
  const available = getAvailableMoves();

  switch (currentAIType()) {
    case "easy":
      index = available[Math.floor(Math.random() * available.length)];
      break;
    case "medium":
      index = getMediumAIMove();
      break;
    case "hard":
      index = getBestMove("O");
      break;
  }

  setTimeout(() => {
    if (index !== undefined) {
      boxes[index].innerText = "O";
      boxes[index].style.color = "#d80032";
      boxes[index].disabled = true;
      moveCount++;
      turnX = true;
      turnDisplay.innerText = "X's Turn";
      turnDisplay.style.color = "#3f72af";
      checkWinner();
    }
  }, 400);
}

function getMediumAIMove() {
  const available = getAvailableMoves();

  // Try to win
  for (let i of available) {
    boxes[i].innerText = "O";
    if (checkSimulatedWin("O")) {
      boxes[i].innerText = "";
      return i;
    }
    boxes[i].innerText = "";
  }

  // Try to block
  for (let i of available) {
    boxes[i].innerText = "X";
    if (checkSimulatedWin("X")) {
      boxes[i].innerText = "";
      return i;
    }
    boxes[i].innerText = "";
  }

  // Else, random
  return available[Math.floor(Math.random() * available.length)];
}

function checkSimulatedWin(player) {
  return winPattern.some(([a, b, c]) =>
    boxes[a].innerText === player &&
    boxes[b].innerText === player &&
    boxes[c].innerText === player
  );
}

function getBestMove(player) {
  let bestScore = -Infinity;
  let move;
  for (let i of getAvailableMoves()) {
    boxes[i].innerText = player;
    let score = minimax(false);
    boxes[i].innerText = "";
    if (score > bestScore) {
      bestScore = score;
      move = i;
    }
  }
  return move;
}

function minimax(isMaximizing) {
  const winner = checkVirtualWinner();
  if (winner === "O") return 1;
  if (winner === "X") return -1;
  if (getAvailableMoves().length === 0) return 0;

  if (isMaximizing) {
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

function checkVirtualWinner() {
  for (let [a, b, c] of winPattern) {
    let val1 = boxes[a].innerText;
    let val2 = boxes[b].innerText;
    let val3 = boxes[c].innerText;
    if (val1 && val1 === val2 && val1 === val3) return val1;
  }
  return null;
}

boxes.forEach((box, idx) => {
  box.addEventListener("click", () => {
    if (isGameOver || box.innerText !== "") return;

    if (turnX) {
      box.innerText = "X";
      box.style.color = "#3f72af";
      box.disabled = true;
      moveCount++;
      turnX = false;
      turnDisplay.innerText = "O's Turn";
      turnDisplay.style.color = "#d80032";
      checkWinner();

      if (isAIEnabled() && !isGameOver) makeAIMove();
    }
  });
});

function checkWinner() {
  for (let pattern of winPattern) {
    let [a, b, c] = pattern;
    let val1 = boxes[a].innerText;
    let val2 = boxes[b].innerText;
    let val3 = boxes[c].innerText;

    if (val1 && val1 === val2 && val1 === val3) {
      displayMessage(val1);
      return;
    }
  }

  if (moveCount === 9) {
    displayMessage("draw");
  }
}

function displayMessage(player) {
  isGameOver = true;
  if (player === "draw") {
    message.innerText = `It's a Draw!`;
  } else {
    message.innerText = `${player} wins!`;
  }

  container.classList.remove("hide");
  resetbtn.classList.add("hide");
  boxes.forEach((box) => (box.disabled = true));
}

resetbtn.addEventListener("click", resetBoard);
newGame.addEventListener("click", resetBoard);
modeSelect.addEventListener("change", resetBoard);
