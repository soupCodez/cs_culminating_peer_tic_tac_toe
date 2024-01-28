// Define the Board class
function Board() {
  // Initialize a 6x7 grid filled with empty strings
  this.grid = Array.from({ length: 6 }, () => Array(7).fill(""));
}

// Declare variables for peer-to-peer connection
let peer;
let conn;

// Declare variables for game state
let win = false;
let drawn = false;

// Declare variables for winner
let winner = "";
let winnerText = "";

// Get URL parameters
let urlParams = window.location.search;
let getQuery = urlParams.split("?")[1];
let params = getQuery.split("&");

// Declare variables for users
let user;
let otherPeerId;

// Declare variables for counting yellow and red
let countYellow;
let countRed;

// Declare variables for color
let r, g, b, a;

// Set user and otherPeerId based on URL parameters
if (params[0] == "yellow") {
  otherPeerId = "red";
  user = "yellow";
} else if (params[0] == "red") {
  otherPeerId = "yellow";
  user = "red";
}

// Setup function for p5.js
function setup() {
  // Generate random colors
  r = random(255);
  g = random(100, 200);
  b = random(100);
  a = random(200, 255);

  // Create canvas and draw initial board
  createCanvas(700, 600);
  background("white");
  noFill();
  rect(0, 0, 700, 600);
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 6; j++) {
      rect(i * 100, j * 100, 100, 100);
    }
  }
  // Initialize game board
  gameBoard = new Board();

  // Create a new Peer object
  // codespaces
  // peer = new Peer(user, {
  //   host: "glorious-xylophone-w5544x6w4qxc9rp4-9000.app.github.dev",
  //   // port: 9000,
  //   path: "/peerjs/myapp",
  // });
  // local
  peer = new Peer(user, {
    host: "localhost",
    port: 9000,
    path: "/peerjs/myapp",
  });

  // Log the peer ID once it's ready
  peer.on("open", function (id) {
    console.log("My peer ID is: " + id);
  });

  // wait 3 seconds
  wait(3000);

  // Connect to the other peer
  conn = peer.connect(otherPeerId);

  // Listen for incoming connections
  peer.on("connection", function (connection) {
    conn = connection;
    console.log(conn);
  });
  if (conn) {
    // handle incoming data 
    conn.on("data", function (data) {
      if (data.grid) {
        // if the data is the grid, set the grid to the data
        handleData(data);
      } else if (data.x && data.y) {
        // if the data is the x and y coordinates, draw the symbol
        console.log(data); // log data for debug purposes
        // based on the color, draw a circle on the coordinates sent
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
        // if the data is the winner, set the winner to the data
        win = true;
        winnerText = data.winner;
        // display winner text
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
    // if there is a winner, stop the loop and send the winner to the other peer
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
    // if the game is drawn
    console.log(`The game has been drawn`);
  }

  // Loop over each column
  for (let i = 0; i < 7; i++) {
    // Loop over the first three rows
    for (let j = 0; j < 3; j++) {
      // Check for a vertical win (four in a row vertically)
      if (
        checkWin(
          gameBoard.grid[j][i],
          gameBoard.grid[j + 1][i],
          gameBoard.grid[j + 2][i],
          gameBoard.grid[j + 3][i]
        )
      ) {
        // If there's a win, set the winner and the win flag
        winner = gameBoard.grid[j][i];
        win = true;
      }
    }
  }

  // Loop over the first four columns
  for (let i = 0; i < 4; i++) {
    // Loop over each row
    for (let j = 0; j < 6; j++) {
      // Check for a horizontal win (four in a row horizontally)
      if (
        checkWin(
          gameBoard.grid[j][i],
          gameBoard.grid[j][i + 1],
          gameBoard.grid[j][i + 2],
          gameBoard.grid[j][i + 3]
        )
      ) {
        // If there's a win, set the winner and the win flag
        winner = gameBoard.grid[j][i];
        win = true;
      }
    }
  }

  // Loop over the first three rows
  for (let i = 0; i < 3; i++) {
    // Loop over the first four columns
    for (let j = 0; j < 4; j++) {
      // Check for a diagonal win (four in a row diagonally from top-left to bottom-right)
      if (
        checkWin(
          gameBoard.grid[i][j],
          gameBoard.grid[i + 1][j + 1],
          gameBoard.grid[i + 2][j + 2],
          gameBoard.grid[i + 3][j + 3]
        )
      ) {
        // If there's a win, set the winner and the win flag
        winner = gameBoard.grid[i][j];
        win = true;
      }
    }
  }

  // Loop over the first three rows
  for (let i = 0; i < 3; i++) {
    // Loop over the last four columns
    for (let j = 3; j < 7; j++) {
      // Check for a diagonal win (four in a row diagonally from top-right to bottom-left)
      if (
        checkWin(
          gameBoard.grid[i][j],
          gameBoard.grid[i + 1][j - 1],
          gameBoard.grid[i + 2][j - 2],
          gameBoard.grid[i + 3][j - 3]
        )
      ) {
        // If there's a win, set the winner and the win flag
        winner = gameBoard.grid[i][j];
        win = true;
      }
    }
  }

  // Check if all cells are filled and there's no win, i.e., the game is a draw
  if (
    gameBoard.grid.every((row) => row.every((cell) => cell !== "")) &&
    win === false
  ) {
    drawn = true;
  }
}

// Function to check for a win condition
function checkWin(a, b, c, d) {
  // Returns true if all four cells are the same and not empty
  return a !== "" && a === b && b === c && c === d;
}

// This function is triggered when the mouse is pressed
function mousePressed(e) {
  // Count the number of yellow pieces on the board
  let countYellow = gameBoard.grid.reduce((total, subArray) => {
    return (
      total +
      subArray.reduce((subTotal, item) => {
        return subTotal + (item === "yellow" ? 1 : 0);
      }, 0)
    );
  }, 0);

  // Count the number of red pieces on the board
  let countRed = gameBoard.grid.reduce((total, subArray) => {
    return (
      total +
      subArray.reduce((subTotal, item) => {
        return subTotal + (item === "red" ? 1 : 0);
      }, 0)
    );
  }, 0);

  // Check whose turn it is based on the number of pieces on the board
  function checkTurn() {
    if (user == "yellow" && countYellow == countRed) {
      return true;
    } else if (user == "red" && countRed < countYellow) {
      return true;
    } else {
      return false;
    }
  }

  // If there's no win and it's the user's turn
  if (win != true && checkTurn()) {
    // Loop over each column
    for (let i = 0; i < 7; i++) {
      const colX = i * 100;
      const colY = 0;
      const rowY = (gameBoard.grid.length - 1) * 100;

      // If the mouse click is within the column
      if (
        mouseX > colX &&
        mouseX < colX + 100 &&
        mouseY > colY &&
        mouseY < rowY
      ) {
        // Loop from the bottom of the column
        for (let j = gameBoard.grid.length - 1; j >= 0; j--) {
          // If the cell is empty
          if (gameBoard.grid[j][i] === "") {
            // Drop the piece in the cell
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
  // Send the updated game board to the other player
  if (conn) {
    conn.send({ grid: gameBoard.grid });
  }
}

// This function draws the piece on the board
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
// Handle incoming data, called when data type is grid
function handleData(data) {
  console.log(data); // log data for debug purposes
  gameBoard.grid = data.grid; // set the grid to the data
}

// This function causes the program to wait for a specified number of milliseconds
function wait(ms) {
  // Get the current time
  var start = new Date().getTime();
  var end = start;
  
  // Loop until the specified number of milliseconds have passed
  while (end < start + ms) {
    // Continuously update the end time
    end = new Date().getTime();
  }
}