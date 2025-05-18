import { 
    db, 
    auth, 
    ref, 
    push,
    onValue,
    query,
    onAuthStateChanged 
} from './auth.js';

export class CyberChat {
    constructor() {
        this.messages = [];
        this.user = null;
        this.init();
    }

    init() {
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
            // Санитизация контента
            const sanitizedContent = this.sanitize(content);
            
            await push(ref(db, 'messages'), {
                userId: this.user.uid,
                content: sanitizedContent, // Используем очищенный контент
                timestamp: Date.now()
            });
        } catch(error) {
            console.error("Ошибка отправки:", error);
        }
    }

    sanitize(input) {
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/\//g, '&#x2F;');
    }


    renderMessages() {
        const container = document.querySelector('.chat-container');
        container.innerHTML = this.messages.map(msg => `
            <div class="message">
                <div class="msg-content">${msg.content}</div> <!-- Уже санитизировано -->
            </div>
        `).join('');
    }
}