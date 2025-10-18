// FIX: Removed all 'import' statements. Now we access Firebase through the global 'firebase' object

// Debugging के लिए Firestore लॉगिंग चालू करें
if (typeof firebase !== 'undefined' && typeof firebase.firestore !== 'undefined') {
    firebase.firestore.setLogLevel('Debug');
}

// Canvas Global Variables (MANDATORY)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app, auth, db, userId = null;
let isAuthReady = false;

// --- Custom Message Box (Replacing alert()) ---
// messageBox को अब सिर्फ़ डिक्लेयर किया गया है
let messageBox; 
let messageTimeout;

/**
 * कस्टम टोस्ट/मैसेज बॉक्स प्रदर्शित करता है।
 * @param {string} msg - प्रदर्शित करने के लिए संदेश।
 * @param {boolean} isError - यदि सत्य है, तो त्रुटि शैली लागू करें।
 */
function showMessage(msg, isError = false) {
    if (!messageBox) {
        // Fallback/Safety Check: यदि संदेश बॉक्स अभी भी null है, तो इसे सीधे प्राप्त करने का प्रयास करें
        messageBox = document.getElementById('message-box');
        if (!messageBox) {
            console.error("Message Box element not found in DOM.");
            return;
        }
    }
    
    clearTimeout(messageTimeout);
    messageBox.textContent = msg;
    messageBox.className = 'show'; // 'show' क्लास जोड़ें
    messageBox.classList.add(isError ? 'error' : 'success');

    // 4 सेकंड के बाद संदेश बॉक्स को छुपाएं
    messageTimeout = setTimeout(() => {
        messageBox.className = '';
    }, 4000);
}

// --- Firebase Initialization and Auth (Now using firebase.auth() and firebase.firestore()) ---
async function initFirebase() {
    if (typeof firebase === 'undefined' || typeof firebase.initializeApp === 'undefined') {
        showMessage("Firebase पुस्तकालय लोड नहीं हो पाया। कृपया इंटरनेट कनेक्शन जांचें।", true);
        console.error("Firebase library failed to load.");
        return;
    }

    if (Object.keys(firebaseConfig).length === 0) {
        console.error("Firebase configuration is missing.");
        showMessage("Firebase कॉन्फ़िगरेशन नहीं मिला। (Firebase configuration missing.)", true);
        return;
    }

    try {
        // Initialize App
        app = firebase.initializeApp(firebaseConfig);
        
        // Get Services (using compat methods/global access)
        auth = firebase.auth();
        db = firebase.firestore();

        if (initialAuthToken) {
            await auth.signInWithCustomToken(initialAuthToken);
        } else {
            await auth.signInAnonymously();
        }
        
        userId = auth.currentUser ? auth.currentUser.uid : crypto.randomUUID();
        isAuthReady = true;
        console.log("Firebase initialized. User ID:", userId);
        document.getElementById('user-id-display').textContent = `User ID (for team access): ${userId}`;

    } catch (error) {
        console.error("Authentication failed:", error);
        showMessage(`प्रमाणीकरण विफल: ${error.message} (Authentication failed)`, true);
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
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const termsAccepted = document.getElementById('terms').checked;

    // --- Validation Logic (Single Step) ---
    if (!firstName || !lastName || !email || !mobile || !password || !confirmPassword) {
        showMessage('कृपया सभी आवश्यक फ़ील्ड भरें।', true);
        return;
    }

    if (password !== confirmPassword) {
        showMessage('पासवर्ड मेल नहीं खा रहे हैं। (Passwords do not match.)', true);
        return;
    }

    if (password.length < 6) {
        showMessage('पासवर्ड कम से कम 6 अक्षर का होना चाहिए।', true);
        return;
    }

    if (!termsAccepted) {
        showMessage('रजिस्टर करने के लिए आपको नियमों और शर्तों से सहमत होना होगा।', true);
        return;
    }
    // --- End Validation Logic ---

    // --- Mobile Number Global Check (Public collection for uniqueness) ---
    // Note: Firestore (v9 compat) uses old method syntax (db.collection, .where, .get)
    try {
        const uniqueIdentifiersCollection = `artifacts/${appId}/public/data/unique_identifiers`;
        
        // Check if mobile number is already in the unique identifiers list
        const querySnapshot = await db.collection(uniqueIdentifiersCollection)
            .where("mobile", "==", mobile)
            .get();

        if (!querySnapshot.empty) {
            showMessage('यह मोबाइल नंबर पहले से ही पंजीकृत है।', true);
            return; // Stop registration
        }

    } catch (error) {
        console.error("Firestore Mobile Check Error:", error);
    }
    
    // --- End Mobile Number Check ---


    try {
        // 1. Firebase Authentication: Create User
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
        
        // Private data path: /artifacts/{appId}/users/{userId}/profiles/{docId}
        await db.collection(`artifacts/${appId}/users/${user.uid}/profiles`).doc('user-profile').set(userProfile);

        // 3. Firestore: Save Mobile Number to Public Collection for Uniqueness Check
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
        
        // CHECK FOR EMAIL ALREADY IN USE
        if (error.code === 'auth/email-already-in-use') {
            errorMsg = 'यह ईमेल पहले से ही उपयोग में है।';
        } else if (error.code === 'auth/weak-password') {
            errorMsg = 'पासवर्ड बहुत कमजोर है।';
        }
        
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

// --- DOMContentLoaded / Window Load ---
document.addEventListener('DOMContentLoaded', () => {
    // Form-related setup
    setupPasswordToggle();
    
    // Initialize slider variables after DOM is ready
    slidesContainer = document.getElementById('slides-container');
    slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;
});

// ऑटो-स्लाइडिंग और Firebase को विंडो लोड होने पर शुरू करें
window.onload = function() {
    // messageBox वेरिएबल को DOM लोड होने के बाद ही असाइन करें
    messageBox = document.getElementById('message-box'); 
    
    initFirebase(); // Firebase और Auth शुरू करें
    
    // Auto-Slider शुरू करें (हर 3 सेकंड में)
    if (slidesContainer && totalSlides > 0) {
        showSlide(currentSlide);
        setInterval(nextSlide, 3000); 
    }
};
