import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
