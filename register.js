// ---------- Firebase Config ----------
const firebaseConfig = {
  apiKey: "Yahan aapka apiKey",
  authDomain: "Yahan aapka projectId.firebaseapp.com",
  projectId: "Yahan aapka projectId",
  storageBucket: "Yahan aapka projectId.appspot.com",
  messagingSenderId: "Yahan aapka senderId",
  appId: "Yahan aapka appId"
};

// ---------- Firebase Setup ----------
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ---------- Multi-step Form ----------
let currentTab = 0;
showTab(currentTab);

function showTab(n) {
  const tabs = document.getElementsByClassName("tab");
  for (let tab of tabs) tab.style.display = "none";
  tabs[n].style.display = "block";

  document.getElementById("prevBtn")?.style.display = n === 0 ? "none" : "inline";
  document.getElementById("nextBtn")?.style.display = n === (tabs.length - 1) ? "none" : "inline";
  document.getElementById("submitBtn")?.style.display = n === (tabs.length - 1) ? "inline" : "none";
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
  const inputs = tab.getElementsByTagName("input");
  const selects = tab.getElementsByTagName("select");
  let valid = true;

  for (let input of inputs) {
    if (!input.checkValidity()) {
      input.reportValidity();
      valid = false;
      break;
    }
  }
  for (let select of selects) {
    if (!select.checkValidity()) {
      select.reportValidity();
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

  const email = document.getElementById("email").value.trim();

  try {
    // Check if email already exists
    const existing = await db.collection("users").where("email", "==", email).get();

    if (!existing.empty) {
      // Already registered popup
      document.getElementById("popupEmail").innerText = email;
      document.getElementById("popupPassword").innerText = "Already Registered! Please Login.";
      document.getElementById("popup").style.display = "flex";
      return;
    }

    // Generate password for new user
    const password = generatePassword(10);

    // Save data to Firestore
    await db.collection("users").add({
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
    });

    // Show success popup
    document.getElementById("popupEmail").innerText = email;
    document.getElementById("popupPassword").innerText = password;
    document.getElementById("popup").style.display = "flex";

  } catch (error) {
    alert("Error storing data: " + error.message);
  }
});

// ---------- Close Popup ----------
document.getElementById("closePopup").addEventListener("click", function() {
  document.getElementById("popup").style.display = "none";
});


// ---------- Close Popup ----------
document.getElementById("closePopup").addEventListener("click", function() {
  document.getElementById("popup").style.display = "none";
});
