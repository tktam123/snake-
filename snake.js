
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const GRID = 20;
const COLS = canvas.width / GRID;
const ROWS = canvas.height / GRID;

let snake, food, dir, nextDir, score, highScore, level, speed, gameLoop, running;

highScore = parseInt(localStorage.getItem('snakeHigh') || '0');
document.getElementById('highscore').textContent = highScore;

function init() {
    snake = [{x:10, y:10}, {x:9, y:10}, {x:8, y:10}];
    dir = {x:1, y:0};
    nextDir = {x:1, y:0};
    score = 0;
    level = 1;
    speed = 120;
    placeFood();
    updateUI();
}

function placeFood() {
    do {
        food = {x: Math.floor(Math.random()*COLS), y: Math.floor(Math.random()*ROWS)};
    } while (snake.some(s => s.x === food.x && s.y === food.y));
}

function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('highscore').textContent = highScore;
}

function draw() {
    // Background grid
    ctx.fillStyle = '#12121e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < COLS; i++) {
        for (var j = 0; j < ROWS; j++) {
            ctx.strokeStyle = 'rgba(255,255,255,0.02)';
            ctx.strokeRect(i*GRID, j*GRID, GRID, GRID);
        }
    }

    // Food with glow
    ctx.shadowColor = '#FF2D7B';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#FF2D7B';
    ctx.fillRect(food.x*GRID+2, food.y*GRID+2, GRID-4, GRID-4);
    ctx.shadowBlur = 0;

    // Snake
    for (var i = 0; i < snake.length; i++) {
        var s = snake[i];
        if (i === 0) {
            // Head with glow
            ctx.shadowColor = '#39FF14';
            ctx.shadowBlur = 12;
            ctx.fillStyle = '#39FF14';
            ctx.fillRect(s.x*GRID+1, s.y*GRID+1, GRID-2, GRID-2);
            ctx.shadowBlur = 0;
        } else {
            var alpha = 1 - (i / snake.length) * 0.6;
            ctx.fillStyle = 'rgba(57,255,20,' + alpha + ')';
            ctx.fillRect(s.x*GRID+1, s.y*GRID+1, GRID-2, GRID-2);
        }
    }
}

function update() {
    dir = nextDir;
    var head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

    // Wall collision
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        gameOver();
        return;
    }

    // Self collision
    for (var i = 0; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Eat food
    if (head.x === food.x && head.y === food.y) {
        score += 10 * level;
        // Level up every 50 points
        level = Math.floor(score / 50) + 1;
        speed = Math.max(50, 120 - (level - 1) * 10);
        placeFood();
        updateUI();
        // Restart loop with new speed
        clearInterval(gameLoop);
        gameLoop = setInterval(tick, speed);
    } else {
        snake.pop();
    }
}

function tick() {
    update();
    draw();
}

function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    init();
    running = true;
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(tick, speed);
    draw();
}

function gameOver() {
    running = false;
    clearInterval(gameLoop);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHigh', highScore.toString());
    }
    updateUI();
    document.getElementById('finalScore').textContent = 'Score: ' + score;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

function setDir(x, y) {
    // Prevent reversing
    if (dir.x === -x && dir.y === -y) return;
    if (x !== 0 && dir.x === x) return;
    if (y !== 0 && dir.y === y) return;
    nextDir = {x: x, y: y};
}

document.addEventListener('keydown', function(e) {
    if (!running && e.code === 'Space') { startGame(); return; }
    switch(e.key) {
        case 'ArrowUp': case 'w': case 'W': e.preventDefault(); setDir(0,-1); break;
        case 'ArrowDown': case 's': case 'S': e.preventDefault(); setDir(0,1); break;
        case 'ArrowLeft': case 'a': case 'A': e.preventDefault(); setDir(-1,0); break;
        case 'ArrowRight': case 'd': case 'D': e.preventDefault(); setDir(1,0); break;
    }
});

// Initial draw
init();
draw();