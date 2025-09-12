document.addEventListener('DOMContentLoaded', () => {
    // Make sure Firebase variables are available in the window scope from your HTML
    const auth = window.auth;
    const db = window.db;

    if (!auth || !db) {
        console.error("Firebase is not initialized. Please check your Firebase configuration script in index.html.");
        alert("Firebase is not set up correctly.");
        return;
    }

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

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (validateStep(currentStep)) {
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

            // Firebase authentication and Firestore logic
            createUserWithEmailAndPassword(auth, formData.email, 'default_password')
                .then((userCredential) => {
                    const user = userCredential.user;
                    return setDoc(doc(db, "users", user.uid), {
                        fullName: formData.fullName,
                        mobileNumber: formData.mobileNumber,
                        aadharCard: formData.aadharCard,
                        panCard: formData.panCard,
                        gender: formData.gender,
                        registrationDate: formData.registrationDate,
                        registrationTime: formData.registrationTime,
                        userType: formData.userType,
                        email: formData.email,
                    });
                })
                .then(() => {
                    console.log("User registered and data stored successfully!");
                    alert("Registration successful!");
                    form.reset();
                    showStep(0);
                })
                .catch((error) => {
                    const errorMessage = error.message;
                    console.error("Firebase registration error:", errorMessage);
                    alert("Registration failed: " + errorMessage);
                });
        }
    });

    showStep(currentStep);
});
