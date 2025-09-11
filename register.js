<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Premium Registration</title>
  <link rel="stylesheet" href="register.css">

  <!-- Firebase SDK -->
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
</head>
<body>
  <div class="container">
    <form id="regForm">
      <h2>Register</h2>

      <!-- Step 1 -->
      <div class="tab">
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" id="name" placeholder="Enter your name" required>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" id="email" placeholder="Enter your email" required>
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input type="tel" id="phone" placeholder="Enter your phone" required>
        </div>
      </div>

      <!-- Step 2 -->
      <div class="tab">
        <div class="form-group">
          <label>Aadhaar Number</label>
          <input type="text" id="aadhaar" placeholder="Enter Aadhaar" pattern="\d{12}" required>
        </div>
        <div class="form-group">
          <label>PAN Number</label>
          <input type="text" id="pan" placeholder="Enter PAN" pattern="[A-Z]{5}[0-9]{4}[A-Z]{1}" required>
        </div>
        <div class="form-group">
          <label>Gender</label>
          <select id="gender" required>
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
        <div class="form-group">
          <label>Date of Birth</label>
          <input type="date" id="dob" required>
        </div>
      </div>

      <!-- Step 3 -->
      <div class="tab">
        <div class="form-group">
          <label>User Type</label>
          <select id="userType" required>
            <option value="">Select Type</option>
            <option>Retailer</option>
            <option>Distributor</option>
            <option>Super Distributor</option>
          </select>
        </div>
        <div class="form-group">
          <label>Country</label>
          <select id="country" required>
            <option value="">Select Country</option>
            <option>India</option>
            <option>USA</option>
            <option>UK</option>
          </select>
        </div>
        <div class="form-group terms">
          <label><input type="checkbox" required> I agree to Terms & Conditions</label>
        </div>
      </div>

      <!-- Buttons -->
      <div class="buttons">
        <button type="button" id="prevBtn" onclick="nextPrev(-1)">Previous</button>
        <button type="button" id="nextBtn" onclick="nextPrev(1)">Next</button>
        <button type="submit" id="submitBtn" style="display:none;">Register</button>
      </div>
    </form>
  </div>

  <!-- Popup -->
  <div id="popup" class="popup">
    <div class="popup-content">
      <span id="closePopup" class="close">&times;</span>
      <h3>Registration Info</h3>
      <p><strong>Email:</strong> <span id="popupEmail"></span></p>
      <p><strong>Password:</strong> <span id="popupPassword"></span></p>
    </div>
  </div>

  <footer>
    <p>&copy; 2025 Premium Registration. All rights reserved.</p>
  </footer>

  <script src="register.js"></script>
</body>
</html>


  function showTab(n) {
    for (let i = 0; i < tabs.length; i++) tabs[i].style.display = "none";
    tabs[n].style.display = "block";

    document.getElementById("prevBtn").style.display = n === 0 ? "none" : "inline";
    document.getElementById("nextBtn").style.display = n === (tabs.length - 1) ? "none" : "inline";
    document.getElementById("submitBtn").style.display = n === (tabs.length - 1) ? "inline" : "none";
  }

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

  // ---------- Password Generator ----------
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

    try {
      // Check if email already exists in Firestore
      const existing = await db.collection("users").where("email", "==", email).get();
      if (!existing.empty) {
        document.getElementById("popupEmail").innerText = email;
        document.getElementById("popupPassword").innerText = "Already Registered! Please Login.";
        showPopup();
        return;
      }

      const password = generatePassword();

      // Create user in Firebase Authentication
      await auth.createUserWithEmailAndPassword(email, password);

      // Save additional user info in Firestore
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

      // Show popup with login details
      document.getElementById("popupEmail").innerText = email;
      document.getElementById("popupPassword").innerText = password;
      showPopup();

      // Reset form
      document.getElementById("regForm").reset();
      currentTab = 0;
      showTab(currentTab);

    } catch (error) {
      alert("Registration failed: " + error.message);
    }
  });

  // ---------- Show Popup ----------
  function showPopup() {
    document.getElementById("popup").classList.add("show");
    document.getElementById("popup").style.display = "flex";
  }

  // ---------- Close Popup ----------
  document.getElementById("closePopup").addEventListener("click", function () {
    document.getElementById("popup").classList.remove("show");
    document.getElementById("popup").style.display = "none";
  });
});
