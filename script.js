// ===== Intro: cinematic ball drop, bounce & burst (canvas) =====
(function () {
  const intro = document.getElementById('intro');
  const canvas = intro && intro.querySelector('#introCanvas');
  if (!intro || !canvas) { if (intro) intro.remove(); return; }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { intro.remove(); return; }
  const ctx = canvas.getContext('2d');
  if (!ctx) { intro.remove(); return; }

  document.body.classList.add('intro-lock');

  const ACCENT = '#38e8c5', ACCENT2 = '#6c8cff';
  const R = 24, G = 2400, REST = 0.62;

  let W = 0, H = 0, DPR = 1;
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth || window.innerWidth;
    H = canvas.clientHeight || window.innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  let phase = 'drop', bounces = 0, done = false;
  let ball = { x: W / 2, y: -60, vy: 0, squash: 0 };
  let particles = [], rings = [];
  let flash = 0, shake = 0, burstAt = 0, raf = 0;
  let last = performance.now();

  function ring(x, y, o) { rings.push({ x, y, r: o.r0 || 6, vr: o.vr, life: 1, decay: o.decay, w: o.w, color: o.color }); }

  function explode(x, y) {
    phase = 'burst'; flash = 1; shake = 18; burstAt = performance.now();
    ring(x, y, { vr: 1150, decay: 1.5, w: 4, color: ACCENT });
    ring(x, y, { vr: 760, decay: 2.1, w: 2, color: ACCENT2 });
    for (let i = 0; i < 120; i++) {
      const a = Math.random() * Math.PI * 2, s = 120 + Math.random() * 640;
      particles.push({
        x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 140,
        g: 900 + Math.random() * 600, drag: 0.9 + Math.random() * 0.05,
        r: 1.5 + Math.random() * 3.5, life: 1, decay: 0.5 + Math.random() * 0.7,
        color: Math.random() < 0.5 ? ACCENT : (Math.random() < 0.7 ? ACCENT2 : '#ffffff')
      });
    }
  }

  function drawBall(x, y, sq) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, R * 2.4);
    g.addColorStop(0, 'rgba(56,232,197,0.30)');
    g.addColorStop(0.5, 'rgba(108,140,255,0.07)');
    g.addColorStop(1, 'rgba(108,140,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, R * 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.save();
    ctx.translate(x, y); ctx.scale(1 + sq * 0.3, 1 - sq * 0.35);
    const b = ctx.createRadialGradient(-R * 0.3, -R * 0.3, 0, 0, 0, R);
    b.addColorStop(0, '#cdf7ee'); b.addColorStop(0.5, ACCENT); b.addColorStop(1, ACCENT2);
    ctx.fillStyle = b;
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  let revealed = false;
  function reveal() {
    if (revealed) return; revealed = true;
    intro.classList.add('done');                  // overlay starts fading
    document.body.classList.remove('intro-lock');
    document.body.classList.add('intro-done');     // content staggers in
    setTimeout(teardown, 750);                     // particles keep flying through the fade
  }
  function teardown() {
    if (done) return; done = true;
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', resize);
    intro.remove();
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.032, (now - last) / 1000); last = now;
    try {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(10,11,16,0.42)';
      ctx.fillRect(0, 0, W, H);

      let sx = 0, sy = 0;
      if (shake > 0.3) { sx = (Math.random() - 0.5) * shake; sy = (Math.random() - 0.5) * shake; shake *= 0.85; }
      ctx.save();
      ctx.translate(sx, sy);
      ctx.globalCompositeOperation = 'lighter';

      const gy = H * 0.64;
      if (phase === 'drop') {
        ball.x = W / 2; ball.vy += G * dt; ball.y += ball.vy * dt;
        if (ball.y + R >= gy) {
          ball.y = gy - R;
          if (ball.vy > 220) {
            ball.vy = -ball.vy * REST; bounces++; ball.squash = 1;
            ring(ball.x, gy + R * 0.2, { vr: 460, decay: 3.2, w: 2, color: ACCENT, r0: R * 0.6 });
            for (let i = 0; i < 7; i++) {
              const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, s = 90 + Math.random() * 180;
              particles.push({ x: ball.x, y: gy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 1300, drag: 0.92, r: 1 + Math.random() * 2, life: 1, decay: 1.7, color: ACCENT });
            }
          } else { ball.vy = 0; }
          if (bounces >= 3 && Math.abs(ball.vy) < 280) explode(ball.x, gy - R);
        }
        ball.squash *= 0.84;
        drawBall(ball.x, ball.y, ball.squash);
      }

      for (const p of particles) {
        p.vy += p.g * dt; const f = Math.pow(p.drag, dt * 60); p.vx *= f; p.vy *= f;
        p.x += p.vx * dt; p.y += p.vy * dt; p.life -= p.decay * dt;
        if (p.life > 0) {
          ctx.globalAlpha = p.life; ctx.fillStyle = p.color;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.4 + p.life * 0.6), 0, Math.PI * 2); ctx.fill();
        }
      }
      particles = particles.filter(p => p.life > 0);
      ctx.globalAlpha = 1;

      for (const rg of rings) {
        rg.r += rg.vr * dt; rg.life -= rg.decay * dt;
        if (rg.life > 0) {
          ctx.globalAlpha = rg.life; ctx.strokeStyle = rg.color; ctx.lineWidth = rg.w;
          ctx.beginPath(); ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI * 2); ctx.stroke();
        }
      }
      rings = rings.filter(rg => rg.life > 0);
      ctx.globalAlpha = 1;

      if (flash > 0.02) {
        ctx.globalAlpha = flash * 0.5; ctx.fillStyle = '#bdfff2';
        ctx.fillRect(-60, -60, W + 120, H + 120); ctx.globalAlpha = 1; flash *= 0.78;
      }

      ctx.restore();

      if (phase === 'burst' && now - burstAt > 380) reveal();
    } catch (e) { reveal(); }
  }

  setTimeout(reveal, 5000); // hard safety
  raf = requestAnimationFrame((t) => { last = t; frame(t); });
})();

