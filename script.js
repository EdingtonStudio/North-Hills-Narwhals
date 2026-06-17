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
const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbzudQcIUn_7j-hERoAIO_Bdu9t0RH2RbCTb7_Gnfk0SHWr75muxzo1jCOb6VsDmR8mtPg/exec";

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

  /* ------------------ Scoreboard count-up ----------------------- */
  (function () {
    const nums = Array.from(document.querySelectorAll(".scoreboard .stat-num"));
    if (!nums.length) return;

    if (prefersReduced || !("IntersectionObserver" in window)) return; // leave final values

    // Stash finals; reset countable numbers to 0 so they roll up.
    nums.forEach(function (el) {
      const m = el.textContent.trim().match(/^(\d+)/);
      el.dataset.final = el.textContent;
      if (m && parseInt(m[1], 10) > 0) {
        el.dataset.target = m[1];
        el.textContent = "0";
      }
    });

    function countUp(el) {
      const target = parseInt(el.dataset.target, 10);
      const dur = 1000;
      let start = 0;
      function step(ts) {
        if (!start) start = ts;
        const p = Math.min(1, (ts - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = el.dataset.final; // restore suffixes like "35+"
      }
      requestAnimationFrame(step);
    }

    const sb = document.querySelector(".scoreboard");
    const obs = new IntersectionObserver(function (entries, o) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        o.disconnect();
        nums.forEach(function (el) {
          if (el.dataset.target) countUp(el);
          else if (el.textContent.indexOf("∞") !== -1) el.classList.add("stat-spin");
        });
      });
    }, { threshold: 0.4 });
    obs.observe(sb);
  })();

  /* --------------------- Monogram Easter egg -------------------- */
  (function () {
    const BALL = '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="47" fill="#fff" stroke="#d7e2ea" stroke-width="2"/><path d="M24 13 Q42 50 24 87" fill="none" stroke="#c0392b" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 8"/><path d="M76 13 Q58 50 76 87" fill="none" stroke="#c0392b" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 8"/></svg>';
    let cooling = false;

    function toast(msg) {
      const t = document.createElement("div");
      t.className = "clubhouse-toast";
      t.textContent = msg;
      document.body.appendChild(t);
      requestAnimationFrame(function () { t.classList.add("show"); });
      setTimeout(function () { t.classList.remove("show"); }, 2200);
      setTimeout(function () { t.remove(); }, 2700);
    }

    function burst(cx, cy) {
      const n = 22;
      for (let i = 0; i < n; i++) {
        const b = document.createElement("div");
        b.className = "bb";
        b.innerHTML = BALL;
        b.style.left = cx + "px";
        b.style.top = cy + "px";
        document.body.appendChild(b);
        const dx = (Math.random() * 2 - 1) * 320;
        const rise = 120 + Math.random() * 220;
        const fall = 360 + Math.random() * 260;
        const rot = (Math.random() * 2 - 1) * 540;
        const dur = 900 + Math.random() * 500;
        b.animate([
          { transform: "translate(-50%,-50%) scale(0.4)", opacity: 1 },
          { transform: "translate(calc(-50% + " + dx * 0.5 + "px), calc(-50% - " + rise + "px)) rotate(" + rot * 0.5 + "deg) scale(1)", opacity: 1, offset: 0.4 },
          { transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + fall + "px)) rotate(" + rot + "deg) scale(0.9)", opacity: 0 }
        ], { duration: dur, easing: "cubic-bezier(0.2,0.6,0.4,1)", fill: "forwards" })
          .onfinish = function () { b.remove(); };
      }
    }

    function fire(el) {
      if (cooling) return;
      cooling = true;
      setTimeout(function () { cooling = false; }, 1200);
      toast("⚾ You found the clubhouse.");
      if (prefersReduced) return;
      let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      if (el && el.getBoundingClientRect) {
        const r = el.getBoundingClientRect();
        cx = r.left + r.width / 2; cy = r.top + r.height / 2;
      }
      burst(cx, cy);
    }

    // Clickable marks
    Array.from(document.querySelectorAll(".why-mark img, .footer-mark")).forEach(function (el) {
      el.style.cursor = "pointer";
      el.addEventListener("click", function () { fire(el); });
    });

    // Konami code
    const code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let pos = 0;
    document.addEventListener("keydown", function (e) {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      pos = (k === code[pos]) ? pos + 1 : (k === code[0] ? 1 : 0);
      if (pos === code.length) { pos = 0; fire(document.querySelector(".why-mark img")); }
    });
  })();
})();
