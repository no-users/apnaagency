// ---------- Firebase Config ----------
const firebaseConfig = {
  apiKey: "AIzaSyAXHD3qrc_sRPzUwpd6kLqGVrOqb2XqMpk",
  authDomain: "my-login-page-62659.firebaseapp.com",
  projectId: "my-login-page-62659",
  storageBucket: "my-login-page-62659.firebasestorage.app",
  messagingSenderId: "265063991992",
  appId: "1:265063991992:web:f1834f4664e5494779024d",
  measurementId: "G-EJ7P52JB4N"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ---------- Multi-step Form ----------
let currentTab = 0;
showTab(currentTab);

function showTab(n) {
  const tabs = document.getElementsByClassName("tab");
  for (let tab of tabs) tab.style.display = "none";
  tabs[n].style.display = "block";

  document.getElementById("prevBtn").style.display = n === 0 ? "none" : "inline";
  document.getElementById("nextBtn").style.display = n === (tabs.length - 1) ? "none" : "inline";
  document.getElementById("submitBtn").style.display = n === (tabs.length - 1) ? "inline" : "none";
}

function nextPrev(n) {
  const tabs = document.getElementsByClassName("tab");
  if (n === 1 && !validateForm()) return false;
  tabs[currentTab].style.display = "none";
  currentTab += n;
  showTab(currentTab);
}

function validateForm() {
  const tab = document.getElementsByClassName("tab")[currentTab];
  const inputs = tab.querySelectorAll("input, select");
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

// ---------- Password Auto-generate ----------
function generatePassword(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$!";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// ---------- Form Submit ----------
document.getElementById("regForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = generatePassword(10); // Auto-generated password

  // Create user in Firebase Auth
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user; // Auth user

      // Save extra info in Firestore with UID as document ID
      db.collection("users").doc(user.uid).set({
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        dob: document.getElementById("dob").value,
        gender: document.getElementById("gender").value,
        aadhaar: document.getElementById("aadhaar").value,
        pan: document.getElementById("pan").value,
        userType: document.getElementById("userType").value,
        country: document.getElementById("country").value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(() => {
        // Show success popup with email and password
        document.getElementById("popupEmail").innerText = email;
        document.getElementById("popupPassword").innerText = password;
        document.getElementById("popup").classList.add("show");
        document.getElementById("popup").style.display = "flex";

        // Reset form
        document.getElementById("regForm").reset();
        currentTab = 0;
        showTab(currentTab);
      });
    })
    .catch((error) => {
      // Handle already registered
      if(error.code === "auth/email-already-in-use"){
        document.getElementById("popupEmail").innerText = email;
        document.getElementById("popupPassword").innerText = "Already Registered! Please Login.";
        document.getElementById("popup").classList.add("show");
        document.getElementById("popup").style.display = "flex";
      } else {
        alert("Error: " + error.message);
      }
    });
});

// ---------- Close Popup ----------
document.getElementById("closePopup").addEventListener("click", function() {
  document.getElementById("popup").classList.remove("show");
  document.getElementById("popup").style.display = "none";
});
