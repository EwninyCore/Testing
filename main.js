import { AuthManager } from './auth.js';
import { CyberChat } from './chat.js';
import { SnakeGame } from './snake.js';

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const authManager = new AuthManager();
        new CyberChat();
        new SnakeGame();
    }, 100);

    onAuthStateChanged(auth, user => {
        if(user) {
            document.getElementById('snakeStartBtn').disabled = false;
        } else {
            document.getElementById('snakeStartBtn').disabled = true;
        } 
    });
});