// =========================================================
// YEAR
// =========================================================
document.getElementById('year').textContent = new Date().getFullYear();

// =========================================================
// NAV — shrink on scroll
// =========================================================
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// =========================================================
// SCROLL REVEAL
// =========================================================
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('in-view'), i * 60);
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => io.observe(el));

// =========================================================
// TEXT SCRAMBLE — hero name resolves from symbols on load
// =========================================================
class Scramble {
  constructor(el) {
    this.el = el;
    this.chars = '∑∫∂λμσπ√∞Δ01#%&+×÷';
  }
  setText(newText) {
    const oldText = this.el.textContent;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise(resolve => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 20);
      const end = start + Math.floor(Math.random() * 20) + 10;
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span class="scramble-char">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(() => { this.frame++; this.update(); });
    }
  }
}

const scrambleTarget = document.querySelector('.scramble');
if (scrambleTarget) {
  const fx = new Scramble(scrambleTarget);
  const finalText = scrambleTarget.dataset.text || scrambleTarget.textContent;
  window.addEventListener('load', () => {
    setTimeout(() => fx.setText(finalText), 300);
  });
}

// =========================================================
// HERO CANVAS — layered sine signal, drifts + reacts to cursor
// =========================================================
const canvas = document.getElementById('signal');
const ctx = canvas.getContext('2d');
let width, height, dpr;
let mouseX = 0.5;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = canvas.offsetWidth;
  height = canvas.offsetHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
window.addEventListener('resize', resize);

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX / window.innerWidth;
}, { passive: true });

const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
const accent2 = getComputedStyle(document.documentElement).getPropertyValue('--accent-2').trim();

let t = 0;
const tickEl = document.getElementById('tick');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function drawWave(offsetY, amp, freq, speed, color, alpha, lineWidth) {
  ctx.beginPath();
  const points = 140;
  for (let i = 0; i <= points; i++) {
    const x = (i / points) * width;
    const nx = i / points;
    const wobble = Math.sin(nx * freq + t * speed) * amp
                 + Math.sin(nx * freq * 2.3 + t * speed * 1.4) * amp * 0.35;
    const parallax = (mouseX - 0.5) * 24 * Math.sin(nx * Math.PI);
    const y = offsetY + wobble + parallax;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  const baseline = height * 0.62;

  drawWave(baseline, height * 0.05, 4.2, 0.35, accent2, 0.18, 1);
  drawWave(baseline, height * 0.09, 3.1, 0.5, accent, 0.35, 1.4);
  drawWave(baseline, height * 0.14, 2.2, 0.22, accent, 0.9, 2);

  t += reduceMotion ? 0 : 0.012;
  if (tickEl) tickEl.textContent = `t = ${t.toFixed(3)}`;

  requestAnimationFrame(animate);
}
animate();

// =========================================================
// SMOOTH ANCHOR SCROLL (accounts for fixed nav height)
// =========================================================
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY - 60;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});