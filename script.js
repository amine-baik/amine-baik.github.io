'use strict';

// ── PARTICLES ─────────────────────────────────────────────────
const canvas = document.getElementById('bg-canvas');
const ctx    = canvas.getContext('2d');
let W, H, particles = [], rafId, lastFrame = 0;
const COLORS   = ['#1d4ed8', '#0369a1', '#3b82f6'];
const FPS_CAP  = 40;
const FRAME_MS = 1000 / FPS_CAP;

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}

function makeParticle() {
  return {
    x:     Math.random() * W,
    y:     Math.random() * H,
    r:     Math.random() * 1.4 + 0.4,
    vx:    (Math.random() - 0.5) * 0.18,
    vy:    (Math.random() - 0.5) * 0.18,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: Math.random() * 0.12 + 0.03,
  };
}

function drawFrame(ts) {
  rafId = requestAnimationFrame(drawFrame);
  if (ts - lastFrame < FRAME_MS) return;
  lastFrame = ts;
  ctx.clearRect(0, 0, W, H);

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(29,78,216,${0.025 * (1 - dist / 100)})`;
        ctx.lineWidth   = 0.5;
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
      }
    }
  }

  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color + Math.round(p.alpha * 255).toString(16).padStart(2, '0');
    ctx.fill();
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(rafId); } else { rafId = requestAnimationFrame(drawFrame); }
});

window.addEventListener('resize', resize);
resize();
particles = Array.from({ length: 70 }, makeParticle);
rafId = requestAnimationFrame(drawFrame);

// ── MOBILE NAV ────────────────────────────────────────────────
const navToggle = document.getElementById('nav-toggle');
const navMenu   = document.getElementById('nav-menu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
  navMenu.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ── LANGUAGE SYSTEM ───────────────────────────────────────────
function setLang(lang) {
  if (!['fr', 'en'].includes(lang)) return;
  try { localStorage.setItem('lang', lang); } catch (_) {}

  const htmlRoot = document.getElementById('html-root');
  if (htmlRoot) htmlRoot.setAttribute('lang', lang);

  const btnFr = document.getElementById('btn-fr');
  const btnEn = document.getElementById('btn-en');
  if (btnFr) btnFr.classList.toggle('active', lang === 'fr');
  if (btnEn) btnEn.classList.toggle('active', lang === 'en');

  document.querySelectorAll('[data-fr][data-en]').forEach(el => {
    const txt = el.getAttribute(`data-${lang}`);
    if (!txt) return;
    const hasElementChild = Array.from(el.childNodes).some(n => n.nodeType === Node.ELEMENT_NODE);
    if (!hasElementChild) el.textContent = txt;
  });

  const heroTitle = document.getElementById('hero-title');
  if (heroTitle) {
    heroTitle.innerHTML = lang === 'fr'
      ? 'Bonjour, je suis <span class="grad">Amine Baik</span>'
      : 'Hi, I\'m <span class="grad">Amine Baik</span>';
  }

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', lang === 'fr'
      ? 'Amine Baik — Développeur Python & Web. Scraping, automatisation, bases de données, développement web. Disponible en freelance.'
      : 'Amine Baik — Python & Web Developer. Scraping, automation, databases, web development. Available for freelance.');
  }
}

// ── INIT ──────────────────────────────────────────────────────
window.addEventListener('load', () => {
  let lang = 'en';
  try {
    const saved = localStorage.getItem('lang');
    if (saved && ['fr', 'en'].includes(saved)) lang = saved;
  } catch (_) {}
  setLang(lang);
});

// ── SCROLL REVEAL ─────────────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.07 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── SMOOTH SCROLL ─────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
  });
});

// ── CARD GLOW — desktop uniquement ───────────────────────────
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll(
    '.skill-card, .project-card, .exp-card, .hobby-card, .ref-card'
  ).forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  * 100).toFixed(1);
      const y = ((e.clientY - r.top)  / r.height * 100).toFixed(1);
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, #f0f6ff, #ffffff)`;
    });
    card.addEventListener('mouseleave', () => { card.style.background = ''; });
  });
}