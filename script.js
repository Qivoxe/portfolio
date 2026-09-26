/* =====================================================
   SHIVAM ROY — PORTFOLIO 2026
   Vanilla JS — theme, motion, interactions
   ===================================================== */

const CONFIG = {
  githubUsername: 'Qivoxe',

  /* -------------------------------------------------
     TODO(Contra): paste your Contra profile URL between
     the quotes, e.g. 'https://contra.com/shivamroy'.
     Every Contra button/link on the page will then
     point there automatically.
     ------------------------------------------------- */
  contraUrl: '',
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

/* -----------------------------------------------------
   THEME TOGGLE (light / dark)
   ----------------------------------------------------- */
function initTheme() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
}

/* -----------------------------------------------------
   PRELOADER
   ----------------------------------------------------- */
function initLoader() {
  const loader = document.getElementById('loader');
  const count = document.getElementById('loaderCount');

  if (prefersReducedMotion) {
    loader.classList.add('done');
    document.body.classList.add('loaded');
    return;
  }

  // fallback: never leave the hero hidden if the loader is interrupted
  setTimeout(() => document.body.classList.add('loaded'), 3500);

  let n = 0;
  const tick = setInterval(() => {
    n += Math.floor(Math.random() * 12) + 4;
    if (n >= 100) n = 100;
    count.textContent = n;
    if (n === 100) {
      clearInterval(tick);
      setTimeout(() => {
        loader.classList.add('done');
        document.body.classList.add('loaded'); // triggers hero entrance
        setTimeout(() => loader.remove(), 900);
      }, 250);
    }
  }, 60);
}

/* -----------------------------------------------------
   CUSTOM CURSOR (dot + trailing ring)
   ----------------------------------------------------- */
function initCursor() {
  if (prefersReducedMotion || isTouch) return;

  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;

  let mx = -100, my = -100, rx = -100, ry = -100;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  }, { passive: true });

  (function animate() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(animate);
  })();

  const hoverTargets = 'a, button, [data-tilt], [data-tilt-soft], .chip, .tag';
  document.querySelectorAll(hoverTargets).forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
  });
}

/* -----------------------------------------------------
   SCROLL PROGRESS BAR
   ----------------------------------------------------- */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgress');
  if (!bar) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.width = `${max > 0 ? (h.scrollTop / max) * 100 : 0}%`;
      ticking = false;
    });
  }, { passive: true });
}

/* -----------------------------------------------------
   NAVIGATION (hide on scroll, mobile menu, active link)
   ----------------------------------------------------- */
function initNavigation() {
  const nav = document.getElementById('siteNav');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  const links = document.querySelectorAll('.nav__menu a');
  const sections = document.querySelectorAll('section[id]');

  let lastScroll = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      nav.classList.toggle('is-scrolled', y > 40);
      if (y > 400 && y > lastScroll + 6) nav.classList.add('is-hidden');
      else if (y < lastScroll - 6 || y < 400) nav.classList.remove('is-hidden');
      lastScroll = y;
      ticking = false;
    });
  }, { passive: true });

  // Mobile menu
  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
  });

  // Active section highlight
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === `#${id}`));
    });
  }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });

  sections.forEach((s) => observer.observe(s));
}

/* -----------------------------------------------------
   MARQUEE — duplicate track content for a seamless loop
   ----------------------------------------------------- */
function initMarquee() {
  const track = document.getElementById('marqueeTrack');
  if (!track) return;
  track.innerHTML += track.innerHTML; // second copy → translateX(-50%) loops perfectly
}

/* -----------------------------------------------------
   SCROLL REVEAL
   ----------------------------------------------------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });
  items.forEach((el) => observer.observe(el));
}

/* -----------------------------------------------------
   3D TILT (cards) — subtle, physics-y
   ----------------------------------------------------- */
