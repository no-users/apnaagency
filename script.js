let currentTab = 0;
showTab(currentTab);

function showTab(n) {
  const tabs = document.getElementsByClassName("tab");
  tabs[n].style.display = "block";

  document.getElementById("prevBtn").style.display = n === 0 ? "none" : "inline-block";
  document.getElementById("nextBtn").innerHTML = n === (tabs.length - 1) ? "Submit" : "Next";
}

function nextPrev(n) {
  const tabs = document.getElementsByClassName("tab");

  // ✅ Validate form before going to next step
  if (n === 1 && !validateForm()) return;

  tabs[currentTab].style.display = "none";
  currentTab += n;

  if (currentTab >= tabs.length) {
    document.getElementById("regForm").submit();
    return;
  }

  showTab(currentTab);
}

function validateForm() {
  const tab = document.getElementsByClassName("tab")[currentTab];
  const inputs = tab.querySelectorAll("input, select");

  let valid = true;

  for (let i = 0; i < inputs.length; i++) {
    // browser built-in validation
    if (!inputs[i].checkValidity()) {
      inputs[i].reportValidity(); // show default browser message
      valid = false;
      break; // stop at first invalid field
    }
  }

  return valid;
}
