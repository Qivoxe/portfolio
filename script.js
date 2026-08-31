/* =====================================================
   SHIVAM KUMAR — PORTFOLIO
   Vanilla JavaScript
   ===================================================== */

const CONFIG = {
  githubUsername: 'Qivoxe',
};

const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

/* -----------------------------------------------------
   NAVIGATION
   ----------------------------------------------------- */
function initNavigation() {
  const nav = document.getElementById('siteNav');
  const toggle = document.getElementById('navToggle');
  const mobileNav = document.getElementById('navMobile');
  const navLinks = document.querySelectorAll('.nav__links a, .nav__mobile a');
  const sections = document.querySelectorAll('section[id]');

  // Scroll behavior: hide/show nav
  let lastScroll = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const currentScroll = window.scrollY;

        if (currentScroll > 80) {
          nav.classList.add('is-scrolled');
        } else {
          nav.classList.remove('is-scrolled');
        }

        // Hide on scroll down, show on scroll up (after initial scroll)
        if (currentScroll > 300) {
          if (currentScroll > lastScroll + 8) {
            nav.classList.add('is-hidden');
          } else if (currentScroll < lastScroll - 8) {
            nav.classList.remove('is-hidden');
          }
        } else {
          nav.classList.remove('is-hidden');
        }

        lastScroll = currentScroll;
        ticking = false;
      });
      ticking = true;
    }
  });

  // Mobile menu toggle
  toggle.addEventListener('click', () => {
    const isOpen = mobileNav.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile nav on link click
  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    });
  });

  // Active section highlighting
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
}

/* -----------------------------------------------------
   SCROLL REVEAL
   ----------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal');

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = (index % 8) * 60;
          setTimeout(() => el.classList.add('is-visible'), delay);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  items.forEach((el) => observer.observe(el));
}

/* -----------------------------------------------------
   GITHUB CONTRIBUTION GRAPH
   ----------------------------------------------------- */
async function initGithubActivity() {
  const graph = document.getElementById('contribGraph');
  const stats = document.getElementById('contribStats');

  if (!graph) return;

  try {
    const res = await fetch(`https://api.github.com/users/${CONFIG.githubUsername}/events/public?per_page=100`);
    if (!res.ok) throw new Error('GitHub API error');

    const events = await res.json();
    const contributionData = {};

    events.forEach((event) => {
      if (event.type === 'PushEvent') {
        const date = event.created_at.split('T')[0];
        contributionData[date] = (contributionData[date] || 0) + (event.payload?.commits?.length || 1);
      }
    });

    const days = Object.values(contributionData);
    const totalContributions = days.reduce((sum, count) => sum + count, 0);

    // Generate ~365 days of contribution squares
    const squares = [];
    const today = new Date();
    const maxVal = Math.max(...days, 1);

    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = contributionData[dateStr] || 0;

      let level = 0;
      if (count > 0) {
        if (count <= 2) level = 1;
        else if (count <= 5) level = 2;
        else if (count <= 10) level = 3;
        else level = 4;
      }

      squares.push(`<div class="contrib-day" data-level="${level}" title="${dateStr}: ${count} contributions" aria-label="${count} contributions on ${dateStr}"></div>`);
    }

    graph.innerHTML = squares.join('');
    stats.textContent = `${totalContributions} contributions in the last year`;

  } catch (err) {
    // Fallback: generate a decorative contribution grid
    const squares = [];
    for (let i = 0; i < 365; i++) {
      const level = Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 1 : 0;
      squares.push(`<div class="contrib-day" data-level="${level}" aria-hidden="true"></div>`);
    }
    graph.innerHTML = squares.join('');
    stats.textContent = `View contributions on GitHub ↗`;
    stats.style.cursor = 'pointer';
    stats.addEventListener('click', () => {
      window.open(`https://github.com/${CONFIG.githubUsername}`, '_blank');
    });
  }
}

/* -----------------------------------------------------
   LOCAL TIME
   ----------------------------------------------------- */
