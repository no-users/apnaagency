// Global Firebase Configuration (CRITICAL FIX: Ab yeh config JS file mein hai)
// NOTE: Apni HTML file se '<script>...</script>' ke andar wali config hata dein.
const firebaseConfig = {
    apiKey: "AIzaSyAXHD3qrc_sRPzUwpd6kLqGVrOqb2XqMpk",
    authDomain: "my-login-page-62659.firebaseapp.com",
    projectId: "my-login-page-62659",
    storageBucket: "my-login-page-62659.firebasestorage.app",
    messagingSenderId: "265063991992",
    appId: "1:265063991992:web:f1834f4664e5494779024d",
    measurementId: "G-EJ7P52JB4N"
};

// Debugging के लिए Firestore लॉगिंग चालू करें
if (typeof firebase !== 'undefined' && typeof firebase.firestore !== 'undefined') {
    firebase.firestore.setLogLevel('Debug');
}

// Canvas Global Variables (Sahi config se value le rahe hain)
const appId = firebaseConfig.appId; 
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app, auth, db, userId = null;
let isAuthReady = false;
let messageBox;
let messageTimeout;

/**
 * कस्टम टोस्ट/मैसेज बॉक्स प्रदर्शित करता है।
 */
function showMessage(msg, isError = false) {
    if (!messageBox) {
        // Safety check, par DOMContentLoaded mein initialize hota hai
        messageBox = document.getElementById('message-box');
        if (!messageBox) {
            console.error("Message Box element not found in DOM. Ensure you have <div id='message-box'></div> in your HTML.");
            return;
        }
    }

    clearTimeout(messageTimeout);
    messageBox.textContent = msg;
    messageBox.className = 'show'; 
    messageBox.classList.add(isError ? 'error' : 'success');

    // 4 सेकंड के बाद संदेश बॉक्स को छुपाएं
    messageTimeout = setTimeout(() => {
        messageBox.className = '';
    }, 4000);
}

// --- Firebase Initialization and Auth ---
async function initFirebase() {
    if (typeof firebase === 'undefined' || typeof firebase.initializeApp === 'undefined') {
        showMessage("Firebase पुस्तकालय लोड नहीं हो पाया। कृपया इंटरनेट कनेक्शन जांचें।", true);
        return;
    }

    if (Object.keys(firebaseConfig).length === 0 || !firebaseConfig.apiKey) {
        showMessage("Firebase कॉन्फ़िगरेशन नहीं मिला।", true);
        return;
    }

    try {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();

        if (initialAuthToken) {
            await auth.signInWithCustomToken(initialAuthToken);
        }
        
        // Agar user register nahi hai toh ek guest ID mil jayegi
        userId = auth.currentUser ? auth.currentUser.uid : crypto.randomUUID();
        isAuthReady = true;
        console.log("Firebase initialized. Current User ID (or Guest ID):", userId);
        
        const userIdDisplay = document.getElementById('user-id-display');
        if (userIdDisplay) {
            userIdDisplay.textContent = `User ID (for team access): ${userId}`;
        }

    } catch (error) {
        console.error("Authentication failed:", error);
        showMessage(`प्रमाणीकरण विफल: ${error.message}`, true);
    }
}

/**
 * फ़ॉर्म सबमिशन को संभालता है, सभी फ़ील्ड्स को मान्य करता है, और Firebase में रजिस्ट्रेशन करता है।
 */
window.handleRegistration = async function() {
    if (!isAuthReady) {
        showMessage("Firebase अभी शुरू नहीं हुआ है। कृपया प्रतीक्षा करें।", true);
        return;
    }

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
    
    // CRITICAL FIX: Sahi Password input ID 'passwordInput'
    const password = document.getElementById('passwordInput').value.trim(); 
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    
    const termsAccepted = document.getElementById('terms').checked;

    // --- Validation Logic ---
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
    
    // Mobile number validation (Optional, for better UX)
    if (!/^\d{10}$/.test(mobile)) {
        showMessage('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।', true);
        return;
    }
    
    if (!termsAccepted) {
        showMessage('रजिस्टर करने के लिए आपको नियमों और शर्तों से सहमत होना होगा।', true);
        return;
    }
    // --- End Validation Logic ---

    // --- Mobile Number Global Check (Uniqueness) ---
    try {
        const uniqueIdentifiersCollection = `artifacts/${appId}/public/data/unique_identifiers`;
        
        const querySnapshot = await db.collection(uniqueIdentifiersCollection)
            .where("mobile", "==", mobile)
            .limit(1)
            .get();

        if (!querySnapshot.empty) {
            showMessage('यह मोबाइल नंबर पहले से ही पंजीकृत है।', true);
            return; 
        }

    } catch (error) {
        console.error("Firestore Mobile Check Error:", error);
        // Note: Security rules check karein agar yahan error aaye
    }
    
    // --- End Mobile Number Check ---

    try {
        // 1. Firebase Authentication: Create User
        // Agar yeh step fail hota hai toh data save nahi hoga. (Check: Email/Password Auth enabled)
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // 2. Firestore: Save User Profile Data (Private)
        const userProfile = {
            firstName: firstName,
            lastName: lastName,
            mobile: mobile,
            email: email,
            createdAt: new Date().toISOString()
        };
        
        await db.collection(`artifacts/${appId}/users/${user.uid}/profiles`).doc('user-profile').set(userProfile);

        // 3. Firestore: Save Mobile Number to Public Collection for Uniqueness Check
        // Agar yeh step fail hota hai toh Firestore Rules check karein.
        const uniqueIdentifiersCollection = `artifacts/${appId}/public/data/unique_identifiers`;
        await db.collection(uniqueIdentifiersCollection).doc(user.uid).set({ 
            mobile: mobile, 
            email: email, 
            uid: user.uid 
        });

        showMessage('पंजीकरण सफल! आपका खाता बन गया है।', false);
        console.log("Registration successful for user:", user.uid);

    } catch (error) {
        console.error("Registration Error:", error);
        
        let errorMsg = 'पंजीकरण विफल। कृपया बाद में पुनः प्रयास करें।';
        
        if (error.code === 'auth/email-already-in-use') {
            errorMsg = 'यह ईमेल पहले से ही उपयोग में है।';
        } else if (error.code === 'auth/weak-password') {
            errorMsg = 'पासवर्ड बहुत कमजोर है।';
        }
        // Agar 'auth/permission-denied' ya koi aur permission error aaye toh console dekhein.
        
        showMessage(`त्रुटि: ${errorMsg} (${error.message})`, true);
    }
};

// --- Password Toggle Logic ---
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

// --- Auto-Slider Logic ---
let currentSlide = 0;
let slidesContainer = null;
let slides = [];
let totalSlides = 0;

function showSlide(index) {
    if (slidesContainer) {
        slidesContainer.style.transform = `translateX(-${index * 100}%)`;
    }
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    showSlide(currentSlide);
}

// --- Initialization Block (DOMContentLoaded) ---
// FIX: Ab sabhi initializations DOM load hote hi honge.
document.addEventListener('DOMContentLoaded', () => {
    // 1. Form-related setup
    setupPasswordToggle();

    // 2. Message Box Initialization
    messageBox = document.getElementById('message-box'); 
    
    // 3. Firebase Initialization
    initFirebase();

    // 4. Slider Initialization
    slidesContainer = document.getElementById('slides-container');
    slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;

    // 5. Auto-Slider शुरू करें 
    if (slidesContainer && totalSlides > 0) {
        showSlide(currentSlide);
        setInterval(nextSlide, 3000);
    }
});
