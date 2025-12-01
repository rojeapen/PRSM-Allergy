// Basic interactivity: mobile nav toggle, donation modal, simple form hooks
document.addEventListener('DOMContentLoaded', function () {
  // year in footer
  document.getElementById('year').textContent = new Date().getFullYear();

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
});