/* =================================================================
   North Hills Narwhals — Season 0
   ================================================================= */

/* -----------------------------------------------------------------
   FORMSPREE ENDPOINT  —  set this in ONE place.
   Replace the placeholder below with your real Formspree form URL,
   e.g. "https://formspree.io/f/abcdwxyz".
   Until then the form runs in demo mode (shows success, posts nothing).
   ----------------------------------------------------------------- */
const FORMSPREE_ENDPOINT = "https://formspree.io/f/REPLACE_WITH_YOUR_FORM_ID";

(function () {
  "use strict";

  const isPlaceholderEndpoint = FORMSPREE_ENDPOINT.includes("REPLACE_WITH_YOUR_FORM_ID");

  /* ------------------------- Mobile nav ------------------------- */
  const nav = document.querySelector(".site-nav");
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.getElementById("nav-menu");

  function closeNav() {
    if (!nav) return;
    nav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      const open = nav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    // Close when a nav link is tapped
    navMenu.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav();
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* --------------------- Single-open FAQ ------------------------ */
  // Native <details> stay fully functional; this just collapses siblings.
  const faqItems = Array.from(document.querySelectorAll(".faq-item"));
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---------------------- Scroll reveals ------------------------ */
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  } else {
    const observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ----------------------- Sign-up form ------------------------- */
  const form = document.getElementById("signup-form");
  const card = document.querySelector(".form-card");

  if (form && card) {
    const formState = card.querySelector('[data-state="form"]');
    const successState = card.querySelector('[data-state="success"]');
    const errorEl = document.getElementById("form-error");
    const submitBtn = form.querySelector('button[type="submit"]');

    function showSuccess() {
      formState.hidden = true;
      successState.hidden = false;
      // Move focus to the success message for screen-reader users.
      successState.setAttribute("tabindex", "-1");
      successState.focus({ preventScroll: true });
      successState.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "center" });
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      errorEl.hidden = true;
      submitBtn.disabled = true;
      const originalLabel = submitBtn.textContent;
      submitBtn.textContent = "Sending…";

      // Demo mode: no real endpoint configured yet.
      if (isPlaceholderEndpoint) {
        setTimeout(showSuccess, 400);
        return;
      }

      try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: new FormData(form),
        });

        if (response.ok) {
          showSuccess();
        } else {
          throw new Error("Bad response");
        }
      } catch (err) {
        errorEl.hidden = false;
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    });
  }
})();
