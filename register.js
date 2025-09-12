import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = { 
  apiKey: "AIzaSyAXHD3qrc_sRPzUwpd6kLqGVrOqb2XqMpk",
  authDomain: "my-login-page-62659.firebaseapp.com",
  projectId: "my-login-page-62659",
  storageBucket: "my-login-page-62659.appspot.com",
  messagingSenderId: "265063991992",
  appId: "1:265063991992:web:f1834f4664e5494779024d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Generate numeric password
function generateNumericPassword(length = 8){
  let pass = '';
  for(let i=0; i<length; i++) pass += Math.floor(Math.random()*10);
  return pass;
}

// Form submit
document.getElementById("regForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim().toLowerCase();
  const phone = document.getElementById("phone").value.trim();
  const aadhaar = document.getElementById("aadhaar").value.trim();
  const pan = document.getElementById("pan").value.trim();
  const password = generateNumericPassword();

  try {
    // Check duplicates
    const usersRef = collection(db,"users");
    const [emailExists, phoneExists, aadhaarExists, panExists] = await Promise.all([
      getDocs(query(usersRef, where("email","==",email))),
      getDocs(query(usersRef, where("phone","==",phone))),
      getDocs(query(usersRef, where("aadhaar","==",aadhaar))),
      getDocs(query(usersRef, where("pan","==",pan))),
    ]);

    if(!emailExists.empty || !phoneExists.empty || !aadhaarExists.empty || !panExists.empty){
      let field = emailExists.empty ? (phoneExists.empty ? (aadhaarExists.empty ? "PAN" : "Aadhaar") : "Phone") : "Email";
      document.getElementById("popupEmail").innerText = `${field} already registered`;
      document.getElementById("popupPassword").innerText = "Already Registered! Please Login.";
      document.getElementById("popup").style.display="flex";
      return;
    }

    // Create user in Firebase Auth
    await createUserWithEmailAndPassword(auth, email, password);

    // Add user in Firestore
    await addDoc(usersRef,{
      name: document.getElementById("name").value,
      email,
      phone,
      aadhaar,
      pan,
      gender: document.getElementById("gender").value,
      dob: document.getElementById("dob").value,
      userType: document.getElementById("userType").value,
      country: document.getElementById("country").value,
      password,
      createdAt: serverTimestamp()
    });

    document.getElementById("popupEmail").innerText = email;
    document.getElementById("popupPassword").innerText = password;
    document.getElementById("popup").style.display="flex";

    document.getElementById("regForm").reset();
  } catch(err){
    alert("Error: "+err.message);
  }
});

document.getElementById("closePopup").addEventListener("click", ()=>{
  document.getElementById("popup").style.display="none";
});
