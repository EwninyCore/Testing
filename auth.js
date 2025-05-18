import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { 
    getDatabase, ref, set, get, push, 
    onValue, onDisconnect, query, orderByChild 
} from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-database.js';
import { 
    getAuth, createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js';

const firebaseConfig = {
    apiKey: "AIzaSyBO3ZFs_PYZ7HubkuGkLu23EzyzpNlD5oc",
    authDomain: "anonchat-200d7.firebaseapp.com",
    databaseURL: "https://anonchat-200d7-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "anonchat-200d7",
    storageBucket: "anonchat-200d7.appspot.com",
    messagingSenderId: "556527619851",
    appId: "1:556527619851:web:7e03d8882f789588719c0e",
    measurementId: "G-M8L540PND8"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Явный экспорт всех необходимых функций
export { 
    db,
    auth,
    ref,
    set,
    get,
    push,
    onValue,
    query,
    orderByChild,
    onAuthStateChanged 
};

export class AuthManager {
    constructor() {
        this.modal = document.getElementById('authModal');
        this.loginForm = document.getElementById('loginForm');
        this.registerForm = document.getElementById('registerForm');
        this.tabs = document.querySelectorAll('.auth-tab');
        
        this.init();
    }

    init() {
        this.initEventListeners();
        this.checkAuthState();
    }

    initEventListeners() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchForm(e.target.dataset.form);
            });
        });


        this.loginForm.addEventListener('submit', (e) => this.handleAuth(e, 'login'));
        this.registerForm.addEventListener('submit', (e) => this.handleAuth(e, 'register'));
    }

    async handleAuth(e, type) {
        e.preventDefault();
        
        const loginField = type === 'login' ? 'login' : 'regLogin';
        const passwordField = type === 'login' ? 'password' : 'regPassword';
        
        const login = document.getElementById(loginField).value;
        const password = document.getElementById(passwordField).value;

        try {
            if (type === 'register') {
                const snapshot = await get(ref(db, 'users'));
                const users = Object.values(snapshot.val() || {});
                if (users.some(user => user.login === login)) {
                    throw new Error('Логин уже занят');
                }

                const userCredential = await createUserWithEmailAndPassword(
                    auth, 
                    `${login}@cyberchat.com`, 
                    password
                );
                
                await set(ref(db, `users/${userCredential.user.uid}`), {
                    login: login,
                    score: 0,
                    role: 'player',
                    created: Date.now()
                });
            } else {
                // Вход
                await signInWithEmailAndPassword(
                    auth, 
                    `${login}@cyberchat.com`, 
                    password
                );
            }

            this.hideAuthModal();
            this.updateUI();

        } catch (error) {
            console.error('Ошибка аутентификации:', error);
            alert(this.getErrorMessage(error.code));
        }
    }

    getErrorMessage(code) {
        const errors = {
            'auth/email-already-in-use': 'Логин уже существует',
            'auth/wrong-password': 'Неверный пароль',
            'auth/user-not-found': 'Пользователь не найден',
            'auth/network-request-failed': 'Ошибка сети'
        };
        return errors[code] || 'Неизвестная ошибка';
    }

    switchForm(formType) {
        this.tabs.forEach(tab => tab.classList.remove('active'));
        this.loginForm.classList.remove('active');
        this.registerForm.classList.remove('active');

        document.querySelector(`[data-form="${formType}"]`).classList.add('active');
        document.getElementById(`${formType}Form`).classList.add('active');
    }

    hideAuthModal() {
        this.modal.style.display = 'none';
    }

    updateUI() {
        document.querySelector('.container').classList.remove('hidden');
    }

    checkAuthState() {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.hideAuthModal();
                this.updateUI();
            }
        });
    }
}