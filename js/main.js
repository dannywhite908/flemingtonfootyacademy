/**
 * Flemington Footy Academy – main.js
 * Handles navigation, scroll effects, and reveal animations
 */

(function () {
  'use strict';

  /* ── Navbar scroll effect ───────────────────────────────── */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run on load
  }

  /* ── Mobile hamburger menu ──────────────────────────────── */
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      if (isOpen) {
        mobileNav.style.display = 'flex';
        requestAnimationFrame(() => mobileNav.classList.add('open'));
      } else {
        mobileNav.classList.remove('open');
        setTimeout(() => {
          if (!mobileNav.classList.contains('open')) {
            mobileNav.style.display = 'none';
          }
        }, 300);
      }
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on link click
    mobileNav.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        setTimeout(() => { mobileNav.style.display = 'none'; }, 300);
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Active nav link highlighting ──────────────────────── */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ── Scroll-reveal animations ───────────────────────────── */
  // Enable reveal animations only after JS is ready, so content is always
  // visible even before the IntersectionObserver fires.
  document.body.classList.add('js-reveal');

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ── Smooth scroll for anchor links ────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Contact form handler ───────────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('.contact-submit-btn');
      const originalText = submitBtn.textContent;

      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      // Placeholder: replace setTimeout with a real backend/API call to persist the booking.
      setTimeout(() => {
        contactForm.style.display = 'none';
        const successMsg = document.getElementById('formSuccess');
        if (successMsg) {
          successMsg.classList.add('show');
        }
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 1200);
    });
  }

})();
