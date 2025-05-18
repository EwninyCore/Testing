import { db, auth } from './auth.js';

export class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.init();
    }

    init() {
        this.reset();
        this.bindEvents();
        this.initLeaderboard();
    }

    reset() {
        this.snake = [{x: 10, y: 10}];
        this.direction = 'right';
        this.score = 0;
        this.food = this.generateFood();
        this.isPlaying = false;
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if(!this.isPlaying) return;
            const key = e.key.replace('Arrow', '').toLowerCase();
            const opposite = {up: 'down', down: 'up', left: 'right', right: 'left'};
            if(opposite[key] !== this.direction) this.direction = key;
        });

        document.getElementById('snakeStartBtn').addEventListener('click', () => {
            if(!auth.currentUser) return alert('Требуется авторизация!');
            this.isPlaying ? this.gameOver() : this.start();
        });
    }

    async initLeaderboard() {
        onValue(query(ref(db, 'leaderboard')), (snapshot) => {
            const scores = Object.values(snapshot.val() || {});
            this.renderLeaderboard(scores.sort((a,b) => b.score - a.score).slice(0,10));
        });
    }

    renderLeaderboard(scores) {
        const list = document.getElementById('leaderboardList');
        list.innerHTML = scores.map((entry, i) => `
            <div class="leader-entry ${i < 3 ? 'podium-'+(i+1) : ''}">
                <span>${i+1}. ${entry.login}</span>
                <span>${entry.score}</span>
            </div>
        `).join('');
    }

    async updateLeaderboard() {
        if(!auth.currentUser) return;
        await push(ref(db, 'leaderboard'), {
            userId: auth.currentUser.uid,
            login: auth.currentUser.login,
            score: this.score,
            timestamp: Date.now()
        });
    }

    start() {
        this.isPlaying = true;
        document.getElementById('snakeStartBtn').textContent = 'СТОП';
        this.gameLoop = setInterval(() => {
            this.move();
            this.draw();
        }, 200);
    }

    move() {
        const head = {...this.snake[0]};
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        if(head.x < 0 || head.x >= this.canvas.width/this.gridSize ||
           head.y < 0 || head.y >= this.canvas.height/this.gridSize ||
           this.snake.some(s => s.x === head.x && s.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);
        if(head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.generateFood();
            this.updateLeaderboard();
        } else {
            this.snake.pop();
        }
    }

    draw() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.snake.forEach((seg, i) => {
            this.ctx.fillStyle = i === 0 ? '#0f0' : '#0a0';
            this.ctx.fillRect(
                seg.x * this.gridSize,
                seg.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        this.ctx.fillStyle = '#f00';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.isPlaying = false;
        document.getElementById('snakeStartBtn').textContent = 'РЕСТАРТ';
        this.updateLeaderboard();
        alert(`Крах системы! Счёт: ${this.score}`);
        this.reset();
    }

    generateFood() {
        return {
            x: Math.floor(Math.random() * (this.canvas.width/this.gridSize)),
            y: Math.floor(Math.random() * (this.canvas.height/this.gridSize))
        };
    }
}