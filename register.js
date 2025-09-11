import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAXHD3qrc_sRPzUwpd6kLqGVrOqb2XqMpk",
  authDomain: "my-login-page-62659.firebaseapp.com",
  projectId: "my-login-page-62659",
  storageBucket: "my-login-page-62659.appspot.com",
  messagingSenderId: "265063991992",
  appId: "1:265063991992:web:f1834f4664e5494779024d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Generate random password
function generatePassword(length = 10) {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$!";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Handle registration
document.getElementById("regForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const password = generatePassword();

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      showPopup(email, password); // Show premium popup
    })
    .catch((error) => {
      alert("❌ Error: " + error.message);
    });
});

// Show premium popup
function showPopup(email, password) {
  const popup = document.createElement("div");
  popup.style.position = "fixed";
  popup.style.top = "50%";
  popup.style.left = "50%";
  popup.style.transform = "translate(-50%, -50%)";
  popup.style.background = "linear-gradient(135deg, #1f1c2c, #928dab)";
  popup.style.color = "#fff";
  popup.style.padding = "30px";
  popup.style.borderRadius = "15px";
  popup.style.boxShadow = "0 0 20px rgba(0,0,0,0.4)";
  popup.style.zIndex = "9999";
  popup.style.textAlign = "center";
  popup.style.fontSize = "16px";
  popup.innerHTML = `
    <h2 style="color: #00ffcc;">🎉 Registration Successful!</h2>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Password:</strong> ${password}</p>
    <button style="margin-top: 20px; padding: 10px 20px; border: none; border-radius: 8px; background: #00ffcc; color: #000; font-weight: bold; cursor: pointer;" onclick="this.parentElement.remove()">Close</button>
  `;
  document.body.appendChild(popup);
}
