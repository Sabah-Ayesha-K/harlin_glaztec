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

const contactForm = document.getElementById("contact-form");
const statusEl = document.getElementById("contact-status");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    statusEl.textContent = "Thanks! We received your message. We’ll contact you soon.";
    contactForm.reset();
  });
}

// Projects modal (Grid + Modal)
// ===== Projects Modal With Arrows =====

const pmodal = document.getElementById("pmodal");
const pmodalClose = document.getElementById("pmodalClose");
const pmodalPrev = document.getElementById("pmodalPrev");
const pmodalNext = document.getElementById("pmodalNext");

const pmodalImg = document.getElementById("pmodalImg");
const pmodalTitle = document.getElementById("pmodalTitle");
const pmodalMeta = document.getElementById("pmodalMeta");
const pmodalDesc = document.getElementById("pmodalDesc");

const projectCards = document.querySelectorAll(".project-card");

let currentIndex = 0;

function updateModal(index){
  const card = projectCards[index];

  pmodalTitle.textContent = card.dataset.title || "Project";
  pmodalMeta.textContent = card.dataset.meta || "";
  pmodalDesc.textContent = card.dataset.desc || "";
  pmodalImg.src = card.dataset.img || card.getAttribute("href") || "";
}

function openProjectModal(index){
  currentIndex = index;
  updateModal(currentIndex);
  pmodal.hidden = false;
}

function closeProjectModal(){
  pmodal.hidden = true;
  pmodalImg.src = "";
}

function showNext(){
  currentIndex = (currentIndex + 1) % projectCards.length;
  updateModal(currentIndex);
}

function showPrev(){
  currentIndex =
    (currentIndex - 1 + projectCards.length) % projectCards.length;
  updateModal(currentIndex);
}

// Open modal
projectCards.forEach((card, index) => {
  card.addEventListener("click", (e) => {
    e.preventDefault();
    openProjectModal(index);
  });
});

// Arrows
pmodalNext?.addEventListener("click", showNext);
pmodalPrev?.addEventListener("click", showPrev);

// Close
pmodalClose?.addEventListener("click", closeProjectModal);

pmodal?.addEventListener("click", (e) => {
  if(e.target === pmodal) closeProjectModal();
});

// Keyboard navigation
window.addEventListener("keydown", (e) => {
  if(pmodal.hidden) return;

  if(e.key === "Escape") closeProjectModal();
  if(e.key === "ArrowRight") showNext();
  if(e.key === "ArrowLeft") showPrev();
});
