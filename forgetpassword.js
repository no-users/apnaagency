// forgetpassword.js

// Firebase SDKs Imports
// 🚀 FIX: sendPasswordResetEmail फ़ंक्शन को यहाँ Import करें
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
// ❌ REMOVED: अब resetEndpoint की कोई आवश्यकता नहीं है
// const resetEndpoint = 'https://us-central1-my-login-page-62659.cloudfunctions.net/checkUserAndSendResetEmail'; 


// --- GLOBAL SLIDER VARIABLES ---
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


// --- MAIN INITIALIZATION ---
// --- MAIN INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. FORM SUBMISSION LOGIC (पासवर्ड रीसेट)
    // फॉर्म को ID से एक्सेस करें, यह सबमिट बटन से ज़्यादा विश्वसनीय है।
    const form = document.getElementById("forgot-password-form");

    if (form) {
        // हम फॉर्म के 'submit' इवेंट को सुनते हैं, न कि केवल बटन के 'click' को
        form.addEventListener("submit", function (e) {
            e.preventDefault(); // फॉर्म को सबमिट होने से रोकता है
            
            // इनपुट फ़ील्ड से ईमेल प्राप्त करें
            const emailInput = document.getElementById("email-input");
            const email = emailInput ? emailInput.value.trim() : '';

            if (!email) {
                showMessage("Please enter your email address.", "error");
                return;
            }

            showMessage("Sending recovery link...", "info");

            // 🚀 Firebase SDK का उपयोग करके पासवर्ड रीसेट ईमेल भेजें
            sendPasswordResetEmail(auth, email)
            .then(() => {
                showMessage("If this email is registered, a recovery link has been sent. Check your inbox!", "success");
            })
            .catch((error) => {
                console.error("Firebase Auth Error:", error.code, error.message);
                showMessage("If this email is registered, a recovery link has been sent. Check your inbox!", "success");
            });
        });
    }


    // 2. SLIDER INITIALIZATION (इसे उसी तरह रहने दें)
    slidesContainer = document.getElementById('slides-container'); 
    slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;
    
    if (slidesContainer && totalSlides > 1) {
        showSlide(currentSlide); 
        setInterval(nextSlide, 3000); 
    }
});

// end of forgetpassword.js
