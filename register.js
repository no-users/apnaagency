import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase कॉन्फ़िगरेशन
const firebaseConfig = {
    apiKey: "AIzaSyAXHD3qrc_sRPzUwpd6kLqGVrOqb2XqMpk",
    authDomain: "my-login-page-62659.firebaseapp.com",
    projectId: "my-login-page-62659",
    storageBucket: "my-login-page-62659.firebasestorage.app",
    messagingSenderId: "265063991992",
    appId: "1:265063991992:web:f1834f4664e5494779024d",
    measurementId: "G-EJ7P52JB4N"
};

// Firebase को प्रारंभ करें
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- फॉर्म लॉजिक ---
const form = document.getElementById('multi-step-form');
const steps = document.querySelectorAll('.step-content');
const progressBarSteps = document.querySelectorAll('.progress-bar-container .step');
let currentStep = 0;

function showStep(stepIndex) {
    steps.forEach((step, index) => {
        if (index === stepIndex) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });

    progressBarSteps.forEach((step, index) => {
        if (index <= stepIndex) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

function validateStep(stepIndex) {
    const currentStepInputs = steps[stepIndex].querySelectorAll('input[required], select[required]');
    for (const input of currentStepInputs) {
        if (!input.value) {
            // मल्टी-लाइन अलर्ट के लिए बैक-टिक्स का उपयोग करें
            alert('FILL ALL COLLUM !`);
            return false;
        }
    }
    return true;
}

// रैंडम न्यूमेरिक पासवर्ड बनाने का फ़ंक्शन
function generateNumericPassword(length = 8) {
    const charset = "0123456789";
    let password = "";
    for (let i = 0; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}

document.addEventListener('DOMContentLoaded', () => {
    showStep(currentStep);

    // अगले और पिछले बटन के लिए इवेंट लिसनर्स
    document.querySelectorAll('.next-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                if (currentStep < steps.length - 1) {
                    currentStep++;
                    showStep(currentStep);
                }
            }
        });
    });

    document.querySelectorAll('.prev-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });

   // ... आपका मौजूदा कोड (Firebase कॉन्फ़िगरेशन, फ़ॉर्म लॉजिक, आदि)

// फॉर्म सबमिशन
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // अंतिम स्टेप को मान्य करें
    if (!validateStep(currentStep)) {
        return;
    }

    const fullName = document.getElementById('full-name').value;
    const mobileNumber = document.getElementById('mobile-number').value;
    const email = document.getElementById('email').value;
    const aadharCard = document.getElementById('aadhar-card').value;
    const panCard = document.getElementById('pan-card').value;
    const gender = document.getElementById('gender').value;
    const registrationDate = document.getElementById('registration-date').value;
    const registrationTime = document.getElementById('registration-time').value;
    const userType = document.getElementById('user-type').value;

    try {
        // Step 1: मोबाइल नंबर, आधार और पैन की जाँच करें
        const usersRef = db.collection('users');
        const mobileSnapshot = await usersRef.where('mobileNumber', '==', mobileNumber).get();
        const aadharSnapshot = await usersRef.where('aadharCard', '==', aadharCard).get();
        const panSnapshot = await usersRef.where('panCard', '==', panCard).get();

        if (!mobileSnapshot.empty) {
            alert('MOBILE NUMBER ALREADY USED');
            return;
        }
        if (!aadharSnapshot.empty) {
            alert('ADHAR ALREADY USED');
            return;
        }
        if (!panSnapshot.empty) {
            alert('PAN ALREADY USED');
            return;
        }

        // Step 2: अगर सब कुछ ठीक है, तो Firebase Authentication के साथ उपयोगकर्ता बनाएँ
        const password = generateNumericPassword();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Step 3: Firestore में उपयोगकर्ता डेटा सहेजें
        await setDoc(doc(db, "users", user.uid), {
            fullName,
            mobileNumber,
            email,
            aadharCard,
            panCard,
            gender,
            registrationDate,
            registrationTime,
            userType,
            uid: user.uid
        });

        alert(`REGISTRATION SUCCESS!
USER ID - ${email}
PASSWORD - ${password}
Login के लिए Saveकर लें।`);

    } catch (error) {
        let errorMessage = error.message;
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'GMAIL ALREADY USED';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'CHOSE STRPNG PASSWORD';
        }
        alert(`त्रुटि: ${errorMessage}`);
    }
});
