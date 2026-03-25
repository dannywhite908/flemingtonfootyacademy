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

  /* ── Contact form handler (Training Request) ───────────────── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Honeypot check
      const honeypot = contactForm.querySelector('input[name="website"]');
      if (honeypot && honeypot.value) {
        console.warn('Honeypot triggered, spam detected');
        return;
      }

      // Check at least one day selected
      const daysCheckboxes = contactForm.querySelectorAll('input[name="days"]');
      const daysSelected = Array.from(daysCheckboxes).some(cb => cb.checked);
      const daysError = document.getElementById('daysError');
      
      if (!daysSelected) {
        if (daysError) daysError.style.display = 'block';
        return;
      }
      if (daysError) daysError.style.display = 'none';

      // Gather form data
      const formData = new FormData(contactForm);
      const parentName = formData.get('parentName');
      const playerName = formData.get('playerName');
      const playerAge = formData.get('playerAge');
      const email = formData.get('email');
      const phone = formData.get('phone');
      const sport = formData.get('sport');
      const experience = formData.get('experience');
      const program = formData.get('program');
      const goals = formData.get('goals');
      
      // Collect selected days
      const selectedDays = Array.from(daysCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value)
        .join(', ');

      // Build mailto subject and body
      const subject = `Training Request from ${parentName} for ${playerName}`;
      const body = `
Training Request Submission

PARENT/GUARDIAN INFORMATION
Name: ${parentName}
Email: ${email}
Phone: ${phone}

ATHLETE INFORMATION
Name: ${playerName}
Age: ${playerAge}
Sport: ${sport}
Experience Level: ${experience}

SESSION PREFERENCES
Preferred Program: ${program}
Preferred Days: ${selectedDays}

GOALS & NOTES
${goals}

---
This is an automated request from the Flemington Footy Academy website.
      `.trim();

      const mailtoLink = `mailto:dannywhite908@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // Try to open email client
      const submitBtn = contactForm.querySelector('.contact-submit-btn');
      const originalText = submitBtn.textContent;

      // Show loading state briefly
      submitBtn.textContent = 'Opening email…';
      submitBtn.disabled = true;

      // Small delay, then show success
      setTimeout(() => {
        window.location.href = mailtoLink;

        // Fallback: show success message even if email didn't open
        setTimeout(() => {
          contactForm.style.display = 'none';
          const successMsg = document.getElementById('formSuccess');
          if (successMsg) {
            successMsg.style.display = 'block';
          }
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
          
          // Scroll to success message
          successMsg?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 600);
      }, 300);
    });
  }

})();
