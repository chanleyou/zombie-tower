var gameBoard = document.querySelector("#game-board");
var floorDisplay = document.querySelector("#floor-display");
var lifeDisplay = document.querySelector("#life-display");
var lifeNumber = document.querySelector("#life-number");

var playerFloor = 1;
var playerLife = 100;
var playerBombs = 0;

var beatsPerMinute = 90;
var tick = 60000 / beatsPerMinute;
var enemyTick;

var playerTile;
var boardArray = [];


var createBoard = function (rows, columns) {
  boardArray = [];

  for (var i = 0; i < rows; i++) {
    var thisRow = [];
    var newRow = document.createElement("div");
    gameBoard.appendChild(newRow);
    newRow.classList.add("board-row");
    for (var y = 0; y < columns; y++) {
      var newSquare = document.createElement("div");
      newRow.appendChild(newSquare);
      newSquare.classList.add("game-square");
      thisRow.push(newSquare);
    }
    boardArray.push(thisRow);
  }
}

var getPlayerTile = function () {
  for (var y = 0; y < boardArray.length; y++) {
    if (boardArray[y].indexOf(playerTile) > -1) {
      return {
        yAxis: y,
        xAxis: boardArray[y].indexOf(playerTile)
      }
    }
  }
}

var movePlayer = function (event) {

  var y = getPlayerTile().yAxis;
  var x = getPlayerTile().xAxis;

  var keyPressed = event.keyCode;
  switch (keyPressed) {
    case 87: // w
      attemptMove (y - 1, x);
      break;
    case 83: // s
      attemptMove(y + 1, x);
      break;
    case 65: // a
      attemptMove(y, x - 1);
      break;
    case 68: // d
      attemptMove(y, x + 1);
      break;
    case 82: // r
      if (playerBombs > 0) {
        useBomb();
      }
      break;
  }
}

populateBoard = function () {
  randomStart = Math.floor(Math.random()*4);

  switch (randomStart) {
    case 0:
      playerTile = boardArray[0][0];
      boardArray[7][9].classList.add("next-floor");
      break;
    case 1:
      playerTile = boardArray[0][9];
      boardArray[7][0].classList.add("next-floor");
      break;
    case 2:
      playerTile = boardArray[7][9];
      boardArray[0][0].classList.add("next-floor");
      break;
    default:
      playerTile = boardArray[7][0];
      boardArray[0][9].classList.add("next-floor");
      break;
  }
  playerTile.classList.add("player-tile");

  //at least 1 enemy per floor
  var enemyRandomRow = 3 + Math.floor(Math.random()*4);
  var enemyRandomColumn = 3 + Math.floor(Math.random()*6);
  boardArray[enemyRandomRow][enemyRandomColumn].classList.add("enemy-tile");

  // generates more stuff the higher you go
  for (i = 0; i < Math.floor(playerFloor/2); i++) {
    var randomChoice = Math.floor(Math.random()*3);
    var randomRow;
    var randomColumn;
    var selectedTile;

    // avoids tiles with something and potential player/exit tiles
    do {
      randomRow = Math.floor(Math.random()*8);
      randomColumn = Math.floor(Math.random()*10);
      selectedTile = boardArray[randomRow][randomColumn];
    } while (selectedTile.classList.contains("has-obstacle") ||
    (randomRow < 2 && randomColumn < 2) ||
    (randomRow > 5 && randomColumn < 2) ||
    (randomRow < 2 && randomColumn > 7) ||
    (randomRow > 5 && randomColumn > 7))

    switch (randomChoice) {
      case 0:
        boardArray[randomRow][randomColumn].classList.add("warning-tile");
        break;
      case 1:
        boardArray[randomRow][randomColumn].classList.add("danger-tile");
        break;
      case 2:
        boardArray[randomRow][randomColumn].classList.add("enemy-tile");
    }
    selectedTile.classList.add("has-obstacle");
  }

  // 12.5% chance of generating a random power up every floor
  var randomPowerup = Math.floor(Math.random()*16);
  var randomPowerupRow;
  var randomPowerupColumn;
  var powerupTile;

  if (randomPowerup < 2) {
    do {
      randomPowerupRow = Math.floor(Math.random()*8);
      randomPowerupColumn = Math.floor(Math.random()*10);
      powerupTile = boardArray[randomPowerupRow][randomPowerupColumn];
    } while (powerupTile.classList.contains("has-obstacle") ||
    powerupTile.classList.contains("next-floor") ||
    powerupTile.classList.contains("player-tile"))

    if (randomPowerup === 0) {
      powerupTile.classList.add("med-pack");
    } else {
      powerupTile.classList.add("bomb");
    }
  }
}

// removing all children 1 by 1 is computationally faster than using innerHTML = ""
newFloor = function () {
  gameBoard.innerHTML = "";
  createBoard(8, 10);
  populateBoard();
}

var nextFloor = function () {
  playerFloor++;
  newFloor();
  updatePlayerFloor();
  clearInterval(enemyTick);
  setTimeout(function() {
    enemyTick = setInterval(tickFunction, tick);
  }, 250);
}

var gameOver = function () {
  playerTile.style.backgroundImage = `url("./images/sad-face.png")`;
  window.removeEventListener("keydown", movePlayer);
  clearInterval(enemyTick);
  document.querySelector("#play-again").style.display = "inline-block";
}

var updatePlayerFloor = function () {
  floorDisplay.textContent = playerFloor;
}

