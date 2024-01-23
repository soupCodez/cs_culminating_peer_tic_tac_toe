function Board() {
  this.grid = Array.from({ length: 6 }, () => Array(7).fill(""));
}

let peer;
let conn;

let win = false;
let drawn = false;

let winner = "";
let winnerText = "";

let urlParams = window.location.search;
let getQuery = urlParams.split("?")[1];
let params = getQuery.split("&");

let user;
let otherPeerId;

let countYellow;
let countRed;

let r, g, b, a;

if (params[0] == "yellow") {
  otherPeerId = "red";
  user = "yellow";
} else if (params[0] == "red") {
  otherPeerId = "yellow";
  user = "red";
}

function setup() {
  r = random(255);
  g = random(100, 200);
  b = random(100);
  a = random(200, 255);

  createCanvas(700, 600);
  background("white");
  noFill();
  rect(0, 0, 700, 600);
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 6; j++) {
      rect(i * 100, j * 100, 100, 100);
    }
  }
  gameBoard = new Board();

  // Create a new Peer object
  peer = new Peer(user, {
    host: "localhost",
    port: 9000,
    path: "/peerjs/myapp",
  });

  // Log the peer ID once it's ready
  peer.on("open", function (id) {
    console.log("My peer ID is: " + id);
  });

  wait(3000);

  conn = peer.connect(otherPeerId);

  // Listen for incoming connections
  peer.on("connection", function (connection) {
    conn = connection;
    console.log(conn);
  });
  if (conn) {
    conn.on("data", function (data) {
      if (data.grid) {
        handleData(data);
      } else if (data.x && data.y) {
        console.log(data);
        if (otherPeerId == "yellow") {
          stroke("yellow");
          fill("yellow");
          circle(data.x, data.y, 80);
          noFill();
          noStroke();
        } else if (otherPeerId == "red") {
          stroke("red");
          fill("red");
          circle(data.x, data.y, 80);
          noFill();
          noStroke();
        }
      } else if (data.winner) {
        win = true;
        winnerText = data.winner;
        fill(r, g, b, a);
        stroke(r, g, b, a);
        text(winnerText + " has won", 300, 300);
      }
    });
  }
}

function draw() {
  noFill();
  if (win) {
    noLoop();
    if (winner == "yellow") {
      winnerText = "yellow";
    } else {
      winnerText = "red";
    }
    console.log(`${winnerText} has won`);
    conn.send({ winner: winnerText });
    textSize(32);
    fill(r, g, b, a);
    stroke(r, g, b, a);
    text(winnerText + " has won", 300, 300);
  } else if (drawn) {
    console.log(`The game has been drawn`);
  }

  // redraw();

  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 3; j++) {
      if (
        checkWin(
          gameBoard.grid[j][i],
          gameBoard.grid[j + 1][i],
          gameBoard.grid[j + 2][i],
          gameBoard.grid[j + 3][i]
        )
      ) {
        winner = gameBoard.grid[j][i];
        win = true;
      }
    }
  }
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 6; j++) {
      if (
        checkWin(
          gameBoard.grid[j][i],
          gameBoard.grid[j][i + 1],
          gameBoard.grid[j][i + 2],
          gameBoard.grid[j][i + 3]
        )
      ) {
        winner = gameBoard.grid[j][i];
        win = true;
      }
    }
  }
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      if (
        checkWin(
          gameBoard.grid[i][j],
          gameBoard.grid[i + 1][j + 1],
          gameBoard.grid[i + 2][j + 2],
          gameBoard.grid[i + 3][j + 3]
        )
      ) {
        winner = gameBoard.grid[i][j];
        win = true;
      }
    }
  }
  for (let i = 0; i < 3; i++) {
    for (let j = 3; j < 7; j++) {
      if (
        checkWin(
          gameBoard.grid[i][j],
          gameBoard.grid[i + 1][j - 1],
          gameBoard.grid[i + 2][j - 2],
          gameBoard.grid[i + 3][j - 3]
        )
      ) {
        winner = gameBoard.grid[i][j];
        win = true;
      }
    }
  }
  if (
    gameBoard.grid.every((row) => row.every((cell) => cell !== "")) &&
    win === false
  ) {
    drawn = true;
  }
}

function checkWin(a, b, c, d) {
  return a !== "" && a === b && b === c && c === d;
}

function mousePressed(e) {
  let countYellow = gameBoard.grid.reduce((total, subArray) => {
    return (
      total +
      subArray.reduce((subTotal, item) => {
        return subTotal + (item === "yellow" ? 1 : 0);
      }, 0)
    );
  }, 0);

  let countRed = gameBoard.grid.reduce((total, subArray) => {
    return (
      total +
      subArray.reduce((subTotal, item) => {
        return subTotal + (item === "red" ? 1 : 0);
      }, 0)
    );
  }, 0);

  function checkTurn() {
    if (user == "yellow" && countYellow == countRed) {
      return true;
    } else if (user == "red" && countRed < countYellow) {
      return true;
    } else {
      return false;
    }
  }

  if (win != true && checkTurn()) {
    for (let i = 0; i < 7; i++) {
      const colX = i * 100;
      const colY = 0;
      const rowY = (gameBoard.grid.length - 1) * 100;

      if (
        mouseX > colX &&
        mouseX < colX + 100 &&
        mouseY > colY &&
        mouseY < rowY
      ) {
        for (let j = gameBoard.grid.length - 1; j >= 0; j--) {
          if (gameBoard.grid[j][i] === "") {
            gameBoard.grid[j][i] = user;
            drawSymbol(i * 100 + 50, j * 100 + 50);
            conn.send({ x: i * 100 + 50, y: j * 100 + 50 });
            break;
          }
        }
      }
    }
  }
  noFill();
  if (conn) {
    conn.send({ grid: gameBoard.grid });
  }
}
function drawSymbol(x, y) {
  if (user == "yellow") {
    stroke("yellow");
    fill("yellow");
    circle(x, y, 80);
  } else if (user == "red") {
    stroke("red");
    fill("red");
    circle(x, y, 80);
  }
}

// Handle incoming data
function handleData(data) {
  console.log(data);
  gameBoard.grid = data.grid;
}

// function redraw(data) {
//   background("white");
//   noFill();
//   rect(0, 0, 700, 600);
//   for (let i = 0; i < 7; i++) {
//     for (let j = 0; j < 6; j++) {
//       rect(i * 100, j * 100, 100, 100);
//       if (gameBoard.grid[j][i] === "yellow") {
//         fill("yellow");
//         circle(i * 100 + 50, j * 100 + 50, 80);
//       } else if (gameBoard.grid[j][i] === "red") {
//         fill("red");
//         circle(i * 100 + 50, j * 100 + 50, 80);
//       }
//       noFill();
//     }
//   }
// }

function wait(ms) {
  var start = new Date().getTime();
  var end = start;
  while (end < start + ms) {
    end = new Date().getTime();
  }
}
