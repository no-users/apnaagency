// 🔹 Firebase Config (replace with your own config from Firebase console)
var firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentTab = 0;
showTab(currentTab);

function showTab(n) {
  const tabs = document.getElementsByClassName("tab");
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].style.display = "none";
  }
  tabs[n].style.display = "block";

  document.getElementById("prevBtn").style.display = n === 0 ? "none" : "inline";
  if (n === (tabs.length - 1)) {
    document.getElementById("nextBtn").style.display = "none";
    document.getElementById("submitBtn").style.display = "inline";
  } else {
    document.getElementById("nextBtn").style.display = "inline";
    document.getElementById("submitBtn").style.display = "none";
  }
}

function nextPrev(n) {
  const tabs = document.getElementsByClassName("tab");
  tabs[currentTab].style.display = "none";
  currentTab = currentTab + n;
  if (currentTab >= tabs.length) return false;
  showTab(currentTab);
}

// Registration submit
document.getElementById("regForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const aadhaar = document.getElementById("aadhaar").value;
  const pan = document.getElementById("pan").value;
  const gender = document.getElementById("gender").value;
  const dob = document.getElementById("dob").value;
  const userType = document.getElementById("userType").value;
  const country = document.getElementById("country").value;

  // 🔹 Auto-generate a random password
  const password = Math.random().toString(36).slice(-8);

  // Create user in Firebase Authentication
  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;

      // Save extra info in Firestore
      return db.collection("users").doc(user.uid).set({
        name, email, phone, aadhaar, pan, gender, dob, userType, country
      });
    })
    .then(() => {
      // Show popup with email & password
      document.getElementById("popupEmail").textContent = email;
      document.getElementById("popupPassword").textContent = password;
      document.getElementById("popup").style.display = "block";
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
});

// Close popup
document.getElementById("closePopup").onclick = function() {
  document.getElementById("popup").style.display = "none";
};
