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

// Firebase init
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

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
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("regForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();

    // check already registered
    const existing = await db.collection("users").where("email", "==", email).get();
    if (!existing.empty) {
      document.getElementById("popupEmail").innerText = email;
      document.getElementById("popupPassword").innerText = "Already Registered! Please Login.";
      document.getElementById("popup").style.display = "flex";
      return;
    }

    // generate password
    const password = generatePassword(10);

    try {
      // 1. Firebase Auth में user create करो
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);

      // 2. Firestore में extra data save करो
      await db.collection("users").doc(userCredential.user.uid).set({
        name: document.getElementById("name").value,
        email: email,
        phone: document.getElementById("phone").value,
        aadhaar: document.getElementById("aadhaar").value,
        pan: document.getElementById("pan").value,
        gender: document.getElementById("gender").value,
        dob: document.getElementById("dob").value,
        userType: document.getElementById("userType").value,
        country: document.getElementById("country").value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // 3. Popup में email + password दिखाओ
      document.getElementById("popupEmail").innerText = email;
      document.getElementById("popupPassword").innerText = password;
      document.getElementById("popup").style.display = "flex";

      document.getElementById("regForm").reset();
    } catch (error) {
      alert("Error: " + error.message);
    }
  });

  // ---------- Close Popup ----------
  document.getElementById("closePopup").addEventListener("click", function () {
    document.getElementById("popup").style.display = "none";
  });
});
