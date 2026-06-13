// ===== Intro: ball drops, bounces, bursts, then content reveals =====
(function () {
  const intro = document.getElementById('intro');
  if (!intro) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { intro.remove(); return; }

  document.body.classList.add('intro-lock');
  const stage = intro.querySelector('.intro__stage');

  // After the ball finishes bouncing → burst
  setTimeout(() => {
    intro.classList.add('boom');

    const N = 16;
    for (let i = 0; i < N; i++) {
      const p = document.createElement('span');
      p.className = 'intro__particle';
      const angle = (Math.PI * 2 * i) / N + (Math.random() - 0.5) * 0.5;
      const dist = 120 + Math.random() * 160;
      p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
      const size = 6 + Math.random() * 8;
      p.style.width = p.style.height = size + 'px';
      if (i % 2) p.style.background = 'var(--accent-2)';
      p.style.animationDelay = (Math.random() * 0.05) + 's';
      stage.appendChild(p);
    }

    // Reveal the page
    setTimeout(() => {
      intro.classList.add('done');
      document.body.classList.remove('intro-lock');
      document.body.classList.add('intro-done');
      setTimeout(() => intro.remove(), 700);
    }, 600);
  }, 1560);
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
