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
  const auth = firebase.auth();

  // ---------- Multi-step Form ----------
  let currentTab = 0;
  const tabs = document.getElementsByClassName("tab");

  if (!tabs.length) {
    console.error("❌ Tabs not found");
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
    const inputs = tabs[currentTab].querySelectorAll("input, select");
    for (let input of inputs) {
      if (!input.checkValidity()) {
        input.reportValidity();
        return false;
      }
    }
    return true;
  }

  function generatePassword(length = 10) {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$!";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // ---------- Form Submission ----------
  document.getElementById("regForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const aadhaar = document.getElementById("aadhaar").value.trim();
    const pan = document.getElementById("pan").value.trim();
    const gender = document.getElementById("gender").value;
    const dob = document.getElementById("dob").value;
    const userType = document.getElementById("userType").value;
    const country = document.getElementById("country").value;

    try {
      const existing = await db.collection("users").where("email", "==", email).get();
      if (!existing.empty) {
        document.getElementById("popupEmail").innerText = email;
        document.getElementById("popupPassword").innerText = "Already Registered! Please Login.";
        document.getElementById("popup").style.display = "flex";
        return;
      }

      const password = generatePassword();

      // Create user in Firebase Authentication
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);

      // Store in Firestore
      await db.collection("users").add({
        uid: userCredential.user.uid,
        name, email, phone, aadhaar, pan,
        gender, dob, userType, country,
        password,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      // Show Popup
      document.getElementById("popupEmail").innerText = email;
      document.getElementById("popupPassword").innerText = password;
      document.getElementById("popup").style.display = "flex";

      // Reset
      document.getElementById("regForm").reset();
      currentTab = 0;
      showTab(currentTab);
    } catch (error) {
      alert("❌ Error: " + error.message);
      console.error(error);
    }
  });

  // ---------- Close Popup ----------
  document.getElementById("closePopup").addEventListener("click", function () {
    document.getElementById("popup").style.display = "none";
  });
});
