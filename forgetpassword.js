// forgetpassword.js

// Firebase SDKs Imports
// Note: We use type="module" in the HTML, so imports are necessary.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

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
const resetEndpoint = 'https://us-central1-my-login-page-62659.cloudfunctions.net/checkUserAndSendResetEmail';


// --- GLOBAL SLIDER VARIABLES ---
// इन्हें केवल एक बार, बाहरी स्कोप में घोषित करें।
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


// --- MAIN INITIALIZATION: WRAP EVERYTHING HERE ---
// यह सुनिश्चित करता है कि DOM लोड होने के बाद ही सभी तत्व एक्सेस किए जाएं।
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. FORM & STATUS MESSAGE SETUP 
    const form = document.getElementById("forgot-password-form");
    
    // 🚀 NOTE: आपके HTML में फॉर्म टैग नहीं है, केवल div है। 
    // हम div को form की तरह इस्तेमाल कर रहे हैं, लेकिन सबमिट बटन पर इवेंट लिसनर लगा रहे हैं।
    const submitButton = document.querySelector("#forgot-password-form .submit-btn");

    if (submitButton) {
        submitButton.addEventListener("click", function (e) {
            e.preventDefault();
            
            // इनपुट फ़ील्ड से ईमेल प्राप्त करें
            const emailInput = document.getElementById("email-input");
            if (!emailInput || !emailInput.value.trim()) {
                showMessage("Please enter your email address.", "error");
                return;
            }
            const email = emailInput.value.trim();

            showMessage("Sending recovery link...", "info");

            // Cloud Function Call Logic
            fetch(resetEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email }),
            })
            .then(response => response.json())
            .then(data => {
                // यह संदेश तब भी सुरक्षित रूप से दिया जाता है जब ईमेल पंजीकृत न हो, 
                // ताकि किसी को यह पता न चले कि कौन सा ईमेल मौजूद है।
                if (data.success || data.sent) {
                    showMessage("If this email is registered, a recovery link has been sent. Check your inbox!", "success");
                } else {
                    showMessage("If this email is registered, a recovery link has been sent. Check your inbox!", "error"); 
                }
            })
            .catch(error => {
                console.error("Error calling Cloud Function:", error);
                showMessage("An error occurred. Please try again.", "error");
            });
        });
    }


    // 2. SLIDER INITIALIZATION
    // ग्लोबल वेरिएबल्स को DOM तत्वों से असाइन करें।
    slidesContainer = document.getElementById('slides-container'); // यह सही है
    slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;
    
    if (slidesContainer && totalSlides > 1) {
        showSlide(currentSlide); // पहली स्लाइड तुरंत दिखाएं
        setInterval(nextSlide, 3000); // हर 3 सेकंड में स्लाइड बदलें
    } else if (totalSlides <= 1) {
        console.warn("Slider not started: Need at least 2 slides.");
    }
});

// end of forgetpassword.js