import { AuthManager, auth, onAuthStateChanged } from './auth.js';
import { CyberChat } from './chat.js';
import { SnakeGame } from './snake.js';

document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
    new CyberChat();
    new SnakeGame();

    onAuthStateChanged(auth, user => {
        console.log('Auth state:', user ? 'Logged in' : 'Logged out');
    });
});