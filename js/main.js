const nav = document.getElementById("nav");
const modal = document.getElementById("auth-modal");
const closeBtn = document.getElementById("auth-close");

function onScroll() {
  nav.classList.toggle("is-scrolled", window.scrollY > 40);
}

onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

function useReveal(selector) {
  const nodes = document.querySelectorAll(selector);
  if (!nodes.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -8px 0px" }
  );

  nodes.forEach((node) => observer.observe(node));
}

useReveal(".reveal");
useReveal(".reveal-left");
useReveal(".reveal-stagger");

function setTab(name) {
  modal.querySelectorAll(".tab").forEach((tab) => {
    const active = tab.dataset.tab === name;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  modal.querySelectorAll(".auth-form").forEach((form) => {
    form.classList.toggle("is-active", form.dataset.panel === name);
  });
}

function openAuth(tab = "login") {
  setTab(tab);
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  const first = modal.querySelector(".auth-form.is-active input");
  if (first) first.focus();
}

function closeAuth() {
  modal.hidden = true;
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-open-auth]").forEach((el) => {
  el.addEventListener("click", () => openAuth(el.dataset.openAuth));
});

closeBtn.addEventListener("click", closeAuth);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeAuth();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closeAuth();
});

modal.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => setTab(tab.dataset.tab));
});

modal.querySelectorAll(".auth-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const note = form.querySelector(".form-note");
    note.hidden = false;
    note.textContent =
      form.dataset.panel === "register"
        ? "Cuenta de demo lista. En la versión real aquí iría el registro."
        : "Sesión de demo. En la versión real aquí iría el acceso.";
  });
});
