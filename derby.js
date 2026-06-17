/* =================================================================
   Narwhal Home Run Derby
   Timing mini-game. Vanilla JS, no dependencies.
   ================================================================= */
(function () {
  "use strict";

  // --- Tuning ---------------------------------------------------
  const PITCHES = 9;            // swings per round (nine, naturally)
  const IDEAL = 0.80;          // ball progress (0..1) at the sweet spot
  const W_HR = 0.05;           // |delta| windows from IDEAL
  const W_DBL = 0.11;
  const W_HIT = 0.18;
  const BASE_MS = 1700;        // first pitch travel time
  const STEP_MS = 120;         // faster each pitch
  const MIN_MS = 820;
  const START_TOP = -8;        // ball top% at progress 0
  const END_TOP = 98;          // ball top% at progress 1
  const BEST_KEY = "nhn_derby_best";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Elements -------------------------------------------------
  const field = document.getElementById("field");
  const ball = document.getElementById("ball");
  const batter = document.getElementById("batter");
  const verdict = document.getElementById("verdict");
  const hint = document.getElementById("hint");
  const actionBtn = document.getElementById("actionBtn");
  const gameover = document.getElementById("gameover");
  const goTitle = document.getElementById("goTitle");
  const goMsg = document.getElementById("goMsg");
  const againBtn = document.getElementById("againBtn");
  const shareBtn = document.getElementById("shareBtn");
  const srStatus = document.getElementById("srStatus");
  const elPitch = document.getElementById("pitchNum");
  const elHomers = document.getElementById("homers");
  const elScore = document.getElementById("score");
  const elStreak = document.getElementById("streak");
  const elBest = document.getElementById("best");

  // --- State ----------------------------------------------------
  let pitchIndex = 0;     // 0-based pitch currently in flight
  let progress = 0;
  let rafId = null;
  let startTime = 0;
  let duration = BASE_MS;
  let swung = false;
  let playing = false;
  let homers = 0;
  let score = 0;
  let streakHR = 0;
  let best = parseInt(localStorage.getItem(BEST_KEY) || "0", 10) || 0;

  const HR_LINES = ["That's gone.", "Off the scoreboard.", "Still going.", "River ball.", "See you later."];
  const setText = (el, v) => { el.textContent = v; };

  function init() {
    setText(elBest, best);
    actionBtn.addEventListener("click", startGame);
    againBtn.addEventListener("click", startGame);
    shareBtn.addEventListener("click", share);

    // Swing inputs
    field.addEventListener("pointerdown", onSwingInput);
    field.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Enter" || e.code === "Space") {
        e.preventDefault();
        onSwingInput();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (playing && (e.code === "Space")) { e.preventDefault(); onSwingInput(); }
    });
  }

  function startGame() {
    pitchIndex = 0; homers = 0; score = 0; streakHR = 0;
    gameover.hidden = true;
    actionBtn.hidden = true;
    setText(elHomers, 0); setText(elScore, 0); setText(elStreak, 0);
    field.focus();
    nextPitch();
  }

  function nextPitch() {
    if (pitchIndex >= PITCHES) return endGame();
    playing = true;
    swung = false;
    progress = 0;
    duration = Math.max(MIN_MS, BASE_MS - pitchIndex * STEP_MS);
    setText(elPitch, (pitchIndex + 1) + "/" + PITCHES);
    hint.textContent = "Here it comes… swing!";
    ball.style.display = "block";
    ball.style.opacity = "1";
    ball.style.transition = "none";
    ball.style.top = START_TOP + "%";
    ball.style.transform = "translate(-50%, -50%) scale(1)";
    startTime = 0;
    rafId = requestAnimationFrame(loop);
  }

  function loop(t) {
    if (!startTime) startTime = t;
    progress = (t - startTime) / duration;
    if (progress >= 1) progress = 1;
    ball.style.top = (START_TOP + (END_TOP - START_TOP) * progress) + "%";
    if (!swung && progress >= 1) {
      // Let it sail past without a swing
      resolve("whiff", true);
      return;
    }
    if (playing && !swung) rafId = requestAnimationFrame(loop);
  }

  function onSwingInput() {
    if (!playing) {
      // Idle before the first pitch: a tap/space on the field also starts play.
      if (gameover.hidden && !actionBtn.hidden) startGame();
      return;
    }
    if (swung) return;
    swung = true;
    cancelAnimationFrame(rafId);
    const delta = Math.abs(progress - IDEAL);
    let outcome;
    if (progress < 0.25) outcome = "whiff";   // jumped way early
    else if (delta <= W_HR) outcome = "hr";
    else if (delta <= W_DBL) outcome = "dbl";
    else if (delta <= W_HIT) outcome = "hit";
    else outcome = "whiff";
    resolve(outcome, false);
  }

  function resolve(outcome, looking) {
    playing = false;
    if (batter && !reduceMotion) {
      batter.classList.remove("swing");
      void batter.offsetWidth;
      batter.classList.add("swing");
    }

    let word, sub = "", cls = outcome, pts = 0;
    if (outcome === "hr") {
      homers++; streakHR++;
      const mult = Math.min(3, 1 + (streakHR - 1) * 0.25);
      pts = Math.round(100 * mult);
      word = "DINGER!";
      sub = streakHR >= 2 ? (streakHR + " in a row · " + mult.toFixed(2) + "x") : HR_LINES[homers % HR_LINES.length];
      flyOut();
      if (!reduceMotion) {
        field.classList.add("flash"); field.classList.add("shake");
        setTimeout(() => field.classList.remove("flash", "shake"), 500);
      }
    } else if (outcome === "dbl") {
      streakHR = 0; pts = 50; word = "OFF THE WALL"; sub = "Stand-up double."; dropBall(true);
    } else if (outcome === "hit") {
      streakHR = 0; pts = 20; word = "BASE KNOCK"; sub = "We'll take it."; dropBall(false);
    } else {
      streakHR = 0; pts = 0; word = looking ? "STRIKE" : "WHIFF";
      sub = looking ? "Caught looking." : "Swung at air.";
      dropBall(false);
    }

    score += pts;
    setText(elHomers, homers);
    setText(elScore, score);
    setText(elStreak, streakHR);
    showVerdict(word, sub, cls);
    srStatus.textContent = word + (sub ? " " + sub : "") + ". " + homers + " dingers, score " + score + ".";

    pitchIndex++;
    const delay = reduceMotion ? 650 : 1000;
    setTimeout(nextPitch, delay);
  }

  function flyOut() {
    // Launch the ball up and out
    ball.style.transition = reduceMotion ? "opacity 0.3s linear" : "top 0.7s cubic-bezier(0.2,0.7,0.3,1), left 0.7s linear, transform 0.7s ease-out, opacity 0.7s ease-in";
    requestAnimationFrame(() => {
      ball.style.top = "-20%";
      ball.style.left = (50 + (Math.random() * 30 - 15)) + "%";
      ball.style.transform = "translate(-50%, -50%) scale(0.4)";
      ball.style.opacity = "0";
    });
    setTimeout(() => { ball.style.display = "none"; ball.style.left = "50%"; }, 720);
  }

  function dropBall(hard) {
    ball.style.transition = "opacity 0.45s ease-in, transform 0.45s ease-in";
    requestAnimationFrame(() => {
      ball.style.transform = "translate(-50%, -50%) scale(" + (hard ? 0.8 : 0.6) + ")";
      ball.style.opacity = "0";
    });
    setTimeout(() => { ball.style.display = "none"; }, 460);
  }

  function showVerdict(word, sub, cls) {
    verdict.className = "verdict " + cls;
    verdict.innerHTML = word + (sub ? "<small>" + sub + "</small>" : "");
    void verdict.offsetWidth;
    verdict.classList.add("show");
    setTimeout(() => verdict.classList.remove("show"), 900);
  }

  function endGame() {
    playing = false;
    ball.style.display = "none";
    if (homers > best) {
      best = homers;
      localStorage.setItem(BEST_KEY, String(best));
      setText(elBest, best);
    }
    let title, msg;
    if (homers === 0) { title = "0 for 9."; msg = "The hammy's just warming up. Run it back."; }
    else if (homers <= 2) { title = homers + " dinger" + (homers === 1 ? "" : "s"); msg = "Gap power. We'll bat you seventh and love you for it."; }
    else if (homers <= 4) { title = homers + " dingers"; msg = "Solid pop. That plays in the North Hills."; }
    else if (homers <= 6) { title = homers + " dingers"; msg = "Now we're talking. Cleanup material."; }
    else if (homers <= 8) { title = homers + " dingers"; msg = "Are you sure you're 35? The Narwhals need to talk to you."; }
    else { title = "Perfect round — 9 for 9."; msg = "Stop reading and sign up. We're not kidding anymore."; }
    goTitle.textContent = title;
    goMsg.textContent = msg + " (Best: " + best + ")";
    hint.textContent = "";
    gameover.hidden = false;
    actionBtn.hidden = true;
    gameover.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }

  async function share() {
    const text = "I hit " + homers + " dinger" + (homers === 1 ? "" : "s") +
      " in the North Hills Narwhals Home Run Derby. Season 0 is forming — think you can beat me?";
    const url = location.origin + "/derby";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Narwhal Home Run Derby", text: text, url: url });
      } else {
        await navigator.clipboard.writeText(text + " " + url);
        shareBtn.textContent = "Copied!";
        setTimeout(() => (shareBtn.textContent = "Copy my line"), 1800);
      }
    } catch (e) { /* user dismissed share sheet */ }
  }

  init();
})();
