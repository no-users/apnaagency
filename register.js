document.addEventListener("DOMContentLoaded", function () {
  // ---------- Firebase Config ----------
  const firebaseConfig = {
    apiKey: "AIzaSyAXHD3qrc_sRPzUwpd6kLqGVrOqb2XqMpk",
    authDomain: "my-login-page-62659.firebaseapp.com",
    projectId: "my-login-page-62659",
    storageBucket: "my-login-page-62659.appspot.com",
    messagingSenderId: "265063991992",
    appId: "1:265063991992:web:f1834f4664e5494779024d"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  let currentTab = 0;
  const tabs = document.getElementsByClassName("tab");
  if (!tabs.length) {
    console.error("No .tab found! Check your HTML.");
    return;
  }

  function showTab(n) {
    for (let i = 0; i < tabs.length; i++) tabs[i].style.display = "none";
    tabs[n].style.display = "block";

    document.getElementById("prevBtn").style.display = n === 0 ? "none" : "inline";
    document.getElementById("nextBtn").style.display = n === (tabs.length - 1) ? "none" : "inline";
    document.getElementById("submitBtn").style.display = n === (tabs.length - 1) ? "inline" : "none";
  }

  showTab(currentTab);

  window.nextPrev = function (n) {
    if (n === 1 && !validateForm()) return false;
    currentTab += n;
    if (currentTab >= tabs.length) currentTab = tabs.length - 1;
    if (currentTab < 0) currentTab = 0;
    showTab(currentTab);
  };

  function validateForm() {
    const tab = tabs[currentTab];
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

  // ---------- Form Submit ----------
   function generateNumericPassword(length = 8) {
  let password = '';
  for (let i = 0; i < length; i++) {
    password += Math.floor(Math.random() * 10); // 0 to 9
  }
  return password;
}
document.getElementById("regForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const password = generateNumericPassword(); // ← यहाँ change
  const email = document.getElementById("email").value.trim().toLowerCase();
  const phone = document.getElementById("phone").value.trim();
  const aadhaar = document.getElementById("aadhaar").value.trim();
  const pan = document.getElementById("pan").value.trim();

  try {
    // Check if already registered
    const [emailExists, phoneExists, aadhaarExists, panExists] = await Promise.all([
      db.collection("users").where("email", "==", email).get(),
      db.collection("users").where("phone", "==", phone).get(),
      db.collection("users").where("aadhaar", "==", aadhaar).get(),
      db.collection("users").where("pan", "==", pan).get()
    ]);

    if (!emailExists.empty || !phoneExists.empty || !aadhaarExists.empty || !panExists.empty) {
      let matchedField = "";
      if (!emailExists.empty) matchedField = "Email";
      else if (!phoneExists.empty) matchedField = "Phone";
      else if (!aadhaarExists.empty) matchedField = "Aadhaar";
      else if (!panExists.empty) matchedField = "PAN";

      document.getElementById("popupEmail").innerText = `${matchedField} already registered`;
      document.getElementById("popupPassword").innerText = "Already Registered! Please Login.";
      document.getElementById("popup").classList.add("show");
      document.getElementById("popup").style.display = "flex";
      return;
    }

    // Add user to Firestore
   const password = generateNumericPassword();

await firebase.auth().createUserWithEmailAndPassword(email, password);

await db.collection("users").add({
  name: document.getElementById("name").value,
  email: email,
  phone: phone,
  aadhaar: aadhaar,
  pan: pan,
  gender: document.getElementById("gender").value,
  dob: document.getElementById("dob").value,
  userType: document.getElementById("userType").value,
  country: document.getElementById("country").value,
  password: password,
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
});


    // Show popup with email & password
    document.getElementById("popupEmail").innerText = email;
    document.getElementById("popupPassword").innerText = password;
    document.getElementById("popup").classList.add("show");
    document.getElementById("popup").style.display = "flex";

    // Reset form
    document.getElementById("regForm").reset();
    currentTab = 0;
    showTab(currentTab);
  } catch (error) {
    alert("Error: " + error.message);
  }
});



  document.getElementById("closePopup").addEventListener("click", function () {
    document.getElementById("popup").style.display = "none";
  });
});
