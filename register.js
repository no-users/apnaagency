document.addEventListener("DOMContentLoaded", function() {
  // ---------- Firebase Config ----------
  const firebaseConfig = {
    apiKey: "AIzaSyAXHD3qrc_sRPzUwpd6kLqGVrOqb2XqMpk",
    authDomain: "my-login-page-62659.firebaseapp.com",
    projectId: "my-login-page-62659",
    storageBucket: "my-login-page-62659.appspot.com",
    messagingSenderId: "265063991992",
    appId: "1:265063991992:web:f1834f4664e5494779024d",
    measurementId: "G-EJ7P52JB4N"
  };

  console.log("Tabs found:", tabs.length);

  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  // ---------- Multi-step Form ----------
  let currentTab = 0;
  const tabs = document.getElementsByClassName("tab");
  showTab(currentTab);

  function showTab(n) {
    for (let i = 0; i < tabs.length; i++) tabs[i].style.display = "none";
    tabs[n].style.display = "block";

    document.getElementById("prevBtn").style.display = n === 0 ? "none" : "inline";
    document.getElementById("nextBtn").style.display = n === (tabs.length - 1) ? "none" : "inline";
    document.getElementById("submitBtn").style.display = n === (tabs.length - 1) ? "inline" : "none";
  }

  window.nextPrev = function(n) {
    if (n === 1 && !validateForm()) return false;
    currentTab += n;
    if (currentTab >= tabs.length) currentTab = tabs.length - 1;
    if (currentTab < 0) currentTab = 0;
    showTab(currentTab);
  }

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

    const existing = await db.collection("users").where("email", "==", email).get();
    if (!existing.empty) {
      document.getElementById("popupEmail").innerText = email;
      document.getElementById("popupPassword").innerText = "Already Registered! Please Login.";
      document.getElementById("popup").classList.add("show");
      document.getElementById("popup").style.display = "flex";
      return;
    }

    const password = generatePassword(10);

    db.collection("users").add({
      name: document.getElementById("name").value,
      email: email,
      phone: document.getElementById("phone").value,
      aadhaar: document.getElementById("aadhaar").value,
      pan: document.getElementById("pan").value,
      gender: document.getElementById("gender").value,
      dob: document.getElementById("dob").value,
      userType: document.getElementById("userType").value,
      country: document.getElementById("country").value,
      password: password,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      document.getElementById("popupEmail").innerText = email;
      document.getElementById("popupPassword").innerText = password;
      document.getElementById("popup").classList.add("show");
      document.getElementById("popup").style.display = "flex";

      document.getElementById("regForm").reset();
      currentTab = 0;
      showTab(currentTab);
    }).catch((error) => {
      alert("Error saving data: " + error.message);
    });
  });

  // ---------- Close Popup ----------
  document.getElementById("closePopup").addEventListener("click", function() {
    document.getElementById("popup").classList.remove("show");
    document.getElementById("popup").style.display = "none";
  });
});
