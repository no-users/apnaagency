// ---------- Firebase Config ----------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
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
  const inputs = tab.getElementsByTagName("input");
  const selects = tab.getElementsByTagName("select");
  let valid = true;
  for (let input of inputs) {
    if (!input.checkValidity()) { input.reportValidity(); valid = false; break; }
  }
  for (let select of selects) {
    if (!select.checkValidity()) { select.reportValidity(); valid = false; break; }
  }
  return valid;
}

// ---------- Password Generator ----------
function generatePassword(length = 12) {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const symbols = "@#$!&*";
  let password = upper[Math.floor(Math.random()*upper.length)] +
                 lower[Math.floor(Math.random()*lower.length)] +
                 digits[Math.floor(Math.random()*digits.length)] +
                 symbols[Math.floor(Math.random()*symbols.length)];
  const all = upper + lower + digits + symbols;
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random()*all.length)];
  }
  return password.split('').sort(()=>0.5-Math.random()).join('');
}

// ---------- Form Submit ----------
document.getElementById("regForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();

  try {
    const existing = await db.collection("users").where("email","==",email).get();
    if(!existing.empty){
      document.getElementById("popupEmail").innerText = email;
      document.getElementById("popupPassword").innerText = "Already Registered! Please Login.";
      document.getElementById("popup").style.display = "flex";
      return;
    }

    const password = generatePassword();
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

    document.getElementById("popupEmail").innerText = email;
    document.getElementById("popupPassword").innerText = password;
    document.getElementById("popup").style.display = "flex";

  } catch (err) {
    alert("Error: " + err.message);
  }
});

// ---------- Close Popup ----------
document.getElementById("closePopup").addEventListener("click", function() {
  document.getElementById("popup").style.display = "none";
});
