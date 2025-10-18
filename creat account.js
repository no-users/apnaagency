// ----------------------------------------------------------------------
// 1. GLOBAL FIREBASE CONFIGURATION
// ----------------------------------------------------------------------
// NOTE: Apni asli Firebase Config yahan jodein. Yeh sirf ek placeholder hai.
const firebaseConfig = {
    apiKey: "AIzaSyAXHD3qrc_sRPzUwpd6kLqGVrOqb2XqMpk",
    authDomain: "my-login-page-62659.firebaseapp.com",
    projectId: "my-login-page-62659",
    storageBucket: "my-login-page-62659.firebasestorage.app",
    messagingSenderId: "265063991992",
    appId: "1:265063991992:web:f1834f4664e5494779024d",
    measurementId: "G-EJ7P52JB4N"
};

// Debugging ke liye Firestore logging chalu karein
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
 * Custom toast/message box display karta hai.
 */
function showMessage(msg, isError = false) {
    if (!messageBox) {
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

    // 4 second ke baad sandesh box ko chhupaayein
    messageTimeout = setTimeout(() => {
        messageBox.className = '';
    }, 4000);
}

// ----------------------------------------------------------------------
// 3. FIREBASE INITIALIZATION (FIX: Anonymous Sign-in for Firestore Rules)
// ----------------------------------------------------------------------

async function initFirebase() {
    if (typeof firebase === 'undefined' || typeof firebase.initializeApp === 'undefined') {
        showMessage("Firebase library load nahi ho paya. Kripya internet connection jaanchen.", true);
        return;
    }

    if (Object.keys(firebaseConfig).length === 0 || !firebaseConfig.apiKey) {
        showMessage("Firebase configuration nahi mila.", true);
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
        // Yeh ensure karta hai ki 'request.auth != null' condition pass ho aur Firestore Rules kaam karein.
        if (!auth.currentUser) {
            // NOTE: Firebase Console mein Anonymous Auth ENABLED hona chahiye.
            await auth.signInAnonymously(); 
        }

        // Ab humein nischit roop se auth.currentUser se UID milega
        userId = auth.currentUser.uid; 
        isAuthReady = true;
        console.log("Firebase initialized. Current User ID:", userId);

        const userIdDisplay = document.getElementById('user-id-display');
        if (userIdDisplay) {
            userIdDisplay.textContent = `User ID (for team access): ${userId}`;
        }

    } catch (error) {
        console.error("Authentication failed during init:", error);
        // Error agar Anonymous sign-in fail ho (jiske liye auth/admin-restricted-operation error aayi thi).
        showMessage(`प्रमाणीकरण विफल: ${error.message}`, true);
    }
}

// ----------------------------------------------------------------------
// 4. REGISTRATION HANDLER (FIX: Direct createUserWithEmailAndPassword)
// ----------------------------------------------------------------------

window.handleRegistration = async function() {
    if (!isAuthReady) {
        showMessage("Firebase abhi shuru nahi hua hai. Kripya pratiksha karein.", true);
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
        showMessage('Kripya sabhi avashyak fields bharein.', true);
        return;
    }
    if (password !== confirmPassword) {
        showMessage('Password mel nahi kha rahe hain.', true);
        return;
    }
    if (password.length < 6) {
        showMessage('Password kam se kam 6 akshar ka hona chahiye.', true);
        return;
    }
    if (!/^\d{10}$/.test(mobile)) {
        showMessage('Kripya 10 ankon ka vaidh mobile number darj karein.', true);
        return;
    }
    if (!termsAccepted) {
        showMessage('Register karne ke liye aapko niyam aur sharton se sahmat hona hoga.', true);
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
            showMessage('Yeh mobile number pahle se hi panjikrit hai.', true);
            return;
        }

    } catch (error) {
        console.error("Firestore Mobile Check Error (Check Security Rules):", error);
        showMessage(`त्रुटि: Mobile number ki janch vifal. Kripya suraksha niyamo ki jaanch karein. (${error.message})`, true);
        return;
    }

    // --- Registration Logic: Direct Create User ---
    try {
        // FIX: 'auth/operation-not-allowed' error ko theek karne ke liye direct create user ka upyog.
        // Yeh Anonymous user session ko nazarandaaz karta hai aur naya permanent user banata hai.
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

        showMessage('Panjikaran safal! Aapka khata ban gaya hai.', false);
        console.log("Registration successful for user:", user.uid);
        
        document.getElementById('registrationForm').reset();

    } catch (error) {
        console.error("Registration Error:", error);

        let errorMsg = 'Panjikaran vifal. Kripya baad mein punah prayas karein.';

        if (error.code === 'auth/email-already-in-use') {
            errorMsg = 'Yeh email pahle se hi upyog mein hai.';
        } else if (error.code === 'auth/weak-password') {
            errorMsg = 'Password bahut kamzor hai.';
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
        // Slider ko automatic chalane ke liye
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
    
    // 5. FORM SUBMISSION HANDLER (Prevents page reload)
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
