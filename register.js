import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Firebase Config
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

// Numeric password
function generateNumericPassword(length = 8) {
  let pass = '';
  for (let i = 0; i < length; i++) pass += Math.floor(Math.random() * 10);
  return pass;
}

// Form Submit
document.getElementById("regForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const password = generateNumericPassword();

  try {
    // Firebase Auth user create
    await createUserWithEmailAndPassword(auth, email, password);

    // Firestore save
    await addDoc(collection(db, "users"), {
      name: document.getElementById("name").value,
      email,
      phone: document.getElementById("phone").value,
      aadhaar: document.getElementById("aadhaar").value,
      pan: document.getElementById("pan").value,
      gender: document.getElementById("gender").value,
      dob: document.getElementById("dob").value,
      userType: document.getElementById("userType").value,
      country: document.getElementById("country").value,
      password,
      createdAt: serverTimestamp()
    });

    alert("User registered successfully!");
    document.getElementById("regForm").reset();

  } catch(err) {
    console.error("Error:", err.message);
    alert("Error: " + err.message);
  }
});
