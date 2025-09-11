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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Multi-step form
let currentTab = 0;
const tabs = document.getElementsByClassName("tab");
showTab(currentTab);

function showTab(n) {
  tabs[n].style.display = "block";
  document.getElementById("prevBtn").style.display = n === 0 ? "none" : "inline";
  document.getElementById("nextBtn").innerHTML = (n === tabs.length - 1) ? "Register" : "Next";
}

function nextPrev(n) {
  if (n === 1 && !validateForm()) return;

  tabs[currentTab].style.display = "none";
  currentTab += n;

  if (currentTab >= tabs.length) {
    registerUser();
    return;
  }

  showTab(currentTab);
}

function validateForm() {
  let valid = true;
  const inputs = tabs[currentTab].querySelectorAll("input, select");
  inputs.forEach(input => {
    if (!input.checkValidity()) {
      input.style.border = "2px solid red";
      valid = false;
    } else {
      input.style.border = "";
    }
  });
  return valid;
}

// Generate random password
function generatePassword(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

// Register in Firebase
function registerUser() {
  const email = document.getElementById("email").value;
  const password = generatePassword();

  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      showPopup(email, password); // ✅ Show popup with credentials
    })
    .catch(error => {
      alert("Error: " + error.message);
    });
}

// Show fancy popup
function showPopup(email, password) {
  const popup = document.createElement("div");
  popup.innerHTML = `
    <div style="
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: #1e1e2f;
      color: #00e3aa;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 0 20px rgba(0,255,200,0.5);
      z-index: 9999;
      text-align: center;
    ">
      <h2>🎉 Registration Successful!</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password}</p>
      <button onclick="window.location.href='login.html'" style="
        margin-top: 20px;
        padding: 10px 20px;
        background: #00e3aa;
        color: black;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
      ">Go to Login</button>
    </div>
  `;
  document.body.appendChild(popup);
}
