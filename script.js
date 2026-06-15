/* =================================================================
   North Hills Narwhals — Season 0
   ================================================================= */

/* -----------------------------------------------------------------
   FORM ENDPOINT  —  set this in ONE place.
   Paste your Google Apps Script Web App URL below (see README for the
   2-minute setup). It looks like:
   "https://script.google.com/macros/s/AKfyc.../exec"
   Each submission is appended as a row in your Google Sheet.
   Until it's set, the form runs in demo mode (shows success, posts nothing).
   ----------------------------------------------------------------- */
const FORM_ENDPOINT = "https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec";

(function () {
  "use strict";

  const isPlaceholderEndpoint = FORM_ENDPOINT.includes("REPLACE_WITH_YOUR_DEPLOYMENT_ID");

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
        // Apps Script Web Apps don't return CORS headers, so we use no-cors:
        // the row is still written; we just can't read the response, so a
        // resolved request is treated as success (a network failure rejects).
        await fetch(FORM_ENDPOINT, {
          method: "POST",
          mode: "no-cors",
          body: new FormData(form),
        });
        showSuccess();
      } catch (err) {
        errorEl.hidden = false;
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    });
  }
})();
