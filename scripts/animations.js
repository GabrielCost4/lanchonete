/**
 * animations.js
 * Scroll reveal, parallax, navbar scroll, e micro-animações.
 */

document.addEventListener("DOMContentLoaded", () => {
  initNavbarScroll();
  initScrollReveal();
  initParallax();
  initMobileMenu();
  initSmoothScroll();
  initFloatingElements();
});

/* ──────────────────────────────────────────
   NAVBAR — efeito ao scroll
─────────────────────────────────────────── */
function initNavbarScroll() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  let lastY = 0;

  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    navbar.classList.toggle("scrolled", y > 50);
    navbar.classList.toggle("nav-hidden", y > lastY + 10 && y > 200);
    navbar.classList.toggle("nav-visible", y < lastY - 10);
    lastY = y;
  }, { passive: true });
}

/* ──────────────────────────────────────────
   SCROLL REVEAL — fade-in ao entrar na viewport
─────────────────────────────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  els.forEach((el) => observer.observe(el));
}

/* ──────────────────────────────────────────
   PARALLAX — hero background
─────────────────────────────────────────── */
function initParallax() {
  const hero = document.getElementById("hero");
  if (!hero) return;

  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.5) {
      hero.style.backgroundPositionY = `calc(50% + ${y * 0.35}px)`;
    }
  }, { passive: true });
}

/* ──────────────────────────────────────────
   MOBILE MENU — abrir/fechar
─────────────────────────────────────────── */
function initMobileMenu() {
  const toggle = document.getElementById("mobile-menu-toggle");
  const menu = document.getElementById("mobile-nav");
  const overlay = document.getElementById("mobile-overlay");

  toggle?.addEventListener("click", () => {
    const open = menu?.classList.toggle("open");
    toggle.classList.toggle("active", open);
    overlay?.classList.toggle("visible", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  overlay?.addEventListener("click", closeMobileMenu);

  // Fechar ao clicar em link
  menu?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", closeMobileMenu);
  });
}

function closeMobileMenu() {
  document.getElementById("mobile-nav")?.classList.remove("open");
  document.getElementById("mobile-overlay")?.classList.remove("visible");
  const toggle = document.getElementById("mobile-menu-toggle");
  toggle?.classList.remove("active");
  toggle?.setAttribute("aria-expanded", "false");
}

/* ──────────────────────────────────────────
   SMOOTH SCROLL — links âncora
─────────────────────────────────────────── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* ──────────────────────────────────────────
   FLOATING ELEMENTS — animação hero
─────────────────────────────────────────── */
function initFloatingElements() {
  const floats = document.querySelectorAll(".float-el");
  floats.forEach((el, i) => {
    el.style.animationDelay = `${i * 0.6}s`;
  });
}

/* ──────────────────────────────────────────
   HERO COUNTER — número animado
─────────────────────────────────────────── */
function animateCounter(el, target, duration = 1800) {
  let start = 0;
  const step = target / (duration / 16);
  const update = () => {
    start = Math.min(start + step, target);
    el.textContent = Math.floor(start).toLocaleString("pt-BR");
    if (start < target) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// Dispara contadores ao entrar na viewport
const counters = document.querySelectorAll("[data-count]");
const counterObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animateCounter(el, parseInt(el.dataset.count), 1800);
        counterObs.unobserve(el);
      }
    });
  },
  { threshold: 0.5 }
);
counters.forEach((c) => counterObs.observe(c));
