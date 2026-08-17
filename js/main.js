/* ================================================================
   CHRISTINE EAGLETON — HEALING TOUCH MASSAGE
   main.js  |  Vanilla JavaScript — no dependencies
   ================================================================

   TABLE OF CONTENTS
   -----------------
   1.  Header height — keeps anchor links clear of the fixed header
   2.  Text size control — 3 steps, remembered between visits
   3.  Navbar — shadow on scroll
   4.  Navbar — close mobile menu on link tap
   5.  Scroll Reveal — fade cards and sections in on scroll
   ================================================================ */


/* Does the visitor's system ask for reduced motion? */
function prefersReducedMotion() {
  return window.matchMedia &&
         window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}


/* ================================================================
   1. HEADER HEIGHT
      The header is fixed, so jumping to "#pricing" would otherwise
      park the heading underneath it. Measuring the real height and
      publishing it as --header-h keeps every anchor landing in the
      right place at any text size or window width.
   ================================================================ */
function initHeaderHeight() {
  var header = document.getElementById('siteHeader');
  if (!header) return;

  function measure() {
    var h = header.offsetHeight;
    if (h > 0) {
      document.documentElement.style.setProperty('--header-h', h + 'px');
    }
  }

  measure();
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('orientationchange', measure);

  // Re-measure once webfonts land, since they change the header height
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measure).catch(function () { /* no-op */ });
  }

  // Expose so the text-size buttons can re-measure after changing size
  document.documentElement._ceMeasureHeader = measure;
}


/* ================================================================
   2. TEXT SIZE CONTROL
      Sets data-text-size on <html>, which scales the root font size.
      Because the stylesheet is written in rem, the whole page grows
      together. The choice is saved so it persists between visits.
   ================================================================ */
function initTextSize() {
  var buttons = document.querySelectorAll('.text-size-btn');
  if (!buttons.length) return;

  function apply(size, save) {
    if (size === '1') {
      document.documentElement.removeAttribute('data-text-size');
    } else {
      document.documentElement.setAttribute('data-text-size', size);
    }

    buttons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.dataset.textSize === size ? 'true' : 'false');
    });

    if (save) {
      try {
        localStorage.setItem('ce-text-size', size);
      } catch (e) { /* private browsing — preference just isn't saved */ }
    }

    // The header grows with the text, so re-measure it
    if (typeof document.documentElement._ceMeasureHeader === 'function') {
      document.documentElement._ceMeasureHeader();
    }
  }

  // Reflect whatever the inline <head> script already applied
  var current = document.documentElement.getAttribute('data-text-size') || '1';
  apply(current, false);

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      apply(btn.dataset.textSize, true);
    });
  });
}


/* ================================================================
   3. NAVBAR — add shadow when the visitor scrolls down
   ================================================================ */
function initNavbar() {
  var header = document.getElementById('siteHeader');
  if (!header) return;

  function updateNav() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav(); // run once on load in case page starts scrolled
}


/* ================================================================
   4. NAVBAR — close the mobile collapse menu when a link is tapped
   ================================================================ */
function initMobileNavClose() {
  var navbarEl = document.getElementById('navbarNav');
  var navLinks = document.querySelectorAll('#navbarNav .nav-link');
  if (!navbarEl || !navLinks.length) return;

  navLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      // Bootstrap 5 provides a Collapse instance on the element
      if (typeof bootstrap === 'undefined') return;
      var bsCollapse = bootstrap.Collapse.getInstance(navbarEl);
      if (bsCollapse) {
        bsCollapse.hide();
      }
    });
  });
}


/* ================================================================
   5. SCROLL REVEAL
      Adds .reveal classes to grid cards and section headings, then
      uses IntersectionObserver to fade each one in.

      Two safeguards: the classes are only ever added by this script
      (so no-JS visitors see everything), and nothing is added at all
      when the system asks for reduced motion.
   ================================================================ */
function addRevealClasses() {
  // Service cards — stagger up to 6
  document.querySelectorAll('.service-card').forEach(function (card, i) {
    card.classList.add('reveal', 'reveal-delay-' + ((i % 6) + 1));
  });

  // Pricing cards
  document.querySelectorAll('.price-card').forEach(function (card, i) {
    card.classList.add('reveal', 'reveal-delay-' + ((i % 4) + 1));
  });

  // Testimonial cards
  document.querySelectorAll('.testimonial-card').forEach(function (card, i) {
    card.classList.add('reveal', 'reveal-delay-' + ((i % 3) + 1));
  });

  // Section titles and eyebrows
  document.querySelectorAll('.section-title, .eyebrow').forEach(function (el) {
    el.classList.add('reveal');
  });

  // About section image and text columns
  document.querySelectorAll('#about .col-lg-5, #about .col-lg-7').forEach(function (el) {
    el.classList.add('reveal');
  });

  // Contact form and info box
  document.querySelectorAll('#contactForm, .contact-info-box').forEach(function (el) {
    el.classList.add('reveal');
  });
}

function initScrollReveal() {
  var elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  // Fallback: if IntersectionObserver is not available, show everything
  if (!('IntersectionObserver' in window)) {
    elements.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // only animate once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(function (el) { observer.observe(el); });
}


/* ================================================================
   INIT — run everything after the DOM is ready
   ================================================================ */
document.addEventListener('DOMContentLoaded', function () {
  initHeaderHeight();
  initTextSize();
  initNavbar();
  initMobileNavClose();

  if (!prefersReducedMotion()) {
    addRevealClasses();
    initScrollReveal();
  }
});
