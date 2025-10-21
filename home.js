// home.js

// Firebase SDKs Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// -----------------------------------------------------
// 1. CRITICAL CONFIGURATION (MUST MATCH signin.js)
// -----------------------------------------------------
// ⚠️ चेतावनी: यह कॉन्फ़िगरेशन आपके signin.js से EXACTLY मैच करना चाहिए!
const firebaseConfig = {
    apiKey: "AIzaSyAXHD3qrc_sRPzUwpd6kLqGVrOqb2XqMpk", // यह key signin.js से समान होनी चाहिए
    authDomain: "my-login-page-62659.firebaseapp.com",
    projectId: "my-login-page-62659",
    storageBucket: "my-login-page-62659.firebasestorage.app",
    messagingSenderId: "265063991992",
    appId: "1:265063991992:web:f1834f4664e5494779024d",
    measurementId: "G-EJ7P52JB4N"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 

// -----------------------------------------------------
// 2. LOGOUT FUNCTION
// -----------------------------------------------------

/**
 * उपयोगकर्ता को Firebase से लॉगआउट करता है और उन्हें लॉगिन पेज पर रीडायरेक्ट करता है।
 */
function handleLogout() {
    signOut(auth).then(() => {
        // Sign-out successful.
        console.log("User signed out successfully.");
        
        // लॉगआउट के बाद साइन-इन पेज पर भेजें
        window.location.href = "signin.html"; 
        
    }).catch((error) => {
        console.error("Logout Error:", error);
        alert("Logout failed. Please try again.");
    });
}

// -----------------------------------------------------
// 3. MAIN SECURITY & INITIALIZATION
// -----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    
    // 🚀 CRITICAL: Firebase Auth Status Check
    // यह फ़ंक्शन Firebase के लोड होने का इंतजार करता है और सबसे पहले चलता है।
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // ✅ SUCCESS: उपयोगकर्ता लॉग इन है। होम पेज लोड होता रहेगा।
            console.log("SUCCESS: User is logged in. Welcome!", user.email);
            
            // a. Display Name Update (Firebase से डेटा प्राप्त करें)
            // home.js में onAuthStateChanged के अंदर, जब (user) मौजूद हो:

// home.js में onAuthStateChanged के अंदर:

// a. Display Name Update (Firebase से डेटा प्राप्त करें)
const userNameDisplayElement = document.getElementById('userNameDisplay');

if (userNameDisplayElement) {
    let displayFirstName = 'User'; // डिफ़ॉल्ट मान

    if (user.displayName) {
        // 1. displayName से अनावश्यक स्पेस हटाएँ (trim)
        const trimmedName = user.displayName.trim();
        
        if (trimmedName) {
            // 2. स्पेस से विभाजित करें और केवल पहला शब्द (First Name) लें
            const fullNameParts = trimmedName.split(/\s+/); // सभी प्रकार के स्पेस को हैंडल करता है
            displayFirstName = fullNameParts[0];
        }
        
    } else if (user.email) {
        // यदि displayName उपलब्ध नहीं है, तो ईमेल का पहला भाग लें
        displayFirstName = user.email.split('@')[0];
    } 
    
    // 3. आउटपुट में उपयोग करें
    userNameDisplayElement.innerText = `Hello, ${displayFirstName}`;
}
            // b. Log Out Button Setup
            const logoutButton = document.getElementById('logoutButton');
            if (logoutButton) {
                logoutButton.addEventListener('click', handleLogout);
            }
            
        } else {
            // 🚫 FAIL: उपयोगकर्ता लॉग आउट है।
            console.log("FAILURE: User is NOT logged in. Redirecting to signin page.");
            
            // यदि लॉग इन नहीं है, तो तुरंत लॉगिन पेज पर रीडायरेक्ट करें
            window.location.href = "signin.html"; 
        }
    });

    // -----------------------------------------------------
    // 4. SLIDER LOGIC (होम पेज या डैशबोर्ड पर स्लाइडर है तो)
    // -----------------------------------------------------
    // यदि आपके होम पेज में स्लाइडर नहीं है, तो इस भाग को हटा दें।
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    
    function showSlide(index) {
        if (slides.length === 0) return;
        // ... (आपके स्लाइडर का CSS लॉजिक)
        // यदि आप वही स्लाइडर लॉजिक चाहते हैं, तो सुनिश्चित करें कि CSS क्लास 'active-slide' सही है।
        // यहाँ हम सादगी के लिए केवल रोटेशन का लॉजिक रखते हैं।
    }

    function nextSlide() {
        if (slides.length === 0) return;
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    if (slides.length > 0) {
        showSlide(currentSlide);
        // 5 second interval
        setInterval(nextSlide, 5000); 
    }


});

