document.addEventListener('DOMContentLoaded', () => {

  /* Lightbox */
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lb-img');
  const lbAlt    = document.getElementById('lb-alt');
  const lbCounter = document.getElementById('lb-counter');
  const lbClose  = document.getElementById('lb-close');
  const lbPrev   = document.getElementById('lb-prev');
  const lbNext   = document.getElementById('lb-next');

  if (!lightbox) return;

  let currentGallery = [];
  let currentIndex   = 0;
  let lastFocused    = null;

  function openLightbox(items, index) {
    lastFocused = document.activeElement;
    currentGallery = items;
    currentIndex   = index;
    showImage();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  function showImage() {
    const item = currentGallery[currentIndex];
    lbImg.classList.add('is-loading');
    lbImg.onload = () => lbImg.classList.remove('is-loading');
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    if (lbAlt) lbAlt.textContent = item.alt;
    if (lbCounter) lbCounter.textContent = `${currentIndex + 1} / ${currentGallery.length}`;
    const single = currentGallery.length <= 1;
    lbPrev.style.display = single ? 'none' : '';
    lbNext.style.display = single ? 'none' : '';
  }

  function prev() {
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    showImage();
  }

  function next() {
    currentIndex = (currentIndex + 1) % currentGallery.length;
    showImage();
  }

  /* Wire up each gallery grid */
  document.querySelectorAll('[data-gallery]').forEach(grid => {
    const items = Array.from(grid.querySelectorAll('.masonry-item img')).map(img => ({
      src: img.src,
      alt: img.alt || '',
    }));

    grid.querySelectorAll('.masonry-item').forEach((item, index) => {
      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-label', `View ${items[index].alt || 'image'}`);

      item.addEventListener('click', () => openLightbox(items, index));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(items, index);
        }
      });
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', prev);
  lbNext.addEventListener('click', next);

  /* Close on backdrop click */
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  /* Keyboard navigation */
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   prev();
    if (e.key === 'ArrowRight')  next();
  });

  /* Touch swipe */
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) dx > 0 ? next() : prev();
  }, { passive: true });

  /* Scroll reveals */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    /* Section header reveals */
    gsap.utils.toArray('.gallery-section__header .section-eyebrow').forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        y: 12, opacity: 0, duration: 0.5, ease: 'power3.out',
      });
    });

    gsap.utils.toArray('.gallery-section__title').forEach(el => {
      gsap.fromTo(el,
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.85, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }
      );
    });

    gsap.utils.toArray('.gallery-section__caption').forEach(el => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        y: 10, opacity: 0, duration: 0.5, ease: 'power3.out', delay: 0.2,
      });
    });

    /* Individual item fade-in as each enters the viewport */
    document.querySelectorAll('.masonry-item').forEach(item => {
      gsap.from(item, {
        scrollTrigger: { trigger: item, start: 'top 95%', once: true },
        y: 22, opacity: 0, duration: 0.5, ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
    });
  }

});
