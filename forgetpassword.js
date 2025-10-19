// forgetpassword.js

// 🚀 NOTE: क्योंकि आप 'import' स्टेटमेंट का उपयोग कर रहे हैं,
// आपको अपने HTML में script टैग को इस प्रकार बदलना होगा:
// <script src="forgetpassword.js" type="module"></script>

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// --- 1. CONFIGURATION ---
const firebaseConfig = {
    // ⚠️ अपनी वास्तविक Firebase Keys का उपयोग करें
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
// ⚠️ Cloud Function URL: CORS समस्या को सर्वर साइड (Cloud Function कोड) पर ठीक करना होगा।
const resetEndpoint = 'https://us-central1-my-login-page-62659.cloudfunctions.net/checkUserAndSendResetEmail';

// --- 2. GLOBAL SLIDER VARIABLES ---
let currentSlide = 0;
let slidesContainer = null;
let slides = [];
let totalSlides = 0;

// --- 3. UTILITY FUNCTIONS ---

/**
 * स्टेटस मैसेज (सफलता/त्रुटि) को HTML में प्रदर्शित करता है।
 */
function showMessage(message, type) {
    // #status-message को अपने HTML में forgot-password-form के ठीक नीचे जोड़ना याद रखें!
    let statusMessage = document.getElementById("status-message");

    // यदि status-message तत्व मौजूद नहीं है, तो इसे dynamically बनाएं
    if (!statusMessage) {
        statusMessage = document.createElement('div');
        statusMessage.id = 'status-message';
        document.getElementById("forgot-password-form").appendChild(statusMessage);
    }
    
    statusMessage.textContent = message;
    statusMessage.className = `show ${type}`;
}

/**
 * स्लाइड प्रदर्शित करें (Core Slider Logic).
 */
function showSlide(index) {
    if (slidesContainer) {
        // यह CSS transform स्लाइडर को horizontal slide करता है।
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


// --- 4. MAIN INITIALIZATION ---

document.addEventListener('DOMContentLoaded', () => {
    
    // --- FORM SUBMISSION LOGIC ---
    const submitButton = document.querySelector("#forgot-password-form .submit-btn");
    const emailInput = document.getElementById("email-input");

    if (submitButton) {
        submitButton.addEventListener("click", function (e) {
            e.preventDefault();
            
            if (!emailInput || !emailInput.value.trim()) {
                showMessage("Please enter your email address.", "error");
                return;
            }
            const email = emailInput.value.trim();

            showMessage("Sending recovery link...", "info");

            // Cloud Function Fetch Logic (CORS Fix सर्वर साइड पर लागू होना चाहिए)
            fetch(resetEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email }),
            })
            .then(response => {
                // चेक करें कि response ठीक है (CORS फिक्स होने पर)
                if (!response.ok) {
                    // यदि सर्वर 4xx/5xx error देता है, तो हम JSON को parse करने का प्रयास करते हैं
                    return response.json().catch(() => {
                         // यदि JSON parse नहीं हो पाता, तो एक generic error throw करें
                         throw new Error(`Server returned status: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                // क्लाउड फंक्शन से success या sent: true आने पर
                if (data.success || data.sent) {
                    showMessage("If this email is registered, a recovery link has been sent. Check your inbox!", "success");
                } else {
                    // सर्वर से कोई स्पष्ट त्रुटि संदेश आने पर
                    showMessage(data.message || "An unexpected issue occurred.", "error");
                }
            })
            .catch(error => {
                // Failed to fetch (CORS block) या Network Error
                console.error("Fetch Error:", error);
                showMessage("Connection Error: Could not reach the server (CORS issue likely).", "error");
            });
        });
    }

    // --- SLIDER INITIALIZATION LOGIC ---
    slidesContainer = document.getElementById('slides-container');
    slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;
    
    if (slidesContainer && totalSlides > 1) {
        showSlide(currentSlide); // Show the first slide immediately
        // Set the slider to change slides every 3 seconds (3000ms)
        setInterval(nextSlide, 3000); 
    } else if (totalSlides <= 1) {
        console.warn("Slider not started: Need at least 2 slides.");
    }
});

// end of forgetpassword.js
