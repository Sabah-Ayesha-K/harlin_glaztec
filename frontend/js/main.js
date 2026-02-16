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
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // find the submit button safely (works even if type="submit" is missing)
    const submitBtn =
      contactForm.querySelector('[type="submit"]') ||
      contactForm.querySelector("button");

    // prevent double submit
    if (submitBtn && submitBtn.disabled) return;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.7";
      submitBtn.style.cursor = "not-allowed";
    }

    if (statusEl) statusEl.textContent = "Sending...";

    const payload = {
      name: document.getElementById("name")?.value?.trim() || "",
      email: document.getElementById("email")?.value?.trim() || "",
      phone: document.getElementById("phone")?.value?.trim() || "",
      message: document.getElementById("message")?.value?.trim() || "",
      company: document.getElementById("company")?.value?.trim() || "" // honeypot
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.ok) {
        if (statusEl) statusEl.textContent = data.message || "Message sent successfully!";
        contactForm.reset();
      } else {
        if (statusEl) statusEl.textContent = data?.detail || "Failed to send. Please try again.";
      }
    } catch (err) {
      if (statusEl) statusEl.textContent = "Server not reachable. Is the backend running?";
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
        submitBtn.style.cursor = "pointer";
      }
    }
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
