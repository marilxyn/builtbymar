document.addEventListener('DOMContentLoaded', () => {

  gsap.registerPlugin(ScrollTrigger);

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* Scroll reveal helper (mirrors main.js) */
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

  function revealHeading(selector) {
    const el = document.querySelector(selector);
    if (!el) return;
    gsap.fromTo(el,
      { clipPath: 'inset(0 100% 0 0)' },
      { clipPath: 'inset(0 0% 0 0)', duration: 0.85, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' } });
  }

  /* Page hero */
  reveal('.about-page-hero .section-eyebrow');
  revealHeading('.about-page-hero .section-heading');

  /* Mission */
  reveal('.about-mission .section-eyebrow');
  revealHeading('.about-mission .section-heading');
  reveal('.about-mission__text', { y: 24, st: { trigger: '.about-mission__text', start: 'top 88%' } });

  /* Values */
  reveal('.about-values__header .section-eyebrow');
  revealHeading('.about-values__header .section-heading');
  reveal('.value-row', {
    y: 24, stagger: 0.08, duration: 0.55,
    st: { trigger: '.values-list', start: 'top 85%' },
  });

  /* CTA */
  reveal('.about-cta__inner .section-eyebrow');
  revealHeading('.about-cta__heading');

  /* Glitch canvas (same logic as gallery) */
  (function () {
    const canvas = document.getElementById('about-glitch');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    let frame = 0;
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
        const y = Math.random() * H;
        const h = Math.random() * intensity * 44 + 1;
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
        ctx.fillStyle = `rgba(255,0,0,${(0.4 + intensity * 0.55).toFixed(2)})`;
        ctx.fillRect(0, Math.random() * H, W, Math.random() * 5 + 1);
      }

      if (Math.random() < intensity * 0.2) {
        const x = Math.random() * W;
        ctx.fillStyle = `rgba(255,0,0,${(Math.random() * 0.5).toFixed(2)})`;
        ctx.fillRect(x, 0, Math.random() * 2 + 1, H);
      }
    }

    requestAnimationFrame(draw);
  })();

});
