/* =====================================================
   SHIVAM ROY — PORTFOLIO
   Vanilla JavaScript
   ===================================================== */

/* -----------------------------------------------------
   CONFIG — edit these to update links/content quickly
   ----------------------------------------------------- */
const CONFIG = {
  projectUrls: [
    "#", // 01 PlanetX — replace with GitHub/demo URL
    "#", // 02 Market-Making Simulator
    "#", // 03 Causal Inference Engine
    "#", // 04 ProofMesh
    "#", // 05 Snipify
  ],
  noteUrls: [
    "#", // 01 Why Market Microstructure Matters
    "#", // 02 Mathematics Behind Gradient Descent
    "#", // 03 Designing Reliable AI Systems
  ],
  cvPath: "assets/cv/shivam-roy-cv.pdf",
  introReplaySessionKey: "sr_intro_seen",
};

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

/* -----------------------------------------------------
   BOOT SEQUENCE
   ----------------------------------------------------- */
function runBootSequence() {
  const boot = document.getElementById("boot");
  const frames = Array.from(document.querySelectorAll("[data-frame]"));
  const skipBtn = document.getElementById("skipIntro");
  const enterBtn = document.getElementById("enterBtn");

  const alreadySeen = sessionStorage.getItem(CONFIG.introReplaySessionKey);

  // Timing for each frame (ms). Shortened automatically on repeat visits.
  const fullSchedule = [0, 550, 1250, 2350, 3100];
  const shortSchedule = [0, 250, 550, 900, 1250];
  const schedule = alreadySeen && !prefersReducedMotion ? shortSchedule : fullSchedule;

  let timers = [];

  function showFrame(index) {
    frames.forEach((f) => f.classList.remove("is-visible"));
    if (frames[index]) frames[index].classList.add("is-visible");
  }

  function playSchedule() {
    schedule.forEach((delay, i) => {
      const t = setTimeout(() => showFrame(i), delay);
      timers.push(t);
    });
  }

  function clearTimers() {
    timers.forEach((t) => clearTimeout(t));
    timers = [];
  }

  function goToFinalFrame() {
    clearTimers();
    showFrame(frames.length - 1);
  }

  if (prefersReducedMotion) {
    // Respect reduced motion: skip straight to the final frame, no animated fragments.
    goToFinalFrame();
  } else {
    playSchedule();
  }

  skipBtn.addEventListener("click", goToFinalFrame);

  enterBtn.addEventListener("click", () => {
    clearTimers();
    enterPortfolio(boot);
  });

  // Allow Enter/Space to trigger when the button is focused, and Escape to skip.
  document.addEventListener("keydown", (e) => {
    if (boot.classList.contains("is-leaving")) return;
    if (e.key === "Escape") goToFinalFrame();
  });

  sessionStorage.setItem(CONFIG.introReplaySessionKey, "1");
}

function enterPortfolio(boot) {
  const site = document.getElementById("site");

  boot.classList.add("is-leaving");
  site.hidden = false;
  document.body.style.overflow = "";

  const finish = () => {
    boot.style.display = "none";
  };

  if (prefersReducedMotion) {
    finish();
  } else {
    boot.addEventListener("transitionend", finish, { once: true });
    // Fallback in case transitionend doesn't fire
    setTimeout(finish, 900);
  }

  initScrollReveal(); // re-check reveal state now that layout is visible
}

function initReplayIntro() {
  const replayBtn = document.getElementById("replayIntro");
  const boot = document.getElementById("boot");
  const site = document.getElementById("site");
  const frames = Array.from(document.querySelectorAll("[data-frame]"));

  replayBtn.addEventListener("click", () => {
    sessionStorage.removeItem(CONFIG.introReplaySessionKey);
    frames.forEach((f) => f.classList.remove("is-visible"));
    boot.style.display = "flex";
    boot.classList.remove("is-leaving");
    // force reflow so the transition plays again
    void boot.offsetWidth;
    site.hidden = true;
    window.scrollTo({ top: 0, behavior: "auto" });
    runBootSequence();
  });
}

/* -----------------------------------------------------
   NAVIGATION
   ----------------------------------------------------- */
function initNavigation() {
  const nav = document.getElementById("siteNav");
  const toggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("navMobile");

  window.addEventListener("scroll", () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 8);
  });

  toggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* -----------------------------------------------------
   SCROLL REVEAL
   ----------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = (i % 6) * 60; // subtle stagger within a batch
          setTimeout(() => el.classList.add("is-visible"), delay);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el) => observer.observe(el));
}

