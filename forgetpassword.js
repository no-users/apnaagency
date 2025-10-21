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


// --- GLOBAL SLIDER VARIABLES ---
let currentSlide = 0;
let slidesContainer = null;
let slides = [];
let totalSlides = 0;

// --- UTILITY FUNCTIONS ---

/**
 * संदेश प्रदर्शित करें: या तो पुराना #status-message (लोडिंग), या नया success-popup (सफलता)।
 */
function showMessage(message, type) {
    const successPopupOverlay = document.getElementById("success-popup-overlay");
    const successPopupMessage = document.getElementById("success-popup-message");
    const successPopupTitle = successPopupOverlay ? successPopupOverlay.querySelector('h3') : null;
    const successPopupIcon = successPopupOverlay ? successPopupOverlay.querySelector('.success-icon') : null;
    const oldStatusMessage = document.getElementById("status-message");

    // सफलता संदेश के लिए नया POPUP दिखाएं
    if (type === "success" && successPopupOverlay && successPopupMessage) {
        successPopupMessage.textContent = message;
        if (successPopupTitle) successPopupTitle.textContent = "Success!";
        if (successPopupIcon) {
            successPopupIcon.className = "fas fa-check-circle success-icon";
            successPopupIcon.style.color = "#28a745";
        }
        successPopupOverlay.classList.add('show-popup');
        
        // फॉर्म के नीचे से लोडिंग संदेश छिपा दें
        if (oldStatusMessage) oldStatusMessage.style.display = 'none';

    } else if (oldStatusMessage) {
        // अन्य संदेशों ("Sending recovery link...") के लिए पुराना संदेश दिखाएं
        oldStatusMessage.textContent = message;
        // status-close-btn को छिपा दें जब यह लोडिंग मैसेज हो
        const statusCloseBtn = document.getElementById("close-status-btn");
        if (statusCloseBtn) statusCloseBtn.style.display = 'none';

        oldStatusMessage.className = `message show ${type}`;
        oldStatusMessage.style.display = 'block';
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


// --- MAIN INITIALIZATION (DOM Ready Logic) ---

document.addEventListener('DOMContentLoaded', () => {
    
    // DOM Elements
    const form = document.getElementById("forgot-password-form");
    const successPopupOverlay = document.getElementById("success-popup-overlay");
    const successPopupCloseBtn = document.getElementById("success-popup-close-btn");
    const successPopupOkBtn = document.getElementById("success-popup-ok-btn");
    
    // --- 1. FORM SUBMISSION LOGIC ---
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            
            // सुनिश्चित करें कि फॉर्म सबमिट होने पर कोई पिछला संदेश छिपा हो
            if (successPopupOverlay) successPopupOverlay.classList.remove('show-popup');
            
            const emailInput = document.getElementById("email-input");
            const email = emailInput ? emailInput.value.trim() : '';

            if (!email) {
                showMessage("Please enter your email address.", "error");
                return;
            }

            // लोडिंग मैसेज दिखाएं
            showMessage("Sending recovery link...", "info");

            // Firebase SDK का आधिकारिक तरीका
            sendPasswordResetEmail(auth, email)
            .then(() => {
                showMessage("If this email is registered, a recovery link has been sent. Check your inbox!", "success");
            })
            .catch((error) => {
                console.error("Firebase Auth Error:", error.code, error.message);
                // सुरक्षा के लिए सफलता संदेश दिखाएं, भले ही कोई Auth त्रुटि हो
                showMessage("If this email is registered, a recovery link has been sent. Check your inbox!", "success");
            });
        });
    }

    // --- 2. SLIDER INITIALIZATION ---
    slidesContainer = document.getElementById('slides-container'); 
    slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;
    
    if (slidesContainer && totalSlides > 1) {
        showSlide(currentSlide); 
        setInterval(nextSlide, 3000); 
    }

    // --- 3. POPUP CLOSE LOGIC ---
    const hideSuccessPopup = () => {
        if (successPopupOverlay) {
            successPopupOverlay.classList.remove('show-popup');
            
            // पुराने #status-message को रीसेट करें (लोडिंग मैसेज को हटाने के लिए)
            const oldStatusMessage = document.getElementById("status-message");
            if (oldStatusMessage) {
                oldStatusMessage.textContent = '';
                oldStatusMessage.className = 'message';
                oldStatusMessage.style.display = 'none';
            }
        }
    };

    if (successPopupCloseBtn) {
        successPopupCloseBtn.addEventListener('click', hideSuccessPopup);
    }
    if (successPopupOkBtn) {
        successPopupOkBtn.addEventListener('click', hideSuccessPopup);
    }
    
    // पुराना status-message close button:
    const oldStatusMessage = document.getElementById("status-message");
    const statusCloseBtn = document.getElementById("close-status-btn");
    if (statusCloseBtn && oldStatusMessage) {
        statusCloseBtn.addEventListener('click', () => {
            oldStatusMessage.style.display = 'none';
        });
    }
});
