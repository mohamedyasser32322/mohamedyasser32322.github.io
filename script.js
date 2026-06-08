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

// ===== Navbar shadow on scroll =====
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
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
