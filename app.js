const firebaseConfig = {
    apiKey: "AIzaSyBO3ZFs_PYZ7HubkuGkLu23EzyzpNlD5oc",
    authDomain: "anonchat-200d7.firebaseapp.com",
    databaseURL: "https://anonchat-200d7-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "anonchat-200d7",
    storageBucket: "anonchat-200d7.firebasestorage.app",
    messagingSenderId: "556527619851",
    appId: "1:556527619851:web:7e03d8882f789588719c0e",
    measurementId: "G-M8L540PND8"
};

// Инициализируем Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

class HologramSystem {
    constructor() {
        this.user = null;
        this.usersRef = db.ref('users');
        this.messagesRef = db.ref('messages');
        this.onlineRef = db.ref('.info/connected');
        this.init();
    }

    init() {
        document.getElementById('initSystem').addEventListener('click', () => this.createIdentity());
        document.getElementById('sendMessage').addEventListener('click', () => this.sendMessage());
        this.initAuthCheck();
    }

    createIdentity() {
        const alias = document.getElementById('hologramAlias').value.trim() || 'Anonymous';
        const userId = this.generateHoloId();
        
        this.user = {
            id: userId,
            alias: alias.substring(0, 16),
            role: 'neutral',
            karma: 100,
            online: true
        };

        this.registerUser();
        this.initPresence();
        this.updateUI();
        this.initChat();
    }

    generateHoloId() {
        return 'HOLO-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    }

    registerUser() {
        const userRef = db.ref(`users/${this.user.id}`);
        userRef.set({
            alias: this.user.alias,
            role: 'neutral',
            created: Date.now(),
            lastOnline: Date.now()
        });
    }

    initPresence() {
        const userStatusRef = db.ref(`status/${this.user.id}`);
        
        this.onlineRef.on('value', (snapshot) => {
            if (snapshot.val()) {
                userStatusRef.set({
                    online: true,
                    lastChanged: Date.now()
                });
                
                userStatusRef.onDisconnect().set({
                    online: false,
                    lastChanged: Date.now()
                });
            }
        });
    }

    updateUI() {
        document.getElementById('authPanel').classList.add('hidden');
        document.querySelector('.main-grid').classList.remove('hidden');
        document.getElementById('permId').textContent = this.user.id;
        this.initOnlineCounter();
        this.initSessionTimer();
    }

    initOnlineCounter() {
        db.ref('status').on('value', (snapshot) => {
            const users = snapshot.val() || {};
            const onlineCount = Object.values(users).filter(u => u.online).length;
            document.getElementById('onlineCount').textContent = onlineCount;
        });
    }

    initSessionTimer() {
        const startTime = Date.now();
        setInterval(() => {
            const seconds = Math.floor((Date.now() - startTime) / 1000);
            const minutes = Math.floor(seconds / 60);
            const display = `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
            document.querySelector('.session-time').textContent = display;
        }, 1000);
    }

    initChat() {
        this.messagesRef.limitToLast(50).on('child_added', (snapshot) => {
            const msg = snapshot.val();
            this.displayMessage(msg);
        });
    }

    sendMessage() {
        const input = document.getElementById('messageInput');
        const message = input.value.trim();
        
        if (message) {
            this.messagesRef.push({
                userId: this.user.id,
                content: this.sanitizeMessage(message),
                timestamp: Date.now()
            });
            input.value = '';
        }
    }

    sanitizeMessage(text) {
        return text
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .substring(0, 200);
    }

    displayMessage(msg) {
        const messageBox = document.getElementById('messageBox');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${msg.userId === this.user.id ? 'self' : ''}`;
        messageElement.innerHTML = `
            <div class="msg-content">${msg.content}</div>
            <div class="msg-time">${new Date(msg.timestamp).toLocaleTimeString()}</div>
        `;
        messageBox.appendChild(messageElement);
        messageBox.scrollTop = messageBox.scrollHeight;
    }
}

// Запуск системы
const holoSystem = new HologramSystem();