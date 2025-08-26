class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu'; // 'menu', 'playing', 'gameOver'
        
        // Game constants
        this.GAME_WIDTH = 800;
        this.GAME_HEIGHT = 400;
        this.GROUND_HEIGHT = 80;
        this.WARRIOR_WIDTH = 60;
        this.WARRIOR_HEIGHT = 80;
        this.GRAVITY = 0.8;
        this.JUMP_FORCE = -15;
        this.GAME_SPEED = 3;
        
        // Game state
        this.score = 0;
        this.coins = 0;
        this.gameSpeed = this.GAME_SPEED;
        this.lastSpawn = 0;
        
        // Warrior
        this.warrior = {
            x: 100,
            y: this.GAME_HEIGHT - this.GROUND_HEIGHT - this.WARRIOR_HEIGHT,
            width: this.WARRIOR_WIDTH,
            height: this.WARRIOR_HEIGHT,
            isJumping: false,
            jumpVelocity: 0
        };
        
        // Game objects
        this.objects = [];
        
        // Animation
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupCanvas();
        this.gameLoop();
    }
    
    setupCanvas() {
        // Set canvas size
        this.canvas.width = this.GAME_WIDTH;
        this.canvas.height = this.GAME_HEIGHT;
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                this.jump();
            }
        });
        
    // Button controls
    document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    document.getElementById('playAgainBtn').addEventListener('click', () => this.startGame());
    document.getElementById('menuBtn').addEventListener('click', () => this.showMenu());
    // Fly button instant response
    const flyBtn = document.getElementById('flyBtn');
    flyBtn.addEventListener('touchstart', (e) => { e.preventDefault(); this.jump(); });
    flyBtn.addEventListener('mousedown', (e) => { e.preventDefault(); this.jump(); });
        
        // Mobile detection
        if (window.innerWidth <= 850) {
            flyBtn.classList.remove('hidden');
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.coins = 0;
        this.gameSpeed = this.GAME_SPEED;
        this.objects = [];
        this.lastSpawn = 0;
        
        this.warrior = {
            x: 100,
            y: this.GAME_HEIGHT - this.GROUND_HEIGHT - this.WARRIOR_HEIGHT,
            width: this.WARRIOR_WIDTH,
            height: this.WARRIOR_HEIGHT,
            isJumping: false,
            jumpVelocity: 0
        };
        
        this.updateUI();
    this.hideAllScreens();
    document.getElementById('flyBtn').classList.remove('hidden');
    }
    
    showMenu() {
        this.gameState = 'menu';
        this.hideAllScreens();
        document.getElementById('menuScreen').classList.remove('hidden');
    document.getElementById('flyBtn').classList.add('hidden');
    }
    
    showGameOver() {
        this.gameState = 'gameOver';
        this.hideAllScreens();
        document.getElementById('gameOverScreen').classList.remove('hidden');
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('finalCoins').textContent = this.coins;
        document.getElementById('jumpBtn').classList.add('hidden');
    }
    
    hideAllScreens() {
    document.getElementById('menuScreen').classList.add('hidden');
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('flyBtn').classList.add('hidden');
    }
    
    jump() {
        if (this.gameState === 'playing' && !this.warrior.isJumping) {
            this.warrior.jumpVelocity = this.JUMP_FORCE;
            this.warrior.isJumping = true;
        }
    }
    
    updateWarrior() {
        if (this.gameState !== 'playing') return;
        
        // Apply gravity
        this.warrior.y += this.warrior.jumpVelocity;
        this.warrior.jumpVelocity += this.GRAVITY;
        
        // Ground collision
        const groundY = this.GAME_HEIGHT - this.GROUND_HEIGHT - this.WARRIOR_HEIGHT;
        if (this.warrior.y >= groundY) {
            this.warrior.y = groundY;
            this.warrior.jumpVelocity = 0;
            this.warrior.isJumping = false;
        }
    }
    
    spawnObject() {
        const now = Date.now();
        if (now - this.lastSpawn > 1500 + Math.random() * 1000) {
            const type = Math.random() < 0.6 ? 'coin' : 'bomb';
            const newObject = {
                x: this.GAME_WIDTH,
                y: type === 'coin' 
                    ? this.GAME_HEIGHT - this.GROUND_HEIGHT - 30 - Math.random() * 100
                    : this.GAME_HEIGHT - this.GROUND_HEIGHT - 30, // bomb closer to ground
                width: type === 'coin' ? 25 : 30, // bomb smaller than warrior
                height: type === 'coin' ? 25 : 30,
                type: type
            };
            this.objects.push(newObject);
            this.lastSpawn = now;
        }
    }
    
    updateObjects() {
        if (this.gameState !== 'playing') return;
        
        // Move objects
        this.objects = this.objects
            .map(obj => ({ ...obj, x: obj.x - this.gameSpeed }))
            .filter(obj => obj.x + obj.width > 0);
        
        // Check collisions
        this.objects.forEach((obj, index) => {
            if (this.checkCollision(this.warrior, obj)) {
                if (obj.type === 'coin') {
                    this.coins++;
                    this.score += 10;
                    this.objects.splice(index, 1);
                } else if (obj.type === 'bomb') {
                    this.showGameOver();
                }
            }
        });
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    updateGame() {
        if (this.gameState !== 'playing') return;
        
        this.updateWarrior();
        this.updateObjects();
        this.spawnObject();
        
        // Increase score and speed
        this.score++;
        this.gameSpeed = Math.min(this.gameSpeed + 0.001, 6);
        
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('coins').textContent = this.coins;
    }
    
    drawBackground() {
        // Sky gradient
        const skyGradient = this.ctx.createLinearGradient(0, 0, 0, this.GAME_HEIGHT - this.GROUND_HEIGHT);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#98D8E8');
        
        this.ctx.fillStyle = skyGradient;
        this.ctx.fillRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT - this.GROUND_HEIGHT);
        
        // Ground gradient
        const groundGradient = this.ctx.createLinearGradient(0, this.GAME_HEIGHT - this.GROUND_HEIGHT, 0, this.GAME_HEIGHT);
        groundGradient.addColorStop(0, '#8B4513');
        groundGradient.addColorStop(1, '#A0522D');
        
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, this.GAME_HEIGHT - this.GROUND_HEIGHT, this.GAME_WIDTH, this.GROUND_HEIGHT);
        
        // Ground texture
        this.ctx.fillStyle = 'rgba(101, 67, 33, 0.6)';
        for (let i = 0; i < 20; i++) {
            this.ctx.fillRect(i * 40, this.GAME_HEIGHT - this.GROUND_HEIGHT + 10, 35, 8);
        }
    }
    
    drawWarrior3D() {
        const { x, y, isJumping } = this.warrior;
        const ctx = this.ctx;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Cape (behind warrior)
        ctx.fillStyle = '#DC143C';
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(8, 28);
        ctx.quadraticCurveTo(isJumping ? 2 : 5, isJumping ? 35 : 40, 6, 55);
        ctx.quadraticCurveTo(12, 50, 16, 35);
        ctx.quadraticCurveTo(18, 30, 15, 28);
        ctx.fill();
        ctx.stroke();
        
        // Body shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(30, 75, 25, 5, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Legs
        ctx.fillStyle = '#F4C2A1';
        ctx.fillRect(22, 58, 10, 22);
        ctx.fillRect(35, 58, 10, 22);
        
        // Leg armor
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(21, 58, 12, 15);
        ctx.fillRect(34, 58, 12, 15);
        
        // Body armor
        ctx.fillStyle = '#E6E6FA';
        this.roundRect(ctx, 18, 25, 30, 35, 8);
        ctx.fill();
        
        // Chest plate
        ctx.fillStyle = '#C0C0C0';
        this.roundRect(ctx, 22, 30, 22, 25, 5);
        ctx.fill();
        
        // Chest details
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(33, 42, 3, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillRect(30, 35, 6, 3);
        ctx.fillRect(30, 46, 6, 3);
        
        // Arms
        ctx.fillStyle = '#F4C2A1';
        this.roundRect(ctx, 12, 28, 8, 20, 4);
        ctx.fill();
        this.roundRect(ctx, 47, 28, 8, 20, 4);
        ctx.fill();
        
        // Arm armor
        ctx.fillStyle = '#C0C0C0';
        this.roundRect(ctx, 11, 28, 10, 12, 3);
        ctx.fill();
        this.roundRect(ctx, 46, 28, 10, 12, 3);
        ctx.fill();
        
        // Head
        ctx.fillStyle = '#F4C2A1';
        ctx.beginPath();
        ctx.arc(33, 18, 15, 0, 2 * Math.PI);
        ctx.fill();
        
        // Helmet
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#FF8C00';
        ctx.beginPath();
        ctx.moveTo(18, 12);
        ctx.quadraticCurveTo(33, 5, 48, 12);
        ctx.lineTo(46, 22);
        ctx.lineTo(20, 22);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Helmet plume
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(31, 8, 4, 6);
        
        // Face
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(28, 16, 1.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(38, 16, 1.5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Beard
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.moveTo(25, 22);
        ctx.quadraticCurveTo(33, 28, 41, 22);
        ctx.quadraticCurveTo(38, 26, 33, 27);
        ctx.quadraticCurveTo(28, 26, 25, 22);
        ctx.fill();
        
        // Sword
        ctx.save();
        ctx.translate(52, 15);
        ctx.rotate((isJumping ? -10 : 5) * Math.PI / 180);
        ctx.fillStyle = '#E6E6FA';
        ctx.fillRect(-2, -7, 4, 30);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-4, -9, 8, 5);
        ctx.fillStyle = '#E6E6FA';
        ctx.beginPath();
        ctx.moveTo(-2, -7);
        ctx.lineTo(0, -13);
        ctx.lineTo(2, -7);
        ctx.fill();
        ctx.restore();
        
        // Shield
        ctx.fillStyle = '#C0C0C0';
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(15, 35, 6, 8, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(13, 32, 4, 6);
        
        ctx.restore();
    }
    
    drawBomb3D(x, y) {
        const ctx = this.ctx;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Bomb shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(22, 40, 18, 4, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Main bomb body
        const bombGradient = ctx.createRadialGradient(16, 16, 0, 22, 22, 18);
        bombGradient.addColorStop(0, '#4A4A4A');
        bombGradient.addColorStop(0.7, '#2F2F2F');
        bombGradient.addColorStop(1, '#1A1A1A');
        
        ctx.fillStyle = bombGradient;
        ctx.beginPath();
        ctx.arc(22, 22, 18, 0, 2 * Math.PI);
        ctx.fill();
        
        // Bomb highlight
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.ellipse(16, 16, 6, 4, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Fuse
        ctx.fillStyle = '#FF6347';
        this.roundRect(ctx, 20, 4, 4, 8, 2);
        ctx.fill();
        
        // Fuse spark (animated)
        const sparkSize = 2 + Math.sin(Date.now() * 0.01) * 1;
        ctx.fillStyle = '#FF6347';
        ctx.globalAlpha = 0.8 + Math.sin(Date.now() * 0.01) * 0.2;
        ctx.beginPath();
        ctx.arc(22, 2, sparkSize, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1;
        
        // Danger symbol
        ctx.fillStyle = 'rgba(255, 69, 0, 0.8)';
        ctx.beginPath();
        const points = [
            [-6, -8], [0, -10], [6, -8], [8, 0], [6, 8], [0, 10], [-6, 8], [-8, 0]
        ];
        ctx.moveTo(22 + points[0][0], 22 + points[0][1]);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(22 + points[i][0], 22 + points[i][1]);
        }
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('!', 22, 26);
        
        ctx.restore();
    }
    
    drawCoin(x, y) {
        const ctx = this.ctx;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Coin body
        const coinGradient = ctx.createRadialGradient(12.5, 12.5, 0, 12.5, 12.5, 12);
        coinGradient.addColorStop(0, '#FFD700');
        coinGradient.addColorStop(1, '#FFA500');
        
        ctx.fillStyle = coinGradient;
        ctx.beginPath();
        ctx.arc(12.5, 12.5, 12, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(12.5, 12.5, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Dollar sign
        ctx.fillStyle = '#8B4513';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('$', 12.5, 17);
        
        ctx.restore();
    }
    
    drawObjects() {
        this.objects.forEach(obj => {
            if (obj.type === 'coin') {
                this.drawCoin(obj.x, obj.y);
            } else {
                this.drawBomb3D(obj.x, obj.y);
            }
        });
    }
    
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.GAME_WIDTH, this.GAME_HEIGHT);
        
        // Draw background
        this.drawBackground();
        
        // Draw game objects only when playing
        if (this.gameState === 'playing') {
            this.drawWarrior3D();
            this.drawObjects();
        }
    }
    
    gameLoop() {
        this.updateGame();
        this.render();
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when page loads
window.addEventListener('load', () => {
    new Game();
});