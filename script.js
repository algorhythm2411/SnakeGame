const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const eatSound = document.getElementById('eatSound');
const bombSound = document.getElementById('bombSound');
const gameOverSound = document.getElementById('gameOverSound');

const gridSize = 20;
canvas.width = 400;
canvas.height = 400;

let snake = [{x: gridSize * 2, y: gridSize * 2}];
let direction = {x: 0, y: 0};
let food = {};
let bombFood = null;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let bombTimeout;


highScoreElement.innerText = `High Score: ${highScore}`;

function init() {
    placeFood();
    document.addEventListener('keydown', changeDirection);
    gameLoop();
}

function gameLoop() {
    if (isGameOver()) {
        return;
    }
    setTimeout(() => {
        clearCanvas();
        drawSnake();
        moveSnake();
        drawFood();
        if (bombFood) drawBombFood();
        checkFoodCollision();
        checkBombFoodCollision();
        gameLoop();
    }, 100);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = 'green';
    snake.forEach((segment, index) => {
        if (index === 0) {
            ctx.fillStyle = 'lightgreen'; // Color for the head
        } else {
            ctx.fillStyle = 'green';
        }
        ctx.fillRect(segment.x, segment.y, gridSize, gridSize);
    });
}

function moveSnake() {
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

    // Continuous effect
    if (head.x >= canvas.width) {
        head.x = 0;
    } else if (head.x < 0) {
        head.x = canvas.width - gridSize;
    }
    if (head.y >= canvas.height) {
        head.y = 0;
    } else if (head.y < 0) {
        head.y = canvas.height - gridSize;
    }

    snake.unshift(head);
    snake.pop();
}

function changeDirection(event) {
    const keyPressed = event.keyCode;
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;
    const W = 87;
    const A = 65;
    const S = 83;
    const D = 68;

    const goingUp = direction.y === -gridSize;
    const goingDown = direction.y === gridSize;
    const goingRight = direction.x === gridSize;
    const goingLeft = direction.x === -gridSize;

    if ((keyPressed === LEFT || keyPressed === A) && !goingRight) {
        direction = {x: -gridSize, y: 0};
    } else if ((keyPressed === UP || keyPressed === W) && !goingDown) {
        direction = {x: 0, y: -gridSize};
    } else if ((keyPressed === RIGHT || keyPressed === D) && !goingLeft) {
        direction = {x: gridSize, y: 0};
    } else if ((keyPressed === DOWN || keyPressed === S) && !goingUp) {
        direction = {x: 0, y: gridSize};
    }
}

function placeFood() {
    food = {
        x: Math.floor(Math.random() * canvas.width / gridSize) * gridSize,
        y: Math.floor(Math.random() * canvas.height / gridSize) * gridSize
    };
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, gridSize, gridSize);
}

function placeBombFood() {
    bombFood = {
        x: Math.floor(Math.random() * canvas.width / gridSize) * gridSize,
        y: Math.floor(Math.random() * canvas.height / gridSize) * gridSize
    };
    bombSound.play();
    bombTimeout = setTimeout(() => {
        bombFood = null;
    }, 5000);
}

function drawBombFood() {
    if (bombFood) {
        ctx.fillStyle = 'purple';
        ctx.fillRect(bombFood.x, bombFood.y, gridSize, gridSize);
    }
}

function checkFoodCollision() {
    if (snake[0].x === food.x && snake[0].y === food.y) {
        eatSound.play();
        score++;
                scoreElement.innerText = `Score: ${score}`;
        snake.push({});
        placeFood();
        if (Math.random() < 0.1) {
            placeBombFood();
        }
    }
}

function checkBombFoodCollision() {
    if (bombFood && snake[0].x === bombFood.x && snake[0].y === bombFood.y) {
        eatSound.play();
        score += 2;
        scoreElement.innerText = `Score: ${score}`;
        snake.push({}, {});
        bombFood = null;
        clearTimeout(bombTimeout);
    }
}

function playGameOverSound() {
    return new Promise((resolve, reject) => {
        gameOverSound.onended = resolve;
        gameOverSound.onerror = reject;
        gameOverSound.play();
    });
}

function isGameOver() {
    for (let i = 4; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            playGameOverSound()
                .then(() => {
                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem('highScore', highScore);
                        highScoreElement.innerText = `High Score: ${highScore}`;
                    }
                    alert('Game Over!');
                })
                .catch((error) => {
                    console.error('Error playing game over sound:', error);
                    if (score > highScore) {
                        highScore = score;
                        localStorage.setItem('highScore', highScore);
                        highScoreElement.innerText = `High Score: ${highScore}`;
                    }
                    alert('Game Over!');
                });

            return true;
        }
    }
    return false;
}

init();