function initLocalTime() {
  const el = document.getElementById('localTime');
  if (!el) return;

  function update() {
    const now = new Date();
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    const time = new Intl.DateTimeFormat('en-GB', options).format(now);
    el.textContent = `India • ${time} IST`;
  }

  update();
  setInterval(update, 1000);
}

/* -----------------------------------------------------
   SMOOTH SCROLL FOR ANCHOR LINKS
   ----------------------------------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navHeight = 80;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      }
    });
  });
}

/* -----------------------------------------------------
   INIT
   ----------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollReveal();
  initGithubActivity();
  initLocalTime();
  initSmoothScroll();
  initMansi();
});

/* -----------------------------------------------------
   MANSI — CURSOR CHASING CAT
   ----------------------------------------------------- */
function initMansi() {
  if (prefersReducedMotion) return;

  const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (isTouchDevice) return;

  const mansi = document.getElementById('mansi');
  if (!mansi) return;

  const flipper = mansi.querySelector('.mansi__flipper');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let catX = mouseX - 20;
  let catY = mouseY + 15;
  let velocityX = 0;
  let velocityY = 0;
  let lastMouseMove = 0;
  let isRunning = false;
  let isIdle = false;

  const LERP = 0.08;
  const OFFSET_X = 20;
  const OFFSET_Y = 15;
  const IDLE_DELAY = 300;
  const SNAP_DISTANCE = 1.5;
  const DIRECTION_THRESHOLD = 2;
  const MAX_SPEED = 18;
  const ACCELERATION = 0.35;
  const FRICTION = 0.85;

  mansi.style.transform = `translate(${catX}px, ${catY}px)`;

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    lastMouseMove = performance.now();

    if (isIdle || !isRunning) {
      isRunning = true;
      isIdle = false;
      mansi.classList.add('is-running');
      mansi.classList.remove('is-idle');
    }
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });

  window.addEventListener('touchstart', () => {
    mansi.style.display = 'none';
  }, { once: true });

  window.addEventListener('mouseleave', () => {
    isRunning = false;
    mansi.classList.remove('is-running');
  });

  window.addEventListener('mouseenter', () => {
    if (performance.now() - lastMouseMove < 1000) {
      isRunning = true;
      mansi.classList.add('is-running');
      mansi.classList.remove('is-idle');
    }
  });

  function animate() {
    const targetX = mouseX - OFFSET_X;
    const targetY = mouseY + OFFSET_Y;

    const dx = targetX - catX;
    const dy = targetY - catY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > DIRECTION_THRESHOLD) {
      const ax = dx * ACCELERATION;
      const ay = dy * ACCELERATION;

      velocityX += ax;
      velocityY += ay;

      const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      if (speed > MAX_SPEED) {
        velocityX = (velocityX / speed) * MAX_SPEED;
        velocityY = (velocityY / speed) * MAX_SPEED;
      }

      catX += velocityX;
      catY += velocityY;

      velocityX *= FRICTION;
      velocityY *= FRICTION;

      const facingRight = dx > 0;
      flipper.style.transform = `scaleX(${facingRight ? 1 : -1})`;
    } else {
      velocityX *= 0.5;
      velocityY *= 0.5;
      catX += velocityX;
      catY += velocityY;

      if (Math.abs(velocityX) < 0.1 && Math.abs(velocityY) < 0.1) {
        velocityX = 0;
        velocityY = 0;
      }
    }

    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);

    if (isRunning && speed < 0.3 && distance < SNAP_DISTANCE) {
      isRunning = false;
      isIdle = true;
      mansi.classList.remove('is-running');
      mansi.classList.add('is-idle');
    }

    if (!isRunning && performance.now() - lastMouseMove > IDLE_DELAY) {
      const remainingX = Math.abs(targetX - catX);
      const remainingY = Math.abs(targetY - catY);
      if (remainingX < SNAP_DISTANCE && remainingY < SNAP_DISTANCE) {
        isIdle = true;
        mansi.classList.add('is-idle');
      }
    }

    mansi.style.transform = `translate(${catX}px, ${catY}px)`;
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
