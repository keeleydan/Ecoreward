// ─── Sticky Nav Shadow ───────────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// ─── Hamburger Menu ──────────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.style.display = mobileMenu.style.display === 'flex' ? 'none' : 'flex';
});

// Close mobile menu when a link is clicked
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.style.display = 'none';
    hamburger.classList.remove('open');
  });
});

// ─── Scroll Reveal ───────────────────────────────────────────────────────────
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.12 });

reveals.forEach(el => revealObserver.observe(el));

// ─── Counter Animation ───────────────────────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const prefix = el.dataset.prefix || '';
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    const display = Math.round(current);

    if (target >= 1000000) {
      el.textContent = prefix + (display / 1000000).toFixed(1) + 'M+';
    } else if (target >= 1000) {
      el.textContent = prefix + (display / 1000).toFixed(0) + 'K+';
    } else {
      el.textContent = prefix + display;
    }

    if (current >= target) clearInterval(timer);
  }, 16);
}

const counters = document.querySelectorAll('.counter-val[data-target]');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.animated) {
      e.target.dataset.animated = 'true';
      animateCounter(e.target);
    }
  });
}, { threshold: 0.4 });

counters.forEach(c => counterObserver.observe(c));

// ─── FAQ Accordion ────────────────────────────────────────────────────────────
// Handles both .faq-item (generic) and .edu-faq-item (education page)
document.addEventListener('DOMContentLoaded', () => {
  function initAccordion(itemSelector, questionSelector) {
    const items = document.querySelectorAll(itemSelector);
    if (!items.length) return;
    items.forEach(item => {
      const question = item.querySelector(questionSelector);
      if (!question) return;
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        items.forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  initAccordion('.faq-item',     '.faq-question');
  initAccordion('.edu-faq-item', '.edu-faq-question');
});