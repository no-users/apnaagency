// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase app and services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to generate an 8-digit random password
function generateRandomPassword() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Function to check if a user with given details already exists in Firestore
async function checkIfUserExists(formData) {
    const usersRef = collection(db, "users");

    // Create a query to check for any of the unique fields
    const q = query(usersRef, where("email", "==", formData.email));
    
    // You can add more 'or' conditions if needed, but Firebase queries are limited.
    // For simplicity, we'll check for email first, which is a key unique identifier in Auth.
    
    // To check other fields, you might need separate queries
    const qMobile = query(usersRef, where("mobileNumber", "==", formData.mobileNumber));
    const qAadhar = query(usersRef, where("aadharCard", "==", formData.aadharCard));
    const qPan = query(usersRef, where("panCard", "==", formData.panCard));

    const [emailSnapshot, mobileSnapshot, aadharSnapshot, panSnapshot] = await Promise.all([
        getDocs(q),
        getDocs(qMobile),
        getDocs(qAadhar),
        getDocs(qPan)
    ]);

    if (!emailSnapshot.empty || !mobileSnapshot.empty || !aadharSnapshot.empty || !panSnapshot.empty) {
        return true; // User exists
    }
    return false; // User does not exist
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('multi-step-form');
    const stepContents = document.querySelectorAll('.step-content');
    const steps = document.querySelectorAll('.step');
    const nextButtons = document.querySelectorAll('.next-btn');
    const prevButtons = document.querySelectorAll('.prev-btn');

    let currentStep = 0;

    function showStep(stepIndex) {
        stepContents.forEach((step, index) => {
            step.classList.remove('active');
            if (index === stepIndex) {
                step.classList.add('active');
            }
        });
        steps.forEach((step, index) => {
            if (index <= stepIndex) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    function validateStep(stepIndex) {
        let isValid = true;
        let message = '';

        if (stepIndex === 0) {
            const fullName = document.getElementById('full-name').value.trim();
            const mobileNumber = document.getElementById('mobile-number').value.trim();
            const email = document.getElementById('email').value.trim();

            if (!fullName || !mobileNumber || !email) {
                isValid = false;
                message = 'Please fill out all the fields.';
            } else if (!/^\d{10}$/.test(mobileNumber)) {
                isValid = false;
                message = 'Please enter a valid 10-digit mobile number.';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                isValid = false;
                message = 'Please enter a valid email address.';
            }
        } else if (stepIndex === 1) {
            const aadharCard = document.getElementById('aadhar-card').value.trim();
            const panCard = document.getElementById('pan-card').value.trim();
            const gender = document.getElementById('gender').value;

            if (!aadharCard || !panCard || !gender) {
                isValid = false;
                message = 'Please fill out all the fields.';
            } else if (!/^\d{12}$/.test(aadharCard)) {
                isValid = false;
                message = 'Please enter a valid 12-digit Aadhar number.';
            } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panCard.toUpperCase())) {
                isValid = false;
                message = 'Please enter a valid PAN number.';
            }
        } else if (stepIndex === 2) {
            const registrationDate = document.getElementById('registration-date').value;
            const registrationTime = document.getElementById('registration-time').value;
            const userType = document.getElementById('user-type').value;

            if (!registrationDate || !registrationTime || !userType) {
                isValid = false;
                message = 'Please fill out all the fields.';
            }
        }

        if (!isValid) {
            alert(message);
        }
        return isValid;
    }

    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                currentStep++;
                showStep(currentStep);
            }
        });
    });

    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentStep--;
            showStep(currentStep);
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateStep(currentStep)) {
            return;
        }

        const formData = {
            fullName: document.getElementById('full-name').value,
            mobileNumber: document.getElementById('mobile-number').value,
            email: document.getElementById('email').value,
            aadharCard: document.getElementById('aadhar-card').value,
            panCard: document.getElementById('pan-card').value,
            gender: document.getElementById('gender').value,
            registrationDate: document.getElementById('registration-date').value,
            registrationTime: document.getElementById('registration-time').value,
            userType: document.getElementById('user-type').value,
        };

        try {
            // Step 1: Check for duplicate user before registration
            const userExists = await checkIfUserExists(formData);
            if (userExists) {
                alert("Error: A user with this email, mobile, Aadhar, or PAN already exists.");
                return;
            }

            // Step 2: Generate a random password
            const password = generateRandomPassword();

            // Step 3: Create a user in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, password);
            const user = userCredential.user;

            // Step 4: Store other user details in Firestore
            await setDoc(doc(db, "users", user.uid), {
                ...formData, // Spread operator to add all form data
                password: password, // Store the generated password (for admin purposes, not recommended for real apps)
                registrationTimestamp: new Date().toISOString() // Add a timestamp
            });

            console.log("User registered and data stored successfully!");
            alert("Registration successful! Your generated password is: " + password); // Display the password to the user
            form.reset();
            showStep(0);
        } catch (error) {
            console.error("Firebase registration error:", error);
            // Handle specific Firebase errors
            let errorMessage = "Registration failed. Please try again.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = "This email is already registered. Please use a different one.";
            } else if (error.code === 'auth/weak-password') {
                errorMessage = "The password is too weak. Please use a stronger one.";
            } else {
                errorMessage = error.message;
            }
            alert("Registration failed: " + errorMessage);
        }
    });

    showStep(currentStep);
});
