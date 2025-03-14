var gamePieces = [];
var barrierPieces = []; // New array for barrier pieces

function adjustColor(color, amount, lighten = true) {
    let match = color.match(/\d+/g); // Extract RGB values
    if (!match) return color;
    let r = parseInt(match[0]);
    let g = parseInt(match[1]);
    let b = parseInt(match[2]);
    if (lighten) {
        r = Math.min(255, r + amount);
        g = Math.min(255, g + amount);
        b = Math.min(255, b + amount);
    } else {
        r = Math.max(0, r - amount);
        g = Math.max(0, g - amount);
        b = Math.max(0, b - amount);
    }
    let newColor = `rgb(${r}, ${g}, ${b})`;
    console.log(`Adjusted ${color} to ${newColor} (lighten=${lighten})`);
    return newColor;
}

// Define keys object to track key status
const keys = {
    a: { pressed: false },
    d: { pressed: false }
};

function startGame() {
    myGameArea.start();

    const cellSize = 30;
    const canvasWidth = myGameArea.canvas.width;
    const canvasHeight = myGameArea.canvas.height;

    // Top row
    for (let x = 0; x < canvasWidth; x += cellSize) {
        barrierPieces.push(new component(30, 30, "rgb(128, 128, 128)", x, 0));
    }
    // Bottom row
    for (let x = 0; x < canvasWidth; x += cellSize) {
        barrierPieces.push(new component(30, 30, "rgb(128, 128, 128)", x, canvasHeight - cellSize + 9));
    }
    // Left column
    for (let y = cellSize; y < canvasHeight - cellSize;y += cellSize) {
        barrierPieces.push(new component(30, 30, "rgb(128, 128, 128)", 0, y));
    }
    // Right column
    for (let y = cellSize; y < canvasHeight - cellSize; y += cellSize) {
        barrierPieces.push(new component(30, 30, "rgb(128, 128, 128)", canvasWidth - cellSize, y));
    }
    // Start game with the first piece
    gamePieces.push(new component(26, 30, getRandomColor(), Math.round(120 / 30) * 30, 30)); // Width: 26, Height: 30
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

        // Draw T E T R I S text
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const text = "TETRIS";
        const startX = 60;
        const startY = 150;
        const cellSize = 30;
        const offset = cellSize / 2; // center the text in each cell (15px)
        for (let i = 0; i < text.length; i++) {
            let letter = text[i];
            if (letter !== " ") {
                ctx.fillText(letter, startX + i * cellSize + offset, startY + offset);
                // ctx.fillText(letter, startX + i * 30, startY);
            }
        }



    },
    start : function() {
        this.canvas.width = 300;
        this.canvas.height = 500;
        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        this.paused = false; // Add paused flag
        this.interval = setInterval(updateGameArea, 20); // 50 FPS, Game refreshes every 20 milliseconds, or 50 frames per second
    },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Component (Game Piece) - this is where you define the shapes, size
function component(width, height, color, x, y) 
{
    this.myGameArea = myGameArea;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.color = color;
    this.hasLanded = false; // new change

    this.update = function() {
        let ctx = myGameArea.context;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    
        // Apply inset effect only for grey barrier pieces
        // if (this.color === "rgb(128, 128, 128)") { // changing to RGB made the gray barrier inset effect work
        //     console.log("Applying inset effect for grey piece at", this.x, this.y);

            // Apply inset effect to all pieces, not just grey barrier
            let highlightColor = adjustColor(this.color, 60, true); // Lighter for top and left
            let shadowColor = adjustColor(this.color, 60, false); // Darker for bottom and right
            let borderWidth = 2.5; // Thickness of inset border
    
            // Top highlight
            ctx.fillStyle = highlightColor;
            ctx.fillRect(this.x, this.y, this.width, borderWidth); // Top edge
    
            // Left highlight
            ctx.fillRect(this.x, this.y, borderWidth, this.height); // Left edge
    
            // Bottom shadow
            ctx.fillStyle = shadowColor;
            ctx.fillRect(this.x, this.y + this.height - borderWidth, this.width, borderWidth); // Bottom edge
    
            // Right shadow
            ctx.fillRect(this.x + this.width - borderWidth, this.y, borderWidth, this.height); // Right edge
    };



    this.newPos = function() {
        this.x += this.speedX;
        // new change
        this.x = Math.round(this.x / 30) * 30; // snap to grid always
        if (this.x < 30) this.x = 30;
        if (this.x + this.width > myGameArea.canvas.width - 30) this.x = myGameArea.canvas.width - 60;
    }
}

// Random colors for game pieces
function getRandomColor() {
    let r = Math.floor(Math.random() * 121) + 100; // Random red (100-220)
    let g = Math.floor(Math.random() * 121) + 100; // Random green (100-220)
    let b = Math.floor(Math.random() * 121) + 100; // Random blue (100-220)
    
    return `rgb(${r}, ${g}, ${b})`; // Return as RBG string
}