// ===== Language toggle (EN <-> AR with RTL) =====
const html = document.documentElement;
const langToggle = document.getElementById('langToggle');
const langLabel = langToggle.querySelector('[data-lang-label]');

function applyLanguage(lang) {
  const isAr = lang === 'ar';
  html.lang = lang;
  html.dir = isAr ? 'rtl' : 'ltr';
  langLabel.textContent = isAr ? 'EN' : 'عربي';
  langLabel.dataset.langLabel = lang;

  document.querySelectorAll('[data-en]').forEach((el) => {
    const next = el.getAttribute(isAr ? 'data-ar' : 'data-en');
    if (next == null) return;
    if ('content' in el && el.tagName === 'META') {
      el.setAttribute('content', next);
    } else {
      el.textContent = next;
    }
  });

  localStorage.setItem('lang', lang);
}

langToggle.addEventListener('click', () => {
  applyLanguage(html.lang === 'ar' ? 'en' : 'ar');
});

// Restore saved language (default: English)
applyLanguage(localStorage.getItem('lang') || 'en');

// ===== Mobile menu =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

// ===== Navbar shadow + scroll progress =====
const nav = document.getElementById('nav');
const progress = document.getElementById('scrollProgress');
const onScroll = () => {
  nav.classList.toggle('scrolled', window.scrollY > 8);
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = max > 0 ? `${(window.scrollY / max) * 100}%` : '0';
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// ===== Reveal sections on scroll =====
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.section, .hero__card').forEach((el) => observer.observe(el));

// ===== Contact form -> opens email client =====
const form = document.getElementById('contactForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const name = encodeURIComponent(data.get('name'));
  const email = encodeURIComponent(data.get('email'));
  const message = encodeURIComponent(data.get('message'));
  const subject = `Portfolio contact — ${data.get('name')}`;
  const body = `${data.get('message')}\n\n— ${data.get('name')} (${data.get('email')})`;
  window.location.href = `mailto:midoy3727@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
