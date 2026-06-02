/**
 * app.js
 * Orquestrador principal da aplicação Burger House.
 * Inicializa módulos, conecta eventos globais e gerencia estado da UI.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Loading screen
  initLoadingScreen();

  // Tabs de navegação por âncora
  highlightActiveNavLink();

  // Atualiza active nav ao scroll
  window.addEventListener("scroll", highlightActiveNavLink, { passive: true });
});

/* ──────────────────────────────────────────
   LOADING SCREEN
─────────────────────────────────────────── */
function initLoadingScreen() {
  const loader = document.getElementById("loading-screen");
  if (!loader) return;

  // Aguarda imagens críticas + scripts
  window.addEventListener("load", () => {
    setTimeout(() => {
      loader.classList.add("loaded");
      setTimeout(() => loader.remove(), 700);
    }, 800);
  });

  // Fallback: remove após 3s no máximo
  setTimeout(() => {
    loader?.classList.add("loaded");
    setTimeout(() => loader?.remove(), 700);
  }, 3000);
}

/* ──────────────────────────────────────────
   ACTIVE NAV LINK
─────────────────────────────────────────── */
function highlightActiveNavLink() {
  const sections = ["hero", "menu"];
  const navLinks = document.querySelectorAll(".nav-link[data-section]");

  let current = "hero";
  const scrollY = window.scrollY + 100;

  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el && scrollY >= el.offsetTop) current = id;
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.section === current);
  });
}

/* ──────────────────────────────────────────
   HERO CTA → scroll to menu
─────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("hero-cta-btn")?.addEventListener("click", () => {
    if (!window.storeIsOpen) {
      showCustomAlert(
        window.storeSettings?.closedMessage || "Estabelecimento fechado.",
        "closed"
      );
      return;
    }
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  });
});
