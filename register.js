import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// ---------- Firebase Config ----------
const firebaseConfig = { 
  apiKey: "AIzaSy***************",
  authDomain: "my-app.firebaseapp.com",
  projectId: "my-app",
  storageBucket: "my-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ---------- Numeric Password Generator ----------
function generateNumericPassword(length = 8) {
  let pass = "";
  for (let i = 0; i < length; i++) pass += Math.floor(Math.random() * 10);
  return pass;
}

// ---------- Multi-step Form ----------
let currentTab = 0;
const tabs = document.getElementsByClassName("tab");

function showTab(n) {
  for (let i = 0; i < tabs.length; i++) tabs[i].style.display = "none";
  tabs[n].style.display = "block";

  document.getElementById("prevBtn").style.display = n === 0 ? "none" : "inline";
  document.getElementById("nextBtn").style.display = n === tabs.length - 1 ? "none" : "inline";
  document.getElementById("submitBtn").style.display = n === tabs.length - 1 ? "inline" : "none";
}

showTab(currentTab);

window.nextPrev = function(n) {
  if (n === 1 && !validateForm()) return false;
  currentTab += n;
  if (currentTab >= tabs.length) currentTab = tabs.length - 1;
  if (currentTab < 0) currentTab = 0;
  showTab(currentTab);
};

function validateForm() {
  const inputs = tabs[currentTab].querySelectorAll("input, select");
  let valid = true;
  for (let input of inputs) {
    if (!input.checkValidity()) {
      input.reportValidity();
      valid = false;
      break;
    }
  }
  return valid;
}

// ---------- Form Submit ----------
document.getElementById("regForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim().toLowerCase();
  const phone = document.getElementById("phone").value.trim();
  const aadhaar = document.getElementById("aadhaar").value.trim();
  const pan = document.getElementById("pan").value.trim();
  const gender = document.getElementById("gender").value;
  const dob = document.getElementById("dob").value;
  const userType = document.getElementById("userType").value;
  const country = document.getElementById("country").value;
  const password = generateNumericPassword();

  try {
    const usersRef = collection(db, "users");

    // Check duplicates
    const [emailExists, phoneExists, aadhaarExists, panExists] = await Promise.all([
      getDocs(query(usersRef, where("email", "==", email))),
      getDocs(query(usersRef, where("phone", "==", phone))),
      getDocs(query(usersRef, where("aadhaar", "==", aadhaar))),
      getDocs(query(usersRef, where("pan", "==", pan)))
    ]);

    if (!emailExists.empty || !phoneExists.empty || !aadhaarExists.empty || !panExists.empty) {
      let field = emailExists.empty ? (phoneExists.empty ? (aadhaarExists.empty ? "PAN" : "Aadhaar") : "Phone") : "Email";
      document.getElementById("popupEmail").innerText = `${field} already registered`;
      document.getElementById("popupPassword").innerText = "Already Registered! Please Login.";
      document.getElementById("popup").style.display = "flex";
      return;
    }

    // Create user in Firebase Auth
    await createUserWithEmailAndPassword(auth, email, password);

    // Add user in Firestore
    await addDoc(usersRef, {
      name,
      email,
      phone,
      aadhaar,
      pan,
      gender,
      dob,
      userType,
      country,
      password,
      createdAt: serverTimestamp()
    });

    // Show popup with credentials
    document.getElementById("popupEmail").innerText = email;
    document.getElementById("popupPassword").innerText = password;
    document.getElementById("popup").style.display = "flex";

    // Reset form
    document.getElementById("regForm").reset();
    currentTab = 0;
    showTab(currentTab);

  } catch (err) {
    alert("Error: " + err.message);
  }
});

// ---------- Close Popup ----------
document.getElementById("closePopup").addEventListener("click", () => {
  document.getElementById("popup").style.display = "none";
});
