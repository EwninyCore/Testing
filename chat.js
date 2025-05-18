import { db, auth } from './auth.js';

export class CyberChat {
    constructor() {
        this.messages = [];
        this.user = null;
        this.init();
    }

    async init() {
        onAuthStateChanged(auth, (user) => {
            this.user = user;
            this.initMessages();
        });
        
        document.getElementById('chatForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.querySelector('.chat-input');
            const message = input.value.trim();
            if(message) this.sendMessage(message);
            input.value = '';
        });
    }

    initMessages() {
        onValue(query(ref(db, 'messages')), (snapshot) => {
            this.messages = Object.values(snapshot.val() || {});
            this.renderMessages();
        });
    }

    async sendMessage(content) {
        try {
            await push(ref(db, 'messages'), {
                userId: this.user.uid,
                login: this.user.login,
                content: this.sanitize(content),
                timestamp: Date.now(),
                color: '#0f0'
            });
        } catch(error) {
            console.error('Ошибка передачи:', error);
        }
    }

    sanitize(input) {
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    renderMessages() {
        const container = document.querySelector('.chat-container');
        container.innerHTML = this.messages.map(msg => `
            <div class="message ${msg.userId === this.user?.uid ? 'self' : ''}">
                <div class="msg-header">
                    <span style="color: ${msg.color}">${msg.login}</span>
                    <span class="time">${new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
                <div class="msg-content">${msg.content}</div>
            </div>
        `).join('');
        container.scrollTop = container.scrollHeight;
    }
}