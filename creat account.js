// ----------------------------------------------------------------------
// 1. GLOBAL FIREBASE CONFIGURATION
// ----------------------------------------------------------------------
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

const appId = firebaseConfig.appId;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

let app, auth, db, userId = null;
let isAuthReady = false;
let messageBox;
let messageTimeout;

// ----------------------------------------------------------------------
// 2. UTILITY FUNCTIONS
// ----------------------------------------------------------------------

/**
 * कस्टम टोस्ट/मैसेज बॉक्स प्रदर्शित करता है।
 */
function showMessage(msg, isError = false) {
    if (!messageBox) {
        // Safety check, par DOMContentLoaded mein initialize hota hai
        messageBox = document.getElementById('message-box');
        if (!messageBox) {
            console.error("CRITICAL ERROR: Message Box element not found. Ensure you have <div id='message-box'></div> in your HTML.");
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

// ----------------------------------------------------------------------
// 3. FIREBASE INITIALIZATION (CRITICAL FIX: Added Anonymous Sign-in)
// ----------------------------------------------------------------------

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

        // 🚨 CRITICAL FIX: Anonymous Sign-in
        // Yeh ensure karta hai ki 'request.auth != null' condition pass ho aur Security Rules kaam karein.
        if (!auth.currentUser) {
            await auth.signInAnonymously(); 
        }

        // Ab humein nischit roop se auth.currentUser से UID मिलेगा
        userId = auth.currentUser.uid; 
        isAuthReady = true;
        console.log("Firebase initialized. Current User ID:", userId);

        const userIdDisplay = document.getElementById('user-id-display');
        if (userIdDisplay) {
            userIdDisplay.textContent = `User ID (for team access): ${userId}`;
        }

    } catch (error) {
        console.error("Authentication failed during init:", error);
        showMessage(`प्रमाणीकरण विफल: ${error.message}`, true);
    }
}

// ----------------------------------------------------------------------
// 4. REGISTRATION HANDLER (MAIN LOGIC)
// ----------------------------------------------------------------------

window.handleRegistration = async function() {
    if (!isAuthReady) {
        showMessage("Firebase अभी शुरू नहीं हुआ है। कृपया प्रतीक्षा करें।", true);
        return;
    }

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const mobile = document.getElementById('mobile').value.trim();
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
        console.error("Firestore Mobile Check Error (Check Security Rules):", error);
        // Error message update kiya gaya hai
        showMessage(`त्रुटि: मोबाइल नंबर की जांच विफल। कृपया सुरक्षा नियमों की जाँच करें। (${error.message})`, true);
        return;
    }

    // --- End Mobile Number Check ---

    try {
        // 1. Firebase Authentication: Create User
        // Anonymous user se actual user mein convert hoga
        await auth.currentUser.updateEmail(email);
        await auth.currentUser.updatePassword(password);
        
        // Agar Anonymous auth enabled nahi hai to yeh method fail ho sakta hai
        // Isliye hum Firebase auth/email-password method se create kar rahe hain
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
        const uniqueIdentifiersCollection = `artifacts/${appId}/public/data/unique_identifiers`;
        await db.collection(uniqueIdentifiersCollection).doc(user.uid).set({
            mobile: mobile,
            email: email,
            uid: user.uid
        });

        showMessage('पंजीकरण सफल! आपका खाता बन गया है।', false);
        console.log("Registration successful for user:", user.uid);
        
        // Success ke baad form ko reset kar sakte hain
        document.getElementById('registrationForm').reset();

    } catch (error) {
        console.error("Registration Error:", error);

        let errorMsg = 'पंजीकरण विफल। कृपया बाद में पुनः प्रयास करें।';

        if (error.code === 'auth/email-already-in-use') {
            errorMsg = 'यह ईमेल पहले से ही उपयोग में है।';
        } else if (error.code === 'auth/weak-password') {
            errorMsg = 'पासवर्ड बहुत कमजोर है।';
        }

        showMessage(`त्रुटि: ${errorMsg} (${error.message})`, true);
    }
};

// ----------------------------------------------------------------------
// 5. DOM & EVENT LISTENERS
// ----------------------------------------------------------------------

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

function setupSlider() {
    let currentSlide = 0;
    const slidesContainer = document.getElementById('slides-container');
    const slides = document.querySelectorAll('.slide');
    const totalSlides = slides.length;

    if (slidesContainer && totalSlides > 0) {
        const showSlide = (index) => {
            slidesContainer.style.transform = `translateX(-${index * 100}%)`;
        };

        const nextSlide = () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
        };

        showSlide(currentSlide);
        setInterval(nextSlide, 3000);
    }
}


// --- Initialization Block (DOMContentLoaded) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Message Box Initialization
    messageBox = document.getElementById('message-box');

    // 2. Firebase Initialization
    initFirebase();

    // 3. Form-related setup
    setupPasswordToggle();

    // 4. Slider Setup
    setupSlider();
    
    // 5. 🚨 CRITICAL FIX: FORM SUBMISSION HANDLER (Prevents page reload) 🚨
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(event) {
            event.preventDefault(); 
            window.handleRegistration();
        });
    } else {
         console.error("Error: 'registrationForm' ID not found in HTML.");
    }
});
