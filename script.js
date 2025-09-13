// Firebase Logout Script (Using the global firebase object)
document.addEventListener("DOMContentLoaded", () => {
    // Check if firebase is loaded
    if (typeof firebase !== 'undefined') {
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

        // Initialize Firebase only if it hasn't been initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        const auth = firebase.auth();

        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                auth.signOut()
                    .then(() => {
                        alert("Logged out successfully!");
                        window.location.href = "login.html"; // Redirect to login page
                    })
                    .catch((error) => {
                        alert("Error logging out: " + error.message);
                    });
            });
        }
    } else {
        console.warn("Firebase SDK not loaded. Logout functionality will not work.");
    }
});
