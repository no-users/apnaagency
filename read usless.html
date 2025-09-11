// ---------- Firebase Config ----------
const firebaseConfig = {
  apiKey: "AIzaSy***************",
  authDomain: "my-app.firebaseapp.com",
  projectId: "my-app",
  storageBucket: "my-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

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

// ---------- Password Generator ----------
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
  const password = generatePassword(10);

  try {
    // Firebase Authentication me user create karna
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Extra info Firestore me save karna
    await db.collection("users").doc(user.uid).set({
      name: document.getElementById("name").value,
      phone: document.getElementById("phone").value,
      dob: document.getElementById("dob").value,
      gender: document.getElementById("gender").value,
      aadhaar: document.getElementById("aadhaar").value,
      pan: document.getElementById("pan").value,
      userType: document.getElementById("userType").value,
      country: document.getElementById("country").value,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Popup me email + password show karna
    document.getElementById("popupEmail").innerText = email;
    document.getElementById("popupPassword").innerText = password;
    document.getElementById("popup").classList.add("show");
    document.getElementById("popup").style.display = "flex";

    document.getElementById("regForm").reset();
    currentTab = 0;
    showTab(currentTab);

  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      document.getElementById("popupEmail").innerText = email;
      document.getElementById("popupPassword").innerText = "Already Registered! Please Login.";
      document.getElementById("popup").classList.add("show");
      document.getElementById("popup").style.display = "flex";
    } else {
      alert("Error: " + error.message);
    }
  }
});

// ---------- Close Popup ----------
document.getElementById("closePopup").addEventListener("click", function() {
  document.getElementById("popup").classList.remove("show");
  document.getElementById("popup").style.display = "none";
});
