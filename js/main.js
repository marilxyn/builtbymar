document.addEventListener('DOMContentLoaded', () => {

  gsap.registerPlugin(ScrollTrigger);

  // GSAP/ScrollTrigger's setup pass can stomp the browser's native
  // scroll-to-#hash on load, and lazy-loading gallery images keep shifting
  // the layout underneath it. Re-snap to the target every frame until its
  // position holds still, capped so it can't fight a user who scrolls away.
  if (location.hash) {
    window.addEventListener('load', () => {
      const target = document.querySelector(location.hash);
      if (!target) return;
      let stableFrames = 0;
      let attempts = 0;
      const chase = () => {
        target.scrollIntoView({ behavior: 'auto' });
        const settled = Math.abs(target.getBoundingClientRect().top) < 2;
        stableFrames = settled ? stableFrames + 1 : 0;
        attempts++;
        if (stableFrames < 4 && attempts < 120) requestAnimationFrame(chase);
      };
      requestAnimationFrame(chase);
    });
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Mobile hamburger ── (wired up regardless of motion preference, since
     opening the menu is functionality, not decoration) */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu   = document.getElementById('nav-menu');
  const navItems  = navMenu.querySelectorAll(':scope > li');
  const dropdownItem = document.getElementById('projects-dropdown-item');
  const header    = document.getElementById('site-header');

  function openMenu() {
    navMenu.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    header.classList.add('is-menu-open');
    document.body.style.overflow = 'hidden';

    if (prefersReducedMotion) {
      gsap.set(navItems, { y: 0, opacity: 1 });
      return;
    }

    // Quick RGB-split jitter as the panel wipes open
    navMenu.classList.remove('is-flicker');
    void navMenu.offsetWidth;
    navMenu.classList.add('is-flicker');
    setTimeout(() => navMenu.classList.remove('is-flicker'), 400);

    gsap.fromTo(navItems,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: 'power3.out', delay: 0.2 }
    );
  }

  function closeMenu() {
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    header.classList.remove('is-menu-open');
    document.body.style.overflow = '';
    dropdownItem?.classList.remove('is-open');

    if (prefersReducedMotion) return;
    gsap.to(navItems, { y: -12, opacity: 0, duration: 0.22, stagger: 0.03, ease: 'power2.in' });
  }

  navToggle.addEventListener('click', () => {
    navMenu.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  navMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  // Chevron toggles the Projects submenu on mobile without navigating away
  const dropdownChevron = document.querySelector('.nav__dropdown-toggle .nav__chevron');
  dropdownChevron?.addEventListener('click', (e) => {
    if (window.matchMedia('(max-width: 900px)').matches) {
      e.preventDefault();
      e.stopPropagation();
      dropdownItem.classList.toggle('is-open');
    }
  });

  if (prefersReducedMotion) {
    // No decorative animation, but still reveal the names hidden by .js-anim in CSS
    document.querySelectorAll('.hero__name, .projects-page-hero__title').forEach(el => {
      el.style.opacity = '1';
    });
    return;
  }

  /* ── NAV scroll state ── */
  ScrollTrigger.create({
    start: 20,
    onEnter:     () => header.classList.add('is-scrolled'),
    onLeaveBack: () => header.classList.remove('is-scrolled'),
  });

  /* ── HERO entrance ── */
  const nameEl = document.querySelector('.hero__name');

  // Glitch burst: adds class, lets CSS animate, then cleans up
  function fireGlitch(el) {
    if (!el) return;
    el.classList.remove('is-glitching');
    // force reflow so re-adding the class restarts the animation
    void el.offsetWidth;
    el.classList.add('is-glitching');
    setTimeout(() => el.classList.remove('is-glitching'), 380);
  }

  // Periodic glitch (every 4–9 seconds, random)
  function scheduleGlitch(el) {
    setTimeout(() => {
      fireGlitch(el);
      scheduleGlitch(el);
    }, 4000 + Math.random() * 5000);
  }

  // Clean per-character clip reveal — each letter slides up through
  // an overflow-hidden wrapper, staggered left to right
  function charReveal(el) {
    const text = el.getAttribute('data-text');

    // Split into clip-wrapped character spans, preserve accessibility
    el.innerHTML = text.split('').map(char =>
      char === ' '
        ? '<span class="char-wrap char-wrap--space" aria-hidden="true"><span class="char">&nbsp;</span></span>'
        : `<span class="char-wrap" aria-hidden="true"><span class="char">${char}</span></span>`
    ).join('');
    el.setAttribute('aria-label', text);
    el.style.opacity = '1';

    const chars = el.querySelectorAll('.char');
    gsap.set(chars, { y: '110%' });
    gsap.to(chars, {
      y: '0%',
      duration: 0.65,
      stagger: 0.045,
      ease: 'power4.out',
      delay: 0.35,
      onComplete() {
        // release clip so text-shadow glow isn't cut off by the wrappers
        el.querySelectorAll('.char-wrap').forEach(w => w.style.overflow = 'visible');
        el.classList.add('is-lit');
        setTimeout(() => el.classList.remove('is-lit'), 1400);
        setTimeout(() => { fireGlitch(el); scheduleGlitch(el); }, 120);
      },
    });
  }

  /* ── About page name — reuse same glitch functions ── */
  const aboutNameEl = document.querySelector('.about-intro__text .hero__name');
  if (aboutNameEl) {
    ScrollTrigger.create({
      trigger: aboutNameEl,
      start: 'top 82%',
      once: true,
      onEnter: () => charReveal(aboutNameEl),
    });
    aboutNameEl.addEventListener('mouseenter', () => { aboutNameEl.classList.add('is-hovered'); fireGlitch(aboutNameEl); });
    aboutNameEl.addEventListener('mouseleave', () => aboutNameEl.classList.remove('is-hovered'));
  }

  /* ── Projects page hero ── */
  const projectsHeroTitle = document.querySelector('.projects-page-hero__title');
  if (projectsHeroTitle) {
    gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 })
      .from('.projects-page-hero .section-eyebrow', { y: 12, opacity: 0, duration: 0.5 })
      .add(() => charReveal(projectsHeroTitle), '-=0.05')
      .from('.projects-page-hero__count', { y: 10, opacity: 0, duration: 0.45 }, '+=0.9');

    projectsHeroTitle.addEventListener('mouseenter', () => {
      projectsHeroTitle.classList.add('is-hovered');
      fireGlitch(projectsHeroTitle);
    });
    projectsHeroTitle.addEventListener('mouseleave', () => {
      projectsHeroTitle.classList.remove('is-hovered');
    });
  }

  if (nameEl && document.querySelector('.hero')) {
    // Kick off the full hero sequence
    gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 })
      .from('.hero__greeting',  { y: 16, opacity: 0, duration: 0.55 })
      .add(() => charReveal(nameEl), '-=0.05')
      .from('.hero__tagline',   { y: 14, opacity: 0, duration: 0.5 }, '+=1.1')
      .from('.hero__ctas .btn', { y: 14, opacity: 0, duration: 0.4, stagger: 0.1 }, '-=0.25');

    // Hover — glow only, no scale
    nameEl.addEventListener('mouseenter', () => {
      nameEl.classList.add('is-hovered');
      fireGlitch(nameEl);
    });
    nameEl.addEventListener('mouseleave', () => {
      nameEl.classList.remove('is-hovered');
    });
  }

  /* ── Scroll reveal helper ── */
  function reveal(selector, vars = {}) {
    const els = gsap.utils.toArray(selector);
    if (!els.length) return;
    gsap.from(els, {
      scrollTrigger: { trigger: els[0], start: 'top 88%', ...vars.st },
      y: 32, opacity: 0, duration: 0.65, stagger: 0.07,
      ease: 'power3.out',
      ...vars,
      st: undefined,
    });
  }

  /* ── Tools ── */
  reveal('.tools .section-eyebrow');
  gsap.fromTo('.tools .section-heading',
    { clipPath: 'inset(0 100% 0 0)' },
    { clipPath: 'inset(0 0% 0 0)', duration: 0.85, ease: 'power3.out',
      scrollTrigger: { trigger: '.tools .section-heading', start: 'top 88%' } });
  reveal('.tools__carousel', { y: 20, duration: 0.55, st: { trigger: '.tools__carousel', start: 'top 90%' } });

  /* ── Tools carousel ── */
  (function () {
    const carousel = document.getElementById('tools-carousel');
    const belt     = document.getElementById('tools-belt');
    if (!carousel || !belt) return;

    const BASE_SPEED = 0.6;
    let pos      = 0;
    let paused   = false;
    let trackW   = 0;
    let momentum = 0;

    function measure() {
      const first = belt.children[0];
      if (first) trackW = first.offsetWidth;
    }

    function tick() {
      if (trackW > 0) {
        if (!paused) pos += BASE_SPEED;
        if (momentum !== 0) {
          pos      += momentum;
          momentum *= 0.92;
          if (Math.abs(momentum) < 0.05) momentum = 0;
        }
        pos = ((pos % trackW) + trackW) % trackW;
        belt.style.transform = `translateX(${-pos}px)`;
      }
      requestAnimationFrame(tick);
    }


    carousel.addEventListener('wheel', (e) => {
      e.preventDefault();
      momentum += (e.deltaX || e.deltaY) * 0.4;
    }, { passive: false });

    let touchPrev = 0;
    carousel.addEventListener('touchstart', (e) => {
      touchPrev = e.touches[0].clientX;
      paused = true;
    }, { passive: true });
    carousel.addEventListener('touchmove', (e) => {
      const dx = touchPrev - e.touches[0].clientX;
      momentum += dx * 0.8;
      touchPrev = e.touches[0].clientX;
    }, { passive: true });
    carousel.addEventListener('touchend', () => { paused = false; });

    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    requestAnimationFrame(tick);
  })();

  /* ── Projects header ── */
  reveal('.projects__header .section-eyebrow');
  gsap.fromTo('.projects__header .section-heading',
    { clipPath: 'inset(0 100% 0 0)' },
    { clipPath: 'inset(0 0% 0 0)', duration: 0.85, ease: 'power3.out',
      scrollTrigger: { trigger: '.projects__header .section-heading', start: 'top 88%' } });

  /* ── Project rows: staggered fade-in ── */
  reveal('.project-row-wrap', {
    y: 24, stagger: 0.08, duration: 0.55,
    st: { trigger: '.projects__dark', start: 'top 85%' },
  });

  /* ── Project accordion ── */
  (function () {
    const rows = document.querySelectorAll('.project-row');
    if (!rows.length) return;

    function close(row) {
      const panel = document.getElementById(row.getAttribute('aria-controls'));
      if (!panel) return;
      row.classList.remove('is-open');
      row.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
      gsap.to(panel, { height: 0, opacity: 0, duration: 0.35, ease: 'power3.in' });
    }

    function open(row) {
      const panel = document.getElementById(row.getAttribute('aria-controls'));
      if (!panel) return;
      row.classList.add('is-open');
      row.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
      gsap.to(panel, { height: 'auto', opacity: 1, duration: 0.5, ease: 'power3.out' });
    }

    rows.forEach(row => {
      row.addEventListener('click', () => {
        const isOpen = row.classList.contains('is-open');
        rows.forEach(r => { if (r !== row) close(r); });
        isOpen ? close(row) : open(row);
      });
    });
  })();

  /* ── Glitch canvas (shared by gallery, about, projects hero) ── */
  function initGlitchCanvas(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    let frame     = 0;
    let intensity = 0.25;

    function draw() {
      requestAnimationFrame(draw);
      if (!W || !H) return;
      frame++;

      const base = 0.2 + Math.sin(frame * 0.04) * 0.1 + Math.sin(frame * 0.011) * 0.08;
      if (Math.random() < 0.018) intensity = 0.85 + Math.random() * 0.15;
      intensity = Math.max(base, intensity * 0.91);

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      const slices = Math.floor(3 + intensity * 18);
      for (let i = 0; i < slices; i++) {
        const y   = Math.random() * H;
        const h   = Math.random() * intensity * 44 + 1;
        const red = Math.random() < 0.5;
        ctx.fillStyle = red
          ? `rgba(255,0,0,${(Math.random() * intensity * 0.65 + 0.04).toFixed(2)})`
          : `rgba(39,39,39,${(Math.random() * 0.7 + 0.15).toFixed(2)})`;
        ctx.fillRect(0, y, W, h);
      }

      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = `rgba(255,0,0,${(intensity * 0.18).toFixed(2)})`;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';

      const artifacts = Math.floor(intensity * 6);
      for (let i = 0; i < artifacts; i++) {
        const y  = Math.random() * H;
        const bh = Math.random() * 5 + 1;
        ctx.fillStyle = `rgba(255,0,0,${(0.4 + intensity * 0.55).toFixed(2)})`;
        ctx.fillRect(0, y, W, bh);
      }

      if (Math.random() < intensity * 0.2) {
        const x = Math.random() * W;
        ctx.fillStyle = `rgba(255,0,0,${(Math.random() * 0.5).toFixed(2)})`;
        ctx.fillRect(x, 0, Math.random() * 2 + 1, H);
      }
    }

    requestAnimationFrame(draw);
  }

  initGlitchCanvas('hero-glitch');
  initGlitchCanvas('gallery-glitch');
  initGlitchCanvas('about-glitch');
  initGlitchCanvas('projects-hero-glitch');
  initGlitchCanvas('gallery-cta-glitch');

  /* ── Gallery ── */
  reveal('.gallery__header .section-eyebrow');
  gsap.fromTo('.gallery__header .section-heading',
    { clipPath: 'inset(0 100% 0 0)' },
    { clipPath: 'inset(0 0% 0 0)', duration: 0.85, ease: 'power3.out',
      scrollTrigger: { trigger: '.gallery__header .section-heading', start: 'top 88%' } });
  reveal('.gallery__btns .btn', { stagger: 0.12, st: { trigger: '.gallery__dark', start: 'top 80%' } });

  /* ── Gallery / Contact page heroes ── */
  gsap.fromTo('.gallery-page-hero .section-heading',
    { clipPath: 'inset(0 100% 0 0)' },
    { clipPath: 'inset(0 0% 0 0)', duration: 1.15, ease: 'power3.out',
      scrollTrigger: { trigger: '.gallery-page-hero .section-heading', start: 'top 88%' } });
  gsap.fromTo('.contact-page-hero__title',
    { clipPath: 'inset(0 100% 0 0)' },
    { clipPath: 'inset(0 0% 0 0)', duration: 1.15, ease: 'power3.out',
      scrollTrigger: { trigger: '.contact-page-hero__title', start: 'top 88%' } });

  /* ── About ── */
  gsap.from('.about__text', {
    scrollTrigger: { trigger: '.about__inner', start: 'top 80%' },
    x: -36, opacity: 0, duration: 0.85, ease: 'power3.out',
  });
  gsap.from('.about__logo', {
    scrollTrigger: { trigger: '.about__inner', start: 'top 80%' },
    x: 36, opacity: 0, duration: 0.85, ease: 'power3.out',
  });

  /* ── Footer ── */
  reveal('.site-footer__inner > *', {
    y: 12, stagger: 0.08, duration: 0.45,
    st: { trigger: '.site-footer', start: 'top 95%' },
  });

});
