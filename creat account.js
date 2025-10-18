// ---------- Firebase Configuration (Direct Object) ----------
const firebaseConfig = {
  apiKey: "AIzaSyAXHD3qrc_sRPzUwpd6kLqGVrOqb2XqMpk",
  authDomain: "my-login-page-62659.firebaseapp.com",
  projectId: "my-login-page-62659",
  storageBucket: "my-login-page-62659.firebasestorage.app",
  messagingSenderId: "265063991992",
  appId: "1:265063991992:web:f1834f4664e5494779024d",
  measurementId: "G-EJ7P52JB4N"
};

// ---------- Global Variables ----------
let app, auth, db, userId = null;
let isAuthReady = false;
let messageBox; 
let messageTimeout;

// ---------- Message Box Function ----------
function showMessage(msg, isError = false) {
    if (!messageBox) {
        messageBox = document.getElementById('message-box');
        if (!messageBox) {
            console.error("Message Box element not found in DOM.");
            return;
        }
    }
    clearTimeout(messageTimeout);
    messageBox.textContent = msg;
    messageBox.className = 'show';
    messageBox.classList.add(isError ? 'error' : 'success');
    messageTimeout = setTimeout(() => {
        messageBox.className = '';
    }, 4000);
}

// ---------- Firebase Initialization ----------
async function initFirebase() {
    if (typeof firebase === 'undefined' || typeof firebase.initializeApp === 'undefined') {
        showMessage("Firebase लोड नहीं हुआ। इंटरनेट कनेक्शन जांचें।", true);
        return;
    }

    try {
        // Initialize Firebase
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();

        // Anonymous sign-in
        await auth.signInAnonymously();
        
        userId = auth.currentUser ? auth.currentUser.uid : crypto.randomUUID();
        isAuthReady = true;

        console.log("✅ Firebase initialized. User ID:", userId);
    } catch (error) {
        console.error("Authentication failed:", error);
        showMessage(`प्रमाणीकरण विफल: ${error.message}`, true);
    }
}

// ---------- Handle Registration ----------
window.handleRegistration = async function() {
    if (!isAuthReady) {
        showMessage("Firebase तैयार नहीं है। कृपया प्रतीक्षा करें।", true);
        return;
    }

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const termsAccepted = document.getElementById('terms').checked;

    // --- Validation ---
    if (!firstName || !lastName || !email || !mobile || !password || !confirmPassword) {
        showMessage('कृपया सभी आवश्यक फ़ील्ड भरें।', true);
        return;
    }
    if (password !== confirmPassword) {
        showMessage('पासवर्ड मेल नहीं खा रहे हैं।', true);
        return;
    }
    if (password.length < 6) {
        showMessage('पासवर्ड कम से कम 6 अक्षर का होना चाहिए।', true);
        return;
    }
    if (!termsAccepted) {
        showMessage('आपको Terms & Conditions से सहमत होना आवश्यक है।', true);
        return;
    }

    try {
        // 🔹 Step 1: Create User in Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // 🔹 Step 2: Save user data in Firestore
        const userProfile = {
            firstName,
            lastName,
            mobile,
            email,
            createdAt: new Date().toISOString()
        };

        await db.collection(`users`).doc(user.uid).set(userProfile);

        showMessage('🎉 पंजीकरण सफल! आपका खाता बन गया है।', false);
        console.log("✅ Registration successful for user:", user.uid);
    } catch (error) {
        console.error("Registration Error:", error);
        let errorMsg = 'पंजीकरण विफल। कृपया बाद में पुनः प्रयास करें।';
        if (error.code === 'auth/email-already-in-use') {
            errorMsg = 'यह ईमेल पहले से उपयोग में है।';
        } else if (error.code === 'auth/weak-password') {
            errorMsg = 'पासवर्ड बहुत कमजोर है।';
        }
        showMessage(`त्रुटि: ${errorMsg}`, true);
    }
};

// ---------- Password Toggle ----------
function setupPasswordToggle() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const passwordInput = toggle.previousElementSibling;
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            toggle.classList.toggle('fa-eye-slash', isPassword);
            toggle.classList.toggle('fa-eye', !isPassword);
        });
    });
}

// ---------- Auto Slider ----------
let currentSlide = 0;
let slidesContainer, slides, totalSlides;

function showSlide(index) {
    if (slidesContainer) {
        slidesContainer.style.transform = `translateX(-${index * 100}%)`;
    }
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}

// ---------- Initialize on Load ----------
document.addEventListener('DOMContentLoaded', () => {
    setupPasswordToggle();
    slidesContainer = document.getElementById('slides-container');
    slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;
});

window.onload = function() {
    messageBox = document.getElementById('message-box');
    initFirebase();

    if (slidesContainer && totalSlides > 0) {
        showSlide(currentSlide);
        setInterval(nextSlide, 3000);
    }
};
