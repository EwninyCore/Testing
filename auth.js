import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { 
    getDatabase, ref, set, get, push, 
    onValue, onDisconnect, query, orderByChild, limitToLast 
} from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';
import { 
    getAuth, createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, signOut 
} from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

export const firebaseConfig = {
    apiKey: "AIzaSyBO3ZFs_PYZ7HubkuGkLu23EzyzpNlD5oc",
    authDomain: "anonchat-200d7.firebaseapp.com",
    databaseURL: "https://anonchat-200d7-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "anonchat-200d7",
    storageBucket: "anonchat-200d7.firebasestorage.app",
    messagingSenderId: "556527619851",
    appId: "1:556527619851:web:7e03d8882f789588719c0e",
    measurementId: "G-M8L540PND8"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth };

export class AuthManager {
    constructor() {
        this.modal = document.getElementById('authModal');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.tabs = document.querySelectorAll('.auth-tab');
        if (this.tabs.length === 0) {
            console.error('Tabs not found!');
            return;
        }
        this.initEvents();
    }

    initEvents() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchForm(e.target.dataset.form);
            });
        });

        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    switchForm(formType) {
        console.log('Switching to:', formType);
        

        this.tabs.forEach(tab => tab.classList.remove('active'));
        this.loginForm.classList.remove('active');
        this.registerForm.classList.remove('active');
        document.querySelector(`[data-form="${formType}"]`).classList.add('active');
        document.getElementById(`${formType}Form`).classList.add('active');
    }

    async handleAuth(e, type) {
        e.preventDefault();
        const login = document.getElementById(type === 'login' ? 'login' : 'regLogin').value;
        const password = document.getElementById(type === 'login' ? 'password' : 'regPassword').value;

        try {
            if(type === 'register') {
                const users = await get(ref(db, 'users'));
                if(Object.values(users.val() || {}).some(u => u.login === login)) {
                    throw new Error('Логин занят');
                }
                const res = await createUserWithEmailAndPassword(auth, `${login}@cyberchat.com`, password);
                await set(ref(db, `users/${res.user.uid}`), {
                    login: login,
                    score: 0,
                    role: 'player',
                    created: Date.now()
                });
            } else {
                await signInWithEmailAndPassword(auth, `${login}@cyberchat.com`, password);
            }
            this.hideAuthModal();
        } catch(error) {
            alert(`Кибер-ошибка: ${error.message}`);
        }
    }

    hideAuthModal() {
        this.modal.style.display = 'none';
        document.querySelector('.container').classList.remove('hidden');
    }
}