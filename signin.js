// signin.js

// Firebase SDKs Imports
// Firebase v9/v10 module imports are required for modern browser support
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup 
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// -----------------------------------------------------
// 1. CONFIGURATION (इसे अपनी वास्तविक Firebase सेटिंग्स से अपडेट करें!)
// -----------------------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyAXHD3qrc_sRPzUwpd6kLqGVrOqb2XqMpk", // ⚠️ यहाँ अपनी Key अपडेट करें
    authDomain: "my-login-page-62659.firebaseapp.com",
    projectId: "my-login-page-62659",
    storageBucket: "my-login-page-62659.firebasestorage.app",
    messagingSenderId: "265063991992",
    appId: "1:265063991992:web:f1834f4664e5494779024d",
    measurementId: "G-EJ7P52JB4N"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();


// -----------------------------------------------------
// 2. GLOBAL SLIDER VARIABLES
// -----------------------------------------------------
let currentSlide = 0;
let slidesContainer = null;
let totalSlides = 0;


// -----------------------------------------------------
// 3. UTILITY FUNCTIONS (MESSAGING & UI)
// -----------------------------------------------------

/**
 * स्टेटस मैसेज (सफलता/त्रुटि/लोडिंग) को HTML में प्रदर्शित करता है।
 */
function showMessage(message, type) {
    const statusMessage = document.getElementById("status-message");
    if (statusMessage) {
        statusMessage.textContent = message;
        // statusMessage की क्लास को show, error, या info सेट करता है
        statusMessage.className = `message show ${type}`;
        statusMessage.style.display = 'block';
    }
}

/**
 * पासवर्ड दिखाने/छिपाने के लिए टॉगल फ़ंक्शन।
 */
function setupPasswordToggle() {
    const togglePassword = document.getElementById("toggle-password");
    const passwordInput = document.getElementById("password-input");

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);
            // आइकन बदलने के लिए
            this.classList.toggle("fa-eye");
            this.classList.toggle("fa-eye-slash");
        });
    }
}

// -----------------------------------------------------
// 4. SLIDER LOGIC
// -----------------------------------------------------

function showSlide(index) {
    if (slidesContainer) {
        slidesContainer.style.transform = `translateX(-${index * 100}%)`;
    }
}

function nextSlide() {
    // अगले स्लाइड पर जाएँ, अगर अंतिम स्लाइड है तो पहली स्लाइड पर वापस जाएँ
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}


// -----------------------------------------------------
// 5. MAIN INITIALIZATION (DOM Ready Logic)
// -----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    
    // --- SLIDER INITIALIZATION ---
    slidesContainer = document.getElementById('slides-container'); 
    const slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;
    
    // स्लाइडर को 3 सेकंड के अंतराल पर शुरू करें
    if (slidesContainer && totalSlides > 1) {
        showSlide(currentSlide); 
        // 3000ms = 3 seconds
        setInterval(nextSlide, 3000); 
    }


    // --- LOGIN FORM LOGIC ---
    const form = document.getElementById("login-form");
    const googleBtn = document.getElementById("google-signin-btn");
    const submitBtn = form ? form.querySelector('.submit-btn') : null;

    setupPasswordToggle();

    // A. EMAIL/PASSWORD LOGIN
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            
            if (submitBtn) submitBtn.disabled = true;
            
            const email = document.getElementById("email-input").value.trim();
            const password = document.getElementById("password-input").value.trim();

            if (!email || !password) {
                showMessage("Please enter both email and password.", "error");
                if (submitBtn) submitBtn.disabled = false;
                return;
            }

            showMessage("Logging in...", "info");

            signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                showMessage("Login successful! Redirecting...", "info");
                
                // 🚀 सफलता पर होम पेज पर रीडायरेक्ट करें 🚀
                window.location.href = "home.html"; // अपने होम पेज के नाम से बदलें
            })
            .catch((error) => {
                let errorMessage = "Login Failed: Invalid email or password.";
                // Firebase error codes के आधार पर विशिष्ट संदेश
                if (error.code === 'auth/too-many-requests') {
                    errorMessage = "Too many failed attempts. Try again later.";
                } else if (error.code === 'auth/invalid-credential') {
                     errorMessage = "Login Failed: Invalid email or password.";
                }
                showMessage(errorMessage, "error");
            })
            .finally(() => {
                 // बटन को पुनः सक्षम करें (असफल या सफल, यदि रीडायरेक्ट नहीं हुआ)
                 if (submitBtn) submitBtn.disabled = false;
            });
        });
    }

    // B. GOOGLE SIGN-IN
    if (googleBtn) {
        googleBtn.addEventListener("click", () => {
            showMessage("Signing in with Google...", "info");

            signInWithPopup(auth, googleProvider)
            .then((result) => {
                showMessage("Google Login successful! Redirecting...", "info");
                
                // 🚀 सफलता पर होम पेज पर रीडायरेक्ट करें 🚀
                window.location.href = "home.html"; // अपने होम पेज के नाम से बदलें
            })
            .catch((error) => {
                let errorMessage = "Google sign-in failed.";
                if (error.code === 'auth/popup-closed-by-user') {
                    errorMessage = "Sign-in cancelled by user.";
                }
                showMessage(errorMessage, "error");
            });
        });
    }
});