// function getRandomColor() {
//     let r = Math.floor(Math.random() * 256); // Random red (0-255)
//     let g = Math.floor(Math.random() * 256); // Random green (0-255)
//     let b = Math.floor(Math.random() * 256); // Random blue (0-255)
//     return `rgb(${r}, ${g}, ${b})`; // Return as RBG string
// }

function updateGameArea() {
    if (myGameArea.paused) return; // Skip updates if paused

    myGameArea.clear();
    myGameArea.drawGrid(); // Draw grid before rendering process

    // Draw barrier pieces
    for (let i = 0; i < barrierPieces.length; i++) {
        barrierPieces[i].update();
    }
 
    for (let i = 0; i < gamePieces.length; i++) {
        let piece = gamePieces[i];

        // Move only if not landed
        if (!piece.hasLanded) {
            piece.y += 1; // Apply gravity
        }

        // Collision Detection with other game pieces
        for (let j = 0; j <  gamePieces.length; j++) {
            let other = gamePieces[j]; // another piece in the game
            if (piece != other && !piece.hasLanded) {
                if (
                    piece.y + piece.height >= other.y && // if piece's bottom is at or covering other piece's top 
                    piece.y < other.y &&
                    piece.x < other.x + other.width &&    // if piece's left side is less than other's right side
                    piece.x + piece.width > other.x
                ) {
                    piece.y = other.y - piece.height; // Snap to top of other piece
                    piece.y = Math.round(piece.y / 30) * 30;
                    piece.hasLanded = true; // this is required to make it work
                    console.log(`Piece ${i} landed on another piece at ${piece.y}`);
                }
            }
        }


        // Collision detection with barrier pieces
        for (let j = 0; j < barrierPieces.length; j++) {
            let barrier = barrierPieces[j];
            if (!piece.hasLanded && piece.y < myGameArea.canvas.height - 30) {
                if (
                    piece.y + piece.height >= barrier.y &&
                    piece.y < barrier.y &&
                    piece.x < barrier.x + barrier.width &&
                    piece.x + piece.width > barrier.x
                ) {
                    piece.y = barrier.y - piece.height; // snap to top of barrier
                    piece.y = Math.round(piece.y / 30) * 30; // Snap to grid
                    piece.hasLanded = true; // Mark as landed
                    console.log(`Piece ${i} hit barrier at ${barrier.x}, ${barrier.y}`);
                }
            }
        }
 
        piece.update();
    }

    if (gamePieces.length > 0) { // Make sure there's at least one piece
        let lastPiece = gamePieces[gamePieces.length - 1];
        if (lastPiece.hasLanded) {
            let randomX = Math.floor(Math.random() * (myGameArea.canvas.width / 30 - 2)) * 30 + 30;
            // let randomX = Math.floor(Math.random() * (myGameArea.canvas.width - 60) + 30);
            gamePieces.push(new component(26, 30, getRandomColor(), randomX, 30));
        }

        if (lastPiece.hasLanded && lastPiece.y <=30) {
            console.log("Game over - pieces stacked too high");
            clearInterval(myGameArea.interval);
            document.getElementById("p").innerHTML = "Game Over. The pieces stacked too high";
        }
     }


    // Control movement for last active piece
    if (gamePieces.length > 0) {
        let activePiece = gamePieces[gamePieces.length - 1];
        if (!activePiece.hasLanded) {
            activePiece.speedX = 0; // Reset speed each frame
            // Move left
            if (keys.a.pressed) {
                // activePiece.speedX = -2; // move left
                activePiece.speedX -= 30; // Move exactly one column left
                keys.a.pressed = false; // Prevent holding key from moving too fast
            }
            // Move right
            if (keys.d.pressed) {
                activePiece.speedX += 30; // move right exactly one column
                keys.d.pressed = false; // Prevent holding key from moving too fast
            }
            activePiece.newPos();
        }
    }
}

// Add this at the bottom of your script, after updateGameArea
function togglePause() {
    myGameArea.paused = !myGameArea.paused; // Toggle pause state
    const pauseButton = document.getElementById("pause");
    if (myGameArea.paused) {
        clearInterval(myGameArea.interval); // Stop the game loop
        pauseButton.innerHTML = "Resume Game";
        document.getElementById("p").innerHTML = "Game Paused";
    } else {
        myGameArea.interval = setInterval(updateGameArea, 20); // Resume the game loop
        pauseButton.innerHTML = "Pause Game";
        document.getElementById("p").innerHTML = "Welcome to Tetris!";
    }
}


function exitProgram() {
    clearInterval(myGameArea.interval); // stop the game loop
    document.getElementById("p").innerHTML = "Game Ended.";
}