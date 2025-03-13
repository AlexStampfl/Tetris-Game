// const GRID_SIZE = 30; // size of one grid cell
// const PIECE_MARGIN = 2; // Space around pieces to reveal grid lines
var gamePieces = [];


// Define keys object to track key status
const keys = {
    a: { pressed: false },
    d: { pressed: false }
};

function startGame() {
    myGameArea.start();
    gamePieces.push(new component(26, 28, getRandomColor(), 120, 10)); //size, size, color, x, y. Push new piece into the array
    // gamePieces.push(new component(
    //     GRID_SIZE - PIECE_MARGIN, // Width fills the cell minus margin
    //     GRID_SIZE - PIECE_MARGIN, // Height fills the cell minus margin
    //     getRandomColor(),
    //     120,
    //     10
    //)); //size, size, color, x, y. Push new piece into the array
}

// Keyboard input handling - doesn't move anything, just tracks whether a key is being held down
window.addEventListener("keydown", function (e) {
    if (e.key === "a" || e.key === "A") {
        keys.a.pressed = true;
    }
    if (e.key === "d" || e.key === "D") {
        keys.d.pressed = true;
    }
});

window.addEventListener("keyup", function (e) {
    if (e.key === "a" || e.key === "A") {
        keys.a.pressed = false;
    }
    if (e.key === "d" || e.key === "D") {
        keys.d.pressed = false;
    }
})


// Create a grid of rows and columns, so pieces are horizontally "locked" into place
// each cell will be the width of a single box, which is currently 30
function gridContainer() {
    const gridContainer = document.getElementById("grid-container");
    const numRows = 3;
    const numCols = 3;
    
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            const gridItem = document.createElement('div');
            gridItem.classList.add('grid-item');
            gridItem.textContent = `${i}, ${j}`;
            gridContainer.appendChild(gridItem); 
        }
    }
}

// Game area (Canvas size)
var myGameArea = {
    canvas : document.createElement("canvas"),
    // grid : document.getElementById("grid-container"),
    drawGrid : function() {
        let ctx = this.context;
        ctx.strokeStyle = "white"; // white grid lines
        ctx.lineWith = 2; // Make grid lines thicker

        // Draw vertical Lines (columns)
        for (let x = 0; x <= this.canvas.width; x+= 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.canvas.height);
            ctx.stroke();
        }

        // Draw horizontal lines (rows)
        for (let y = 0; y <= this.canvas.height; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.canvas.width, y);
            ctx.stroke();
        }
    },
    start : function() {
        this.canvas.width = 300;
        this.canvas.height = 270;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20); // 50 FPS, Game refreshes every 20 milliseconds, or 50 frames per second
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Component (Game Piece) - this is where you define the shapes, size
function component(width, height, color, x, y) {
// function component(color, x, y) {
    this.myGameArea = myGameArea;
    this.width = width;
    this.height = height;
    // this.width = GRID_SIZE - PIECE_MARGIN; // Auto-fit width
    // this.height = GRID_SIZE - PIECE_MARGIN; // Auto-fit height
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.color = color;

    this.update = function() {
        r = myGameArea.context;
        r.fillStyle = this.color;
        r.fillRect(this.x, this.y, this.width, this.height);
    }
    this.newPos = function() {
        this.x += this.speedX;

        // Only snap to nearest 30px column when piece has landed
        if (this.speedY === 0) {
            this.x = Math.round(this.x / 30) * 30 + 2; // Shift by 1px
        }

        // Prevent piece from moving off left side
        if (this.x < 0) {
            this.x = 0;
        }

        // Prevent piece from moving off right side
        if (this.x + this.width > myGameArea.canvas.width) { // right side is greater (farther right) than the right canvas border
            this.x = myGameArea.canvas.width - this.width;
        }
    }
}

// Random colors for game pieces
function getRandomColor() {
    let r = Math.floor(Math.random() * 256); // Random red (0-255)
    let g = Math.floor(Math.random() * 256); // Random green (0-255)
    let b = Math.floor(Math.random() * 256); // Random blue (0-255)
    return `rgb(${r}, ${g}, ${b})`; // Return as RBG string
}

