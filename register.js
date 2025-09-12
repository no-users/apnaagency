import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAXHD3qrc_sRPzUwpd6kLqGVrOqb2XqMpk",
  authDomain: "my-login-page-62659.firebaseapp.com",
  projectId: "my-login-page-62659",
  storageBucket: "my-login-page-62659.firebasestorage.app",
  messagingSenderId: "265063991992",
  appId: "1:265063991992:web:f1834f4664e5494779024d",
  measurementId: "G-EJ7P52JB4N"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Form Logic ---
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
            return false;
        }
    }
    return true;
}

document.addEventListener('DOMContentLoaded', () => {
    showStep(currentStep);

    // Event listeners for Next and Previous buttons
    document.querySelectorAll('.next-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                if (currentStep < steps.length - 1) {
                    currentStep++;
                    showStep(currentStep);
                }
            } else {
                alert('Please fill out all required fields.');
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

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('full-name').value;
        const mobileNumber = document.getElementById('mobile-number').value;
        const email = document.getElementById('email').value;
        const aadharCard = document.getElementById('aadhar-card').value;
        const panCard = document.getElementById('pan-card').value;
        const gender = document.getElementById('gender').value;
        const registrationDate = document.getElementById('registration-date').value;
        const registrationTime = document.getElementById('registration-time').value;
        const userType = document.getElementById('user-type').value;

        // Generate a simple password (you would handle this securely in a real app)
        const password = 'user_password_123'; // Replace with a real password generation or user input method

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
            alert('Registration successful! User data saved to Firestore.');
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });
});
