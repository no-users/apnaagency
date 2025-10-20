// forgetpassword.js

// Firebase SDKs Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAXHD3qrc_sRPzUwpd6kLqGVrOqb2XqMpk",
    authDomain: "my-login-page-62659.firebaseapp.com",
    projectId: "my-login-page-62659",
    storageBucket: "my-login-page-62659.firebasestorage.app",
    messagingSenderId: "265063991992",
    appId: "1:265063991992:web:f1834f4664e5494779024d",
    measurementId: "G-EJ7P52JB4N"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


// --- GLOBAL SLIDER VARIABLES (इन्हें UI लॉजिक के लिए रहने दें) ---
let currentSlide = 0;
let slidesContainer = null;
let slides = [];
let totalSlides = 0;

// --- UTILITY FUNCTIONS ---

/**
 * स्टेटस मैसेज (सफलता/त्रुटि) को HTML में प्रदर्शित करता है।
 */
function showMessage(message, type) {
    const statusMessage = document.getElementById("status-message");
    if (statusMessage) {
        statusMessage.textContent = message;
        statusMessage.className = `message show ${type}`;
    }
}

/**
 * स्लाइड प्रदर्शित करें (Core Slider Logic).
 */
function showSlide(index) {
    if (slidesContainer) {
        slidesContainer.style.transform = `translateX(-${index * 100}%)`;
    }
}

/**
 * अगली स्लाइड पर जाएँ.
 */
function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}


// --- MAIN INITIALIZATION (Form and Slider Logic) ---

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. FORM SUBMISSION LOGIC 
    const form = document.getElementById("forgot-password-form");

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            
            const emailInput = document.getElementById("email-input");
            const email = emailInput ? emailInput.value.trim() : '';

            if (!email) {
                showMessage("Please enter your email address.", "error");
                return;
            }

            showMessage("Sending recovery link...", "info");

            // 🚀 Firebase SDK का आधिकारिक तरीका
            sendPasswordResetEmail(auth, email)
            .then(() => {
                // सफलता और त्रुटि दोनों पर सुरक्षा के लिए समान संदेश दिखाएँ
                showMessage("If this email is registered, a recovery link has been sent. Check your inbox!", "success");
            })
            .catch((error) => {
                console.error("Firebase Auth Error:", error.code, error.message);
                // यह संदेश किसी भी Auth त्रुटि को छिपा देगा।
                showMessage("If this email is registered, a recovery link has been sent. Check your inbox!", "success");
            });
        });
    }


    // 2. SLIDER INITIALIZATION
    slidesContainer = document.getElementById('slides-container'); 
    slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;
    
    if (slidesContainer && totalSlides > 1) {
        showSlide(currentSlide); 
        setInterval(nextSlide, 3000); 
    }
});


// ===============================================
// 🚀 क्लोज बटन लॉजिक (अलग DOMContentLoaded ब्लॉक)
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
    
    // ये ID HTML में होनी चाहिए, जैसा कि पिछले उत्तर में बताया गया था।
    const closeButton = document.getElementById("close-status-btn");
    const statusMessage = document.getElementById("status-message");

    if (closeButton && statusMessage) {
        closeButton.addEventListener('click', () => {
            statusMessage.classList.remove('show');
            // मैसेज को रीसेट करने के लिए
            statusMessage.textContent = ''; 
            statusMessage.className = 'message'; // केवल 'message' क्लास रखें
        });
    }
});

// end of forgetpassword.js