function initTilt() {
  if (prefersReducedMotion || isTouch) return;

  document.querySelectorAll('[data-tilt]').forEach((card) => {
    const strength = 7;
    card.style.transition = 'transform 0.18s ease-out, border-color 0.35s ease, box-shadow 0.35s ease';

    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform =
        `perspective(900px) rotateX(${(-py * strength).toFixed(2)}deg) rotateY(${(px * strength).toFixed(2)}deg) translateY(-3px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  // softer tilt for smaller cards
  document.querySelectorAll('[data-tilt-soft]').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateY(-3px) rotateX(${(-py * 2.5).toFixed(2)}deg) rotateY(${(px * 2.5).toFixed(2)}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* -----------------------------------------------------
   MAGNETIC BUTTONS
   ----------------------------------------------------- */
function initMagnetic() {
  if (prefersReducedMotion || isTouch) return;

  document.querySelectorAll('[data-magnetic]').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${(x * 0.18).toFixed(1)}px, ${(y * 0.28).toFixed(1)}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* -----------------------------------------------------
   HERO PARALLAX (portrait follows cursor gently)
   ----------------------------------------------------- */
function initHeroParallax() {
  if (prefersReducedMotion || isTouch) return;
  const wrap = document.getElementById('heroImg');
  if (!wrap) return;

  const hero = document.querySelector('.hero');
  hero.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    wrap.style.transform = `rotateY(${(px * 6).toFixed(2)}deg) rotateX(${(-py * 6).toFixed(2)}deg)`;
  });
  hero.addEventListener('mouseleave', () => { wrap.style.transform = ''; });
}

/* -----------------------------------------------------
   PROJECT FILTERS
   ----------------------------------------------------- */
function initFilters() {
  const bar = document.querySelector('.filter-bar');
  if (!bar) return;
  const buttons = bar.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('#projects .project-card, #projects .project-featured');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      const filter = btn.dataset.filter;
      cards.forEach((card) => {
        const cats = (card.dataset.category || '').split(' ');
        card.classList.toggle('is-hidden', !(filter === 'all' || cats.includes(filter)));
      });
    });
  });
}

/* -----------------------------------------------------
   CONTRA LINKS
   ----------------------------------------------------- */
function initContraLinks() {
  const url = (CONFIG.contraUrl || '').trim();
  if (!url) return; // placeholders stay inert with an explanatory tooltip
  document.querySelectorAll('.js-contra-link').forEach((link) => {
    link.href = url;
    link.removeAttribute('title');
  });
}

/* -----------------------------------------------------
   GITHUB CONTRIBUTION GRAPH
   ----------------------------------------------------- */
async function initGithub() {
  const graph = document.getElementById('contribGraph');
  const stats = document.getElementById('contribStats');
  if (!graph) return;

  try {
    const res = await fetch(`https://api.github.com/users/${CONFIG.githubUsername}/events/public?per_page=100`);
    if (!res.ok) throw new Error('GitHub API error');
    const events = await res.json();
    const data = {};

    events.forEach((event) => {
      if (event.type === 'PushEvent') {
        const date = event.created_at.split('T')[0];
        data[date] = (data[date] || 0) + (event.payload?.commits?.length || 1);
      }
    });

    const total = Object.values(data).reduce((s, n) => s + n, 0);
    const squares = [];
    const today = new Date();

    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const count = data[key] || 0;
      let level = 0;
      if (count > 0) level = count <= 2 ? 1 : count <= 5 ? 2 : count <= 10 ? 3 : 4;
      squares.push(`<div class="contrib-day" data-level="${level}" title="${key}: ${count} contributions"></div>`);
    }

    graph.innerHTML = squares.join('');
    stats.textContent = `${total} contributions in the last year (via public events)`;
  } catch (err) {
    const squares = [];
    for (let i = 0; i < 365; i++) {
      const level = Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0;
      squares.push(`<div class="contrib-day" data-level="${level}" aria-hidden="true"></div>`);
    }
    graph.innerHTML = squares.join('');
    stats.textContent = 'View activity on GitHub ↗';
    stats.style.cursor = 'pointer';
    stats.addEventListener('click', () => window.open(`https://github.com/${CONFIG.githubUsername}`, '_blank'));
  }
}

/* -----------------------------------------------------
   LOCAL TIME + YEAR
   ----------------------------------------------------- */
function initClock() {
  const el = document.getElementById('localTime');
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  if (!el) return;

  const update = () => {
    el.textContent = 'India · ' + new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    }).format(new Date()) + ' IST';
  };
  update();
  setInterval(update, 1000);
}

/* -----------------------------------------------------
   INIT
   ----------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLoader();
  initCursor();
  initScrollProgress();
  initNavigation();
  initMarquee();
  initReveal();
  initTilt();
  initMagnetic();
  initHeroParallax();
  initFilters();
  initContraLinks();
  initGithub();
  initClock();
});
