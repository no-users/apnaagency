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
            alert('कृपया सभी आवश्यक फ़ील्ड भरें।');
            return false;
        }
    }
    return true;
}

// रैंडम पासवर्ड बनाने का फ़ंक्शन
function generatePassword(length = 10) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
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

        // अपने आप एक रैंडम पासवर्ड बनाएं
        const password = generatePassword(); 

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

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
            alert('पंजीकरण सफल! आपका ईमेल ' + email + ' है और आपका पासवर्ड ' + password + ' है। कृपया इस पासवर्ड को बाद में लॉग इन करने के लिए सेव कर लें।');
        } catch (error) {
            let errorMessage = error.message;
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'यह ईमेल पहले से ही उपयोग में है। कृपया किसी अन्य ईमेल पते का उपयोग करें।';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'पासवर्ड बहुत कमज़ोर है। कृपया एक मज़बूत पासवर्ड का उपयोग करें।';
            }
            alert(`Error: ${errorMessage}`);
        }
    });
});
