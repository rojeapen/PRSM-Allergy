// Basic interactivity: mobile nav toggle, donation modal, simple form hooks
document.addEventListener('DOMContentLoaded', function () {
  // mobile nav
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  navToggle?.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    nav.style.display = expanded ? 'none' : 'block';
  });

  // donation modal
  const modal = document.getElementById('donation-modal');
  const openers = [document.getElementById('donate-open'), document.getElementById('hero-donate')];
  const closeBtn = modal?.querySelector('.modal-close');
  const cancelBtn = modal?.querySelector('.modal-cancel');

  function openModal() {
    if (!modal) return;
    // window.open(window.location.origin + "/events.html", '_blank');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // focus first form field for accessibility
    const first = modal.querySelector('input, button, select, textarea');
    first?.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openers.forEach(el => el?.addEventListener('click', (e) => { e.preventDefault(); openModal(); }));
  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (ev) => {
    if (ev.target === modal) closeModal();
  });

  // donation form: compute amount and validate
  const donationForm = document.getElementById('donation-form');
  donationForm?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    // Basic selection logic (demo only)
    const form = ev.target;
    const amountRadio = form.querySelector('input[name="amount"]:checked');
    let amount = amountRadio?.value;
    if (amount === 'other') {
      const custom = form.querySelector('#custom-amount').value;
      amount = custom || '';
    }
    const donorName = form.querySelector('#donor-name').value;
    const donorEmail = form.querySelector('#donor-email').value;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }
    if (!donorName || !donorEmail) {
      alert('Please enter your name and email.');
      return;
    }

    // In a real site, send this data to your payment processor backend.
    alert('Demo: Donation of $' + amount + ' captured (not processed). Integrate a payment gateway to accept payments.');
    closeModal();
  });

  // contact form (demo: prevent page submit, show simple feedback)
  const contactForm = document.getElementById('contact-form');
  contactForm?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    alert('Thanks — your message has been received (demo).');
    contactForm.reset();
  });

  // Gallery behavior
  (async function () {
    const track = document.querySelector('.gallery-track');
    if (!track) return;
    let imgs = Array.from(track.querySelectorAll('.gallery-img'));
    // helper to extract the numeric order from filenames like gallery1.jpg
    function extractNumFromSrc(src) {
      if (!src) return Infinity;
      const s = src.toString();
      const m = s.match(/gallery(?:-|_)?(\d+)\b/i) || s.match(/(\d+)\b/);
      return m ? Number(m[1]) : Infinity;
    }

    // normalize DOM order of track images and thumbnail buttons so they follow numeric filename order
    function normalizeGalleryOrder() {
      const imgsLocal = Array.from(track.querySelectorAll('.gallery-img'));
      imgsLocal.sort((a, b) => extractNumFromSrc(a.getAttribute('src') || a.src) - extractNumFromSrc(b.getAttribute('src') || b.src));
      imgsLocal.forEach((img, i) => {
        img.dataset.index = i;
        track.appendChild(img);
      });

      const thumbsContainer = document.querySelector('.gallery-thumbs');
      if (thumbsContainer) {
        const thumbs = Array.from(thumbsContainer.querySelectorAll('.thumb'));
        thumbs.sort((a, b) => {
          const aImg = a.querySelector('img');
          const bImg = b.querySelector('img');
          const aNum = Number(a.dataset.index) || extractNumFromSrc(aImg && (aImg.getAttribute('src') || aImg.src));
          const bNum = Number(b.dataset.index) || extractNumFromSrc(bImg && (bImg.getAttribute('src') || bImg.src));
          return aNum - bNum;
        });
        thumbs.forEach((t, i) => {
          t.dataset.index = i;
          thumbsContainer.appendChild(t);
        });
      }
    }
    // helper to verify if a src loads in this browser
    function testSrc(src) {
      return new Promise((resolve) => {
        const t = new Image();
        t.onload = () => resolve(true);
        t.onerror = () => resolve(false);
        t.src = src;
      });
    }

    // mark images that fail to load instead of replacing them with other files
    imgs.forEach((imgEl) => {
      imgEl.addEventListener('error', () => {
        console.warn('Gallery image failed to load:', imgEl.getAttribute('src'));
        imgEl.classList.add('broken');
      });
    });
    // normalize DOM order (so gallery1..gallery5 appear in numeric order) and re-collect images/thumbs
    normalizeGalleryOrder();
    imgs = Array.from(track.querySelectorAll('.gallery-img'));
    const thumbs = Array.from(document.querySelectorAll('.gallery-thumbs .thumb'));
    const leftNav = document.querySelector('.gallery-nav.left');
    const rightNav = document.querySelector('.gallery-nav.right');
    let index = 0;

    function show(i) {
      index = (i + imgs.length) % imgs.length;
      imgs.forEach((img, n) => {
        img.classList.remove('active', 'side');
        if (n === index) img.classList.add('active');
        else if (n === (index - 1 + imgs.length) % imgs.length) img.classList.add('side');
        else if (n === (index + 1) % imgs.length) img.classList.add('side');
      });
      // shift track so current image is visible
      track.style.transform = `translateX(-${index * 100}%)`;
      thumbs.forEach(btn => btn.setAttribute('aria-pressed', 'false'));
      const activeThumb = thumbs.find(btn => Number(btn.dataset.index) === index);
      if (activeThumb) activeThumb.setAttribute('aria-pressed', 'true');

      // left preview removed — no preview update needed
    }

    // clicking an image: open if active, otherwise select it
    imgs.forEach((img, n) => {
      img.addEventListener('click', (e) => {
        if (img.classList.contains('active')) {
          // open the image source in a new tab (user asked to open link)
          window.open(img.src, '_blank');
        } else {
          show(n);
        }
      });
      // keyboard accessibility: Enter opens when focused
      img.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (img.classList.contains('active')) window.open(img.src, '_blank');
          else show(n);
        }
      });
      // make images focusable for keyboard users
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Open image in new tab');
    });

    function next() { show(index + 1); }
    function prev() { show(index - 1); }

    // overlays
    leftNav?.addEventListener('click', (e) => { e.preventDefault(); prev(); });
    rightNav?.addEventListener('click', (e) => { e.preventDefault(); next(); });

    // thumbnails
    thumbs.forEach(btn => btn.addEventListener('click', () => show(Number(btn.dataset.index))));

    // keyboard
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });

    // initial
    show(0);
  })();
});