var gamePieces = [];

// Define keys object to track key status
const keys = {
    a: { pressed: false },
    d: { pressed: false }
};

function startGame() {
    myGameArea.start();
    gamePieces.push(new component(30, 30, getRandomColor(), 120, 10)); //size, size, color, x, y. Push new piece into the array
}

// Keyboard input handling
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


// Game area
var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
        this.canvas.width = 300;
        this.canvas.height = 270;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20); // 50 FPS
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Component (Game Piece)
function component(width, height, color, x, y) {
    this.myGameArea = myGameArea;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.color = color;
    // this.hasLanded = false;

    this.update = function() {
        r = myGameArea.context;
        r.fillStyle = this.color;
        r.fillRect(this.x, this.y, this.width, this.height);
    }
    this.newPos = function() {
        this.x += this.speedX;

        // Prevent moving off left side
        if (this.x < 0) {
            this.x = 0;
        }

        // Prevent moving off right side
        if (this.x + this.width > myGameArea.canvas.width) {
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
        // let hasLanded = false; // Flag to track if piece has landed

        // Move only if not landed
        if (piece.y + piece.height < myGameArea.canvas.height) { // if piece hasn't landed, keep falling
            piece.y += 1; // falling motion
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
        if (lastPiece.y + lastPiece.height >= myGameArea.canvas.height || lastPiece.hasLanded) { // adding `lastPiece.hasLanded` ensures that a piece will spawn if last piece touches floor or another piece
            let randomX = Math.floor(Math.random() * (myGameArea.canvas.width - 30));
            gamePieces.push(new component(30, 30, getRandomColor(), randomX, 0));
        }
        
        // Check: if squares stack up to top of canvas, game ends
        if (lastPiece.y <= 0) { //if the top of last piece is less than or equal to top of canvas
            console.log("Game Over.")
            clearInterval(myGameArea.interval); // stop game
            document.getElementById("p").innerHTML = "Game Over.";
        }
    }


    // Control movement for last active piece
    if (gamePieces.length > 0) {
        let activePiece = gamePieces[gamePieces.length - 1];
        
        activePiece.speedX = 0; // Reset speed each frame

        // Move left
        if (keys.a.pressed) {
            activePiece.speedX = -2; // move left
        }
        
        // Move right
        if (keys.d.pressed) {
            activePiece.speedX = 2; // move right
        }
        activePiece.newPos();
    }
}

function exitProgram() {
    clearInterval(myGameArea.interval); // stop the game loop
    document.getElementById("p").innerHTML = "Game Ended.";
}