function updateGameArea() {
    myGameArea.clear();
    myGameArea.drawGrid(); // Draw grid before rendering process

    // Loop through all pieces in gamePieces
    // If piece hasn't landed, it keeps falling
    // if last piece lands, a new one is created

    /**
     * -- (0,0 coordinates start from top left corder) --
     * piece.y = top of piece
     * piece.y + piece.height = bottom of piece
     * piece.x = left side of piece 
     * piece.x + piece.width = right side of piece
     * 
     * X = 0 (farthest left)
     * Y = 0 (highest to the top)
     * 
     * if (piece.y > other.y) - piece is lower than other
     * if (piece.y < other.y) - piece is higher than other
     * if (piece.y + piece.height >= other.y) - piece's bottom passed other's top
     */

    for (let i = 0; i < gamePieces.length; i++) {
        let piece = gamePieces[i];

        // Move only if not landed
        if (piece.y + piece.height < myGameArea.canvas.height) { // if piece hasn't landed, keep falling
            piece.y += 1; // falling motion (apply gravity)
        } else {
            // If this piece is at bottom, create new piece
            if (i === gamePieces.length - 1) {
                let randomX = Math.floor(Math.random() * (myGameArea.canvas.width - 30));
                gamePieces.push(new component(30, 30, getRandomColor, randomX, 0));
            }
        }

        // Collision Detection Logic (Stacking)
        for (let j = 0; j <  gamePieces.length; j++) {
            let other = gamePieces[j]; // another piece in the game

            // Ensure piece isn't checking against itself
            if (piece != other) {
                // Check if piece is directly above another piece
                if (piece.y + piece.height >= other.y && // if piece's bottom is at or covering other piece's top 
                    piece.y < other.y &&
                    piece.x < other.x + other.width &&    // if piece's left side is less than other's right side
                    piece.x + piece.width > other.x) {    // if piece's right side is over other's left side

                    console.log(`Piece ${i} is stacking on top of Piece ${j}`);

                    piece.y = other.y - piece.height; // Snap to top of other piece
                    piece.speedY = 0; // Stop falling
                    piece.hasLanded = true; // this is required to make it work
                }
            }
        }

        piece.update();
    }

    if (gamePieces.length > 0) { // Make sure there's at least one piece
        let lastPiece = gamePieces[gamePieces.length - 1];
        // Check how new pieces are spawned
        if (lastPiece.y + lastPiece.height >= myGameArea.canvas.height || lastPiece.hasLanded) { // adding `lastPiece.hasLanded` ensures that a piece will spawn if last piece touches floor or another piece
            let randomX = Math.floor(Math.random() * (myGameArea.canvas.width - 30));
            // gamePieces.push(new component(30, 30, getRandomColor(), randomX, 0));
            gamePieces.push(new component(26, 26, getRandomColor(), randomX, 0));
        }
        
        // Check: if squares stack up to top of canvas, game ends
        if (lastPiece.y <= 0) { //if the top of last piece is less than or equal to top of canvas
            console.log("Game Over.")
            clearInterval(myGameArea.interval); // stop game
            document.getElementById("p").innerHTML = "Game Over. The pieces have stacked too high. ";
        }
    }


    // Control movement for last active piece
    if (gamePieces.length > 0) {
        let activePiece = gamePieces[gamePieces.length - 1];
        
        activePiece.speedX = 0; // Reset speed each frame

        // Move left
        if (keys.a.pressed) {
            // activePiece.speedX = -2; // move left
            activePiece.speedX -= 30; // Move exactly one column left
            keys.a.pressed = false; // Prevent holding key from moving too fast
        }
        
        // Move right
        if (keys.d.pressed) {
            // activePiece.speedX = 2; // move right
            activePiece.speedX += 30; // move right exactly one column
            keys.d.pressed = false; // Prevent holding key from moving too fast
        }
        activePiece.newPos();
    }
}

function exitProgram() {
    clearInterval(myGameArea.interval); // stop the game loop
    document.getElementById("p").innerHTML = "Game Ended.";
}