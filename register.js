import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase config
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

// Multi-step form logic
const form = document.getElementById('multi-step-form');
const steps = document.querySelectorAll('.step-content');
const progressBarSteps = document.querySelectorAll('.progress-bar-container .step');
let currentStep = 0;

function showStep(stepIndex) {
    steps.forEach((step, index) => {
        step.classList.toggle('active', index === stepIndex);
    });

    progressBarSteps.forEach((step, index) => {
        step.classList.toggle('active', index <= stepIndex);
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

function generatePassword(length = 8) {
    const digits = "0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return password;
}

document.addEventListener('DOMContentLoaded', () => {
    showStep(currentStep);

    // Next button
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

    // Previous button
    document.querySelectorAll('.prev-btn').forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                showStep(currentStep);
            }
        });
    });

    // Submit form
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullName = document.getElementById('full-name').value;
        const mobileNumber = document.getElementById('mobile-number').value;
        const email = document.getElementById('email').value;
        const aadharCard = document.getElementById('aadhar-card').value;
        const panCard = document.getElementById('pan-card').value;
        const gender = document.getElementById('gender').value;
        const userType = document.getElementById('user-type').value;

        // Validation
        if (!/^\d{10}$/.test(mobileNumber)) {
            alert("कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें।");
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            alert("कृपया मान्य ईमेल पता दर्ज करें।");
            return;
        }

        const now = new Date();
        const registrationDate = now.toISOString().split('T')[0];
        const registrationTime = now.toTimeString().split(' ')[0];

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
                userType,
                registrationDate,
                registrationTime,
                uid: user.uid
            });

            alert('✅ पंजीकरण सफल!\n📧 ईमेल: ' + email + '\n🔐 पासवर्ड: ' + password);
            resetFormAndSteps();
        } catch (error) {
            console.error("Firebase Error:", error.code, error.message);

            let errorMessage = error.message;
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'यह ईमेल पहले से ही उपयोग में है।';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'पासवर्ड बहुत कमज़ोर है।';
            }
            alert(`❌ त्रुटि: ${errorMessage}`);
        }
    });

    function resetFormAndSteps() {
        form.reset();
        currentStep = 0;
        showStep(currentStep);
    }
});
