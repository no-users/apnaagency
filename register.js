let currentTab = 0; 
showTab(currentTab);

function showTab(n) {
  const tabs = document.getElementsByClassName("tab");
  tabs[n].style.display = "block";

  // Previous button hide on first step
  document.getElementById("prevBtn").style.display = n === 0 ? "none" : "inline";
  
  // Next button hide on last step
  document.getElementById("nextBtn").style.display = n === (tabs.length - 1) ? "none" : "inline";

  // Submit button show on last step
  document.getElementById("submitBtn").style.display = n === (tabs.length - 1) ? "inline" : "none";
}

function nextPrev(n) {
  const tabs = document.getElementsByClassName("tab");

  // Validate current tab
  if (n === 1 && !validateForm()) return false;

  tabs[currentTab].style.display = "none";
  currentTab += n;
  
  if (currentTab >= tabs.length) {
    document.getElementById("regForm").submit();
    return false;
  }

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