/* -----------------------------------------------------
   CUSTOM CURSOR
   ----------------------------------------------------- */
function initCursor() {
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  if (isTouch) return;

  document.body.classList.add("has-cursor");
  const dot = document.getElementById("cursorDot");

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;

  window.addEventListener("mousemove", (e) => {
    x = e.clientX;
    y = e.clientY;
    dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  });

  const interactiveSelector = "a, button, .research-row, .project-row__link";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(interactiveSelector)) dot.classList.add("is-active");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(interactiveSelector)) dot.classList.remove("is-active");
  });
}

/* -----------------------------------------------------
   HERO VISUALIZATION — subtle mathematical grid/vectors
   ----------------------------------------------------- */
function initHeroVisualization() {
  const canvas = document.getElementById("heroCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width, height, dpr;
  let mouseX = 0.5;
  let mouseY = 0.5;
  let targetX = 0.5;
  let targetY = 0.5;

  const points = [];
  const NUM_POINTS = window.innerWidth < 640 ? 10 : 16;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.parentElement.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seedPoints() {
    points.length = 0;
    for (let i = 0; i < NUM_POINTS; i++) {
      points.push({
        x: Math.random(),
        y: Math.random(),
        r: 1 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function drawAxes() {
    const originX = width * 0.12;
    const originY = height * 0.88;

    ctx.strokeStyle = "rgba(138,138,138,0.35)";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(width * 0.94, originY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(originX, height * 0.08);
    ctx.stroke();

    return { originX, originY };
  }

  function drawOptimizationPath(originX, originY, t) {
    // A gently animating "gradient descent" style path, biased by mouse position.
    const steps = 7;
    const spanX = width * 0.72;
    const spanY = height * 0.62;

    ctx.beginPath();
    ctx.strokeStyle = "rgba(200,255,77,0.55)";
    ctx.lineWidth = 1.2;

    let prevX, prevY;
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const decay = Math.pow(1 - progress, 1.6);
      const wobble = Math.sin(t * 0.0007 + i) * 6 * decay;

      const px =
        originX +
        progress * spanX * (0.4 + 0.6 * mouseX) +
        wobble;
      const py =
        originY -
        (1 - decay) * spanY * (0.5 + 0.5 * mouseY) +
        Math.cos(t * 0.0006 + i) * 4 * decay;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
      prevX = px;
      prevY = py;

      if (i === steps) {
        ctx.fillStyle = "rgba(200,255,77,0.9)";
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.stroke();
  }

  function drawPoints(t) {
    ctx.fillStyle = "rgba(242,242,240,0.5)";
    points.forEach((p) => {
      const drift = Math.sin(t * 0.0004 + p.phase) * 3;
      const px = p.x * width + drift + (mouseX - 0.5) * 10;
      const py = p.y * height + Math.cos(t * 0.0003 + p.phase) * 3 + (mouseY - 0.5) * 10;

      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function frame(t) {
    ctx.clearRect(0, 0, width, height);

    mouseX += (targetX - mouseX) * 0.05;
    mouseY += (targetY - mouseY) * 0.05;

    const { originX, originY } = drawAxes();
    drawPoints(t);
    drawOptimizationPath(originX, originY, t);

    if (!prefersReducedMotion) {
      requestAnimationFrame(frame);
    }
  }

  function onMouseMove(e) {
    const rect = canvas.parentElement.getBoundingClientRect();
    targetX = (e.clientX - rect.left) / rect.width;
    targetY = (e.clientY - rect.top) / rect.height;
  }

  resize();
  seedPoints();
  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", onMouseMove);

  if (prefersReducedMotion) {
    frame(0); // draw once, static
  } else {
    requestAnimationFrame(frame);
  }
}

/* -----------------------------------------------------
   PROJECT / NOTE INTERACTIONS
   ----------------------------------------------------- */
function initProjectInteractions() {
  const projectLinks = document.querySelectorAll("[data-project-url]");
  projectLinks.forEach((link, i) => {
    const url = CONFIG.projectUrls[i] || "#";
    link.setAttribute("href", url);
    if (url !== "#") {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener");
    }
  });

  const noteLinks = document.querySelectorAll("[data-note-url]");
  noteLinks.forEach((link, i) => {
    const url = CONFIG.noteUrls[i] || "#";
    link.setAttribute("href", url);
    if (url !== "#") {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener");
    }
  });
}

/* -----------------------------------------------------
   INIT
   ----------------------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  runBootSequence();
  initReplayIntro();
  initNavigation();
  initScrollReveal();
  initCursor();
  initHeroVisualization();
  initProjectInteractions();
});