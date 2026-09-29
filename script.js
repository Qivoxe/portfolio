/* =========================================================
   SHIVAM ROY — DevOps & ML/AI Engineer
   Stranger Things "Upside Down" theme engine
   ========================================================= */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ─────────────────────────────────────────
     1. PRELOADER — counter + bar, then reveal
     ───────────────────────────────────────── */
  var loader = document.getElementById("loader");
  var loaderCount = document.getElementById("loaderCount");
  var loaderBar = document.getElementById("loaderBar");

  function finishLoading() {
    if (loader) loader.classList.add("is-done");
    document.querySelectorAll("[data-anim]").forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  if (loader && loaderCount && loaderBar && !prefersReducedMotion) {
    var progress = 0;
    var tick = setInterval(function () {
      // Ease toward 100 with slight randomness — feels like real boot
      progress += Math.random() * 12 + 4;
      if (progress >= 100) {
        progress = 100;
        clearInterval(tick);
        setTimeout(finishLoading, 350);
      }
      loaderCount.textContent = Math.floor(progress) + "%";
      loaderBar.style.width = progress + "%";
    }, 110);
    // Safety: never trap the user on the loader
    setTimeout(finishLoading, 4000);
  } else {
    finishLoading();
  }

  /* ─────────────────────────────────────────
     2. UPSIDE DOWN SPORE PARTICLES
     ───────────────────────────────────────── */
  var canvas = document.getElementById("sporeCanvas");
  if (canvas && !prefersReducedMotion) {
    var ctx = canvas.getContext("2d");
    var W, H;
    var spores = [];
    var COLORS = ["255,0,60", "0,212,255", "176,38,255", "57,255,20"];

    function sizeCanvas() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    sizeCanvas();
    window.addEventListener("resize", sizeCanvas);

    function makeSpore(anywhere) {
      return {
        x: Math.random() * W,
        y: anywhere ? Math.random() * H : H + 12,
        r: Math.random() * 2 + 0.5,
        vy: Math.random() * 0.45 + 0.12,
        drift: Math.random() * 1.2 + 0.4,
        phase: Math.random() * Math.PI * 2,
        alpha: Math.random() * 0.45 + 0.12,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      };
    }
    var COUNT = Math.min(90, Math.floor(window.innerWidth / 14));
    for (var i = 0; i < COUNT; i++) spores.push(makeSpore(true));

    var t = 0;
    (function drawSpores() {
      ctx.clearRect(0, 0, W, H);
      t += 0.008;
      for (var i = 0; i < spores.length; i++) {
        var s = spores[i];
        s.y -= s.vy;
        s.x += Math.sin(t * 2 + s.phase) * s.drift * 0.4;
        if (s.y < -14) spores[i] = makeSpore(false);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(" + s.color + "," + s.alpha + ")";
        ctx.shadowBlur = 9;
        ctx.shadowColor = "rgba(" + s.color + ",0.6)";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      requestAnimationFrame(drawSpores);
    })();
  }

  /* ─────────────────────────────────────────
     3. CUSTOM CURSOR — dot snaps, ring lerps
     ───────────────────────────────────────── */
  var dot = document.getElementById("cursorDot");
  var ring = document.getElementById("cursorRing");
  if (dot && ring && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !prefersReducedMotion) {
    var mx = -100, my = -100, rx = -100, ry = -100;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + (mx - 3) + "px," + (my - 3) + "px)";
    });
    (function loopRing() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = "translate(" + (rx - 17) + "px," + (ry - 17) + "px)";
      requestAnimationFrame(loopRing);
    })();
    document.querySelectorAll("a, button, .chip, .filter-btn, [data-tilt]").forEach(function (el) {
      el.addEventListener("mouseenter", function () { ring.classList.add("is-hover"); });
      el.addEventListener("mouseleave", function () { ring.classList.remove("is-hover"); });
    });
  }

  /* ─────────────────────────────────────────
     4. SCROLL PROGRESS + NAV STATE
     ───────────────────────────────────────── */
  var progressBar = document.getElementById("scrollProgress");
  var nav = document.getElementById("siteNav");
  function onScroll() {
    var st = window.scrollY || document.documentElement.scrollTop;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar && docH > 0) {
      progressBar.style.width = (st / docH) * 100 + "%";
    }
    if (nav) nav.classList.toggle("is-scrolled", st > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ─────────────────────────────────────────
     5. MOBILE MENU
     ───────────────────────────────────────── */
  var navToggle = document.getElementById("navToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove("is-open");
    if (navToggle) {
      navToggle.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
    document.body.style.overflow = "";
  }
  if (navToggle && mobileMenu) {
    navToggle.addEventListener("click", function () {
      var open = mobileMenu.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }

  /* ─────────────────────────────────────────
     6. MAGNETIC BUTTONS
     ───────────────────────────────────────── */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !prefersReducedMotion) {
    document.querySelectorAll("[data-magnetic]").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = "translate(" + x * 0.18 + "px," + y * 0.28 + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ─────────────────────────────────────────
     7. TILT CARDS (featured = strong, bento = soft)
     ───────────────────────────────────────── */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !prefersReducedMotion) {
    function bindTilt(selector, strength) {
      document.querySelectorAll(selector).forEach(function (card) {
        card.addEventListener("mousemove", function (e) {
          var rect = card.getBoundingClientRect();
          var px = (e.clientX - rect.left) / rect.width - 0.5;
          var py = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform =
            "perspective(900px) rotateY(" + px * strength + "deg) rotateX(" + (-py * strength) + "deg) translateY(-4px)";
        });
        card.addEventListener("mouseleave", function () {
          card.style.transform = "";
        });
      });
    }
    bindTilt("[data-tilt]", 6);
    bindTilt("[data-tilt-soft]", 3);
  }

  /* ─────────────────────────────────────────
     8. REVEAL ON SCROLL (.reveal + [data-anim])
     ───────────────────────────────────────── */
  var revealTargets = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ─────────────────────────────────────────
     9. PROJECT FILTERS
     ───────────────────────────────────────── */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var projectCards = document.querySelectorAll(".projects-grid .project-card");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterBtns.forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      var filter = btn.getAttribute("data-filter");
      projectCards.forEach(function (card) {
        var match = filter === "all" || (card.getAttribute("data-category") || "").indexOf(filter) !== -1;
        card.classList.toggle("is-hidden", !match);
      });
    });
  });

  /* ─────────────────────────────────────────
     10. STAT COUNTERS (GitHub numbers)
     ───────────────────────────────────────── */
  var statNums = document.querySelectorAll(".stat-card__num");
  if ("IntersectionObserver" in window && statNums.length) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.getAttribute("data-count"), 10) || 0;
        countObserver.unobserve(el);
        if (prefersReducedMotion) { el.textContent = target; return; }
        var start = null;
        var duration = 1600;
        function step(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });
    statNums.forEach(function (el) { countObserver.observe(el); });
  }

  /* ─────────────────────────────────────────
     11. MARQUEE — duplicate track for seamless loop
     ───────────────────────────────────────── */
  var marqueeTrack = document.getElementById("marqueeTrack");
  if (marqueeTrack) {
    marqueeTrack.innerHTML += marqueeTrack.innerHTML;
  }

  /* ─────────────────────────────────────────
     12. PROJECT CARD MOUSE GLOW (--mx / --my)
     ───────────────────────────────────────── */
  document.querySelectorAll(".project-card").forEach(function (card) {
    card.addEventListener("mousemove", function (e) {
      var rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - rect.left) + "px");
      card.style.setProperty("--my", (e.clientY - rect.top) + "px");
    });
  });

  /* ─────────────────────────────────────────
     13. SMOOTH ANCHOR SCROLL (closes mobile menu)
     ───────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = anchor.getAttribute("href");
      if (id.length > 1) {
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          closeMenu();
          target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
        }
      }
    });
  });

})();
