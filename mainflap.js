const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const birdImg = new Image();
birdImg.src = 'Img/nobgatan.png';
const pipeImg = new Image();
pipeImg.src = 'Img/pipenobg.png';

// --- LOAD AUDIO OBJECTS ---
const jumpSound = new Audio('muic/woosh.wav');
const scoreSound = new Audio('muic/scoree.wav');
const crashSound = new Audio('muic/crash.mp3');

// Game Variables
let birdY = 300;
let birdX = 50;
let velocity = 0;
const gravity = 0.4;
const jump = -7;
const birdSize = 20;

let pipes = [];
const pipeWidth = 60;
const pipeGap = 140;
const pipeSpeed = 2.5;
let frameCount = 0;

let score = 0;
let gameOver = false;

// Input Event Listeners
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") handleInput();
});
canvas.addEventListener("touchstart", handleInput);
canvas.addEventListener("click", handleInput);

function handleInput() {
    if (gameOver) {
        resetGame();
    } else {
        velocity = jump;
        
        // --- PLAY JUMP SOUND ---
        jumpSound.currentTime = 0; // Rewind to start for rapid clicks
        jumpSound.play();
    }
}

function resetGame() {
    birdY = 300;
    velocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;
    frameCount = 0;
}

function spawnPipe() {
    const minHeight = 50;
    const maxHeight = canvas.height - pipeGap - minHeight;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;

    pipes.push({
        x: canvas.width,
        top: topHeight,
        bottom: canvas.height - (topHeight + pipeGap),
        passed: false
    });
}

// Logic calculations
function update() {
    frameCount++;

    // Apply gravity
    velocity += gravity;
    birdY += velocity;

    // Floor/Ceiling collisions
    if (birdY + birdSize > canvas.height || birdY - birdSize < 0) {
        // --- PLAY CRASH SOUND ---
        crashSound.play();
        gameOver = true;
    }

    // Pipe Spawning
    if (frameCount % 90 === 0) {
        spawnPipe();
    }

    // Pipe movement & tracking
    for (let i = pipes.length - 1; i >= 0; i--) {
        pipes[i].x -= pipeSpeed;

        // Collision math
        if (
            birdX + birdSize > pipes[i].x &&
            birdX - birdSize < pipes[i].x + pipeWidth &&
            (birdY - birdSize < pipes[i].top || birdY + birdSize > canvas.height - pipes[i].bottom)
        ) {
            // --- PLAY CRASH SOUND ---
            crashSound.play();
            gameOver = true;
        }

        // Add score
        if (!pipes[i].passed && pipes[i].x + pipeWidth < birdX) {
            score++;
            pipes[i].passed = true;
            
            // --- PLAY SCORE SOUND ---
            scoreSound.currentTime = 0;
            scoreSound.play();
        }

        // Clean memory
        if (pipes[i].x + pipeWidth < 0) {
            pipes.splice(i, 1);
        }
    }
}

// Rendering graphics
function draw() {
    // FIX: Clear the canvas to make it transparent, revealing your CSS 'sky.jpg' background
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Pipes
    pipes.forEach(pipe => {
        // --- 1. Draw TOP Pipe Image (Rotated/Flipped) ---
        ctx.save(); // Save the regular canvas settings
        
        // Move the drawing focal point to the center of the top pipe
        ctx.translate(pipe.x + pipeWidth / 2, pipe.top / 2);
        
        // Flip vertically
        ctx.scale(1, -1);
        
        // Draw the image relative to the new centered focal point
        ctx.drawImage(
            pipeImg, 
            -pipeWidth / 2, 
            -pipe.top / 2, 
            pipeWidth, 
            pipe.top
        );
        
        ctx.restore(); // Undo the flip so the rest of the game draws normally

        // --- 2. Draw BOTTOM Pipe Image (Normal) ---
        ctx.drawImage(
            pipeImg, 
            pipe.x, 
            canvas.height - pipe.bottom, 
            pipeWidth, 
            pipe.bottom
        );
    });

    // Draw Bird
    ctx.drawImage(
        birdImg, 
        birdX - birdSize, 
        birdY - birdSize, 
        birdSize * 2, 
        birdSize * 2
    );

    // Draw Score
    ctx.fillStyle = "#fff";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 20, 50);

    // Draw Screen Text Overlay
    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center"; // Puts the alignment back to center for game over text
        
        ctx.font = "bold 36px sans-serif";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
        
        ctx.font = "20px sans-serif";
        ctx.fillText("Press SPACE, Click, or Tap to Restart", canvas.width / 2, canvas.height / 2 + 20);
    }
}

// Run engine loops
function loop() {
    if (!gameOver) {
        update();
    }
    draw();
    requestAnimationFrame(loop);
}

loop();