var updatePlayerLife = function () {
  lifeDisplay.textContent = playerLife;

  if (playerLife <= 0) {
    lifeDisplay.style.color= "grey";
  } else if (playerLife <= 30) {
    lifeDisplay.style.color = "red";
  } else if (playerLife <= 50) {
    lifeDisplay.style.color = "yellow";
  } else {
      lifeDisplay.style.color = "white";
  }
  return playerLife;
}

var updatePlayerBombs = function () {
  document.querySelector("#bombs-display").textContent = "";
  if (playerBombs > 0) {
    for (var i = 0; i < playerBombs; i++) {
      document.querySelector("#bombs-display").textContent += "!";
    }
  }
}

var useBomb = function () {
  playerBombs --;
  updatePlayerBombs();
  allEnemies = document.querySelectorAll(".enemy-tile");

  for (var i = 0; i < allEnemies.length; i++) {
    allEnemies[i].classList.remove("enemy-tile");
  }
}

// takes in damage as parameter and returns true if player died, false otherwise
var playerLoseLife = function (damage) {
  playerLife -= damage;
  updatePlayerLife();

  if (playerLife <= 0) {
    gameOver ();
    return true;
  } else {
    playerTile.style.backgroundImage = `url("./images/sad-face.png")`;
    return false;
  }
}

// return true if movement if possible
var attemptMove = function (y, x) {

  if (y < 0 || x < 0 || y >= boardArray.length || x >= boardArray[0].length) {
    console.log("Movement failed due to exceeding boundaries of grid.");
    return;
  }

  var targetTile = boardArray[y][x];

  playerTile.style.backgroundImage = ""; // removes sad face after taking dmg
  playerTile.classList.remove("player-tile");
  targetTile.classList.add("player-tile");
  playerTile = targetTile;

  if (targetTile.classList.contains("enemy-tile")) {
    console.log("Player entering enemy tile.");
    if (playerLoseLife(5)) {
      return;
    }
    targetTile.classList.remove("enemy-tile");
  }

  if (targetTile.classList.contains("med-pack")) {
    console.log("Player picked up a med pack.");
    playerLife += 15;
    updatePlayerLife();
    document.querySelector('.med-pack').classList.remove("med-pack");
  }

  if (targetTile.classList.contains("bomb")) {
    console.log("Player picked up a bomb.");
    playerBombs ++;
    updatePlayerBombs();
    document.querySelector('.bomb').classList.remove("bomb");
  }

  if (targetTile.classList.contains("warning-tile")) {
    console.log("Player entering warning tile.");
    if (playerLoseLife(1)) {
      return;
    }
  } else if (targetTile.classList.contains("danger-tile")) {
    console.log("Player entering danger tile.");
    if (playerLoseLife(10)) {
      return;
    }
  } else if (targetTile.classList.contains("next-floor")) {
    console.log("Player entering next floor tile.");
    nextFloor();
    return;
  }
}

// makes enemies chase the player
var tickFunction = function () {
  var enemies = document.querySelectorAll(".enemy-tile");

  for (var i = 0; i < enemies.length; i++) {
    var thisEnemy = enemies[i];
    var yThisEnemy;
    var xThisEnemy;

    for (var y = 0; y < boardArray.length; y++) {
      if (boardArray[y].indexOf(thisEnemy) > -1) {
        yThisEnemy = y;
        xThisEnemy = boardArray[y].indexOf(thisEnemy);
        break;
      }
    }

    var yOffset = yThisEnemy - getPlayerTile().yAxis;
    var xOffset = xThisEnemy - getPlayerTile().xAxis;

    var targetTile;

    // randomises whether enemies chase via x or y axis
    var randomXYFirst = Math.floor(Math.random()*2);
    if (randomXYFirst === 1) {
      if (yOffset > 0) {
        targetTile = boardArray[yThisEnemy - 1][xThisEnemy];
      } else if (yOffset < 0) {
        targetTile = boardArray[yThisEnemy + 1][xThisEnemy];
      } else if (xOffset > 0) {
        targetTile = boardArray[yThisEnemy][xThisEnemy - 1];
      } else if (xOffset < 0) {
        targetTile = boardArray[yThisEnemy][xThisEnemy + 1];
      }
    } else {
      if (xOffset > 0) {
        targetTile = boardArray[yThisEnemy][xThisEnemy - 1];
      } else if (xOffset < 0) {
        targetTile = boardArray[yThisEnemy][xThisEnemy + 1];
      } else if (yOffset > 0) {
        targetTile = boardArray[yThisEnemy - 1][xThisEnemy];
      } else if (yOffset < 0) {
        targetTile = boardArray[yThisEnemy + 1][xThisEnemy];
      }
    }

    if (targetTile.classList.contains("enemy-tile")) {
    } else {
      thisEnemy.classList.remove("enemy-tile");
    } if (targetTile.classList.contains("player-tile")) {
      playerLoseLife(5);
    } else {
      targetTile.classList.add("enemy-tile");
    }
  }
}

var startGame = function () {
  updatePlayerLife();
  updatePlayerFloor();
  newFloor();
  window.addEventListener("keydown", movePlayer);
  enemyTick = setInterval(tickFunction, tick);
  document.querySelector("#stats-display").style.visibility = "visible";
  document.querySelector("#instructions").style.display = "none";
  document.querySelector("#start-button").style.display = "none";
}

window.onload = function () {
  document.querySelector("#start-button").addEventListener("click", startGame);
  document.querySelector("#play-again").addEventListener("click", newGame);

}

var newGame = function () {
  playerLife = 100;
  playerFloor = 1;
  playerBombs = 0;
  startGame();
  document.querySelector("#play-again").style.display="none";
}
