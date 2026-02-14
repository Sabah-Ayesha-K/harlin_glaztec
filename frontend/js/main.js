// Year
document.getElementById("year").textContent = new Date().getFullYear();

// Sidepanel open/close
const infoBtn = document.getElementById("infoBtn");
const sidepanel = document.getElementById("sidepanel");
const closePanel = document.getElementById("closePanel");
const overlay = document.getElementById("overlay");

function openPanel() {
  sidepanel.classList.add("open");
  sidepanel.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
}

function closeSidePanel() {
  sidepanel.classList.remove("open");
  sidepanel.setAttribute("aria-hidden", "true");
  overlay.hidden = true;
}

infoBtn?.addEventListener("click", openPanel);
closePanel?.addEventListener("click", closeSidePanel);
overlay?.addEventListener("click", closeSidePanel);

// Mobile menu (we’ll build dropdown in next step)
const hamburger = document.getElementById("hamburger");
hamburger?.addEventListener("click", () => {
  alert("Next step: build mobile menu dropdown");
});


