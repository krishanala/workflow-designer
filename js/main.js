/* ------------------------------------------------------------------
   Two Loaves Studio
   1. Blocks fade up as they scroll in
   2. Testimonials: loaded from the reviews Google Sheet, shown as cards
   3. Review page (review.html): the form clients fill in, with a live card preview
------------------------------------------------------------------- */

// The Apps Script web app that stores and serves reviews (setup: apps-script/README.md).
// Leave it empty and the testimonials section simply stays hidden.
const REVIEWS_ENDPOINT = '';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* ---------- 1. Fade up on scroll ---------- */

const revealed = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reduceMotion.matches) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealed.forEach((el) => io.observe(el));
} else {
  revealed.forEach((el) => el.classList.add('is-in'));
}

/* ---------- 2. Testimonial cards ---------- */

// Only images we made ourselves (data URLs from the review form) or https links the owner pasted in.
const SAFE_LOGO = /^(data:image\/(png|jpeg|webp|gif);base64,[a-z0-9+/=]+|https:\/\/[^\s"'<>]+)$/i;

function initials(company) {
  const words = String(company || '').trim().split(/\s+/).filter(Boolean);
  return words.slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '★';
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

// One card: logo on top (or beside, when the card is wide), then the review and who wrote it.
function quoteCard({ name, role, company, quote, logo }, placeholder = '') {
  const card = el('figure', 'quote');

  const logoBox = el('div', 'quote__logo');
  if (logo && SAFE_LOGO.test(logo)) {
    const img = el('img');
    img.src = logo;
    img.alt = company ? `${company} logo` : '';
    img.loading = 'lazy';
    logoBox.append(img);
  } else {
    logoBox.classList.add('quote__logo--initials');
    logoBox.setAttribute('aria-hidden', 'true');
    logoBox.textContent = initials(company || name);
  }

  const text = el('blockquote', 'quote__text');
  text.append(el('p', '', quote || placeholder));
  if (!quote && placeholder) text.classList.add('quote__text--empty');

  const who = el('figcaption', 'quote__who');
  who.append(el('b', '', name || 'Your name'));
  const where = [role, company].filter(Boolean).join(', ');
  if (where) who.append(el('span', '', where));

  card.append(logoBox, text, who);
  return card;
}

const testimonials = document.querySelector('[data-testimonials]');
if (testimonials && REVIEWS_ENDPOINT) {
  const list = testimonials.querySelector('[data-quotes]');
  const nav = testimonials.querySelector('[data-quotes-nav]');
  const prev = testimonials.querySelector('[data-quotes-prev]');
  const next = testimonials.querySelector('[data-quotes-next]');

  const updateArrows = () => {
    const overflow = list.scrollWidth > list.clientWidth + 2;
    nav.hidden = !overflow;
    prev.disabled = list.scrollLeft <= 2;
    next.disabled = list.scrollLeft + list.clientWidth >= list.scrollWidth - 2;
  };
  const step = () => (list.firstElementChild ? list.firstElementChild.offsetWidth + 18 : list.clientWidth);
  prev.addEventListener('click', () => list.scrollBy({ left: -step() }));
  next.addEventListener('click', () => list.scrollBy({ left: step() }));
  list.addEventListener('scroll', updateArrows, { passive: true });
  window.addEventListener('resize', updateArrows);

  fetch(REVIEWS_ENDPOINT)
    .then((res) => res.json())
    .then((data) => {
      const reviews = (data && data.testimonials) || [];
      if (!reviews.length) return;
      reviews.forEach((review) => {
        const li = el('li');
        li.append(quoteCard(review));
        list.append(li);
      });
      testimonials.hidden = false;
      document.querySelectorAll('[data-testimonials-link]').forEach((link) => { link.hidden = false; });
      updateArrows();
    })
    .catch(() => { /* No reviews to show: the section stays hidden. */ });
}

/* ---------- 3. Review page ---------- */

const reviewForm = document.querySelector('[data-review-form]');
if (reviewForm) {
  const preview = document.querySelector('[data-review-preview]');
  const status = reviewForm.querySelector('[data-review-status]');
  const submit = reviewForm.querySelector('button[type="submit"]');
  const quoteField = reviewForm.elements.quote;
  const count = reviewForm.querySelector('[data-review-count]');
  const drop = reviewForm.querySelector('[data-logo-drop]');
  const fileInput = reviewForm.elements.logoFile;
  const thumb = reviewForm.querySelector('[data-logo-thumb]');
  const dropLabel = reviewForm.querySelector('[data-logo-label]');
  const clear = reviewForm.querySelector('[data-logo-clear]');
  let logo = '';

  const current = () => ({
    name: reviewForm.elements.name.value.trim(),
    role: reviewForm.elements.role.value.trim(),
    company: reviewForm.elements.company.value.trim(),
    quote: quoteField.value.trim(),
    logo,
  });

  const render = () => {
    preview.replaceChildren(quoteCard(current(), 'Your review will appear here as you type.'));
    count.textContent = `${quoteField.value.length} / ${quoteField.maxLength}`;
  };

  // Shrink the logo in the browser so it fits in one cell of the Google Sheet (under ~45 KB of text).
  const loadImage = (file) => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable')); };
    img.src = url;
  });

  const shrinkLogo = async (file) => {
    const img = await loadImage(file);
    const w = img.naturalWidth || 240;
    const h = img.naturalHeight || 240;
    for (const max of [240, 180, 120]) {
      const scale = Math.min(1, max / Math.max(w, h));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(w * scale));
      canvas.height = Math.max(1, Math.round(h * scale));
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      let data = canvas.toDataURL('image/webp', 0.86);
      if (!data.startsWith('data:image/webp')) data = canvas.toDataURL('image/png');
      if (data.length <= 45000) return data;
    }
    throw new Error('too-big');
  };

  const setLogo = async (file) => {
    status.textContent = '';
    if (!file) return;
    if (!/^image\/(png|jpeg|webp|svg\+xml|gif)$/.test(file.type) || file.size > 5 * 1024 * 1024) {
      status.textContent = 'Please choose a PNG, JPG, WebP or SVG image under 5 MB.';
      return;
    }
    try {
      logo = await shrinkLogo(file);
      const img = el('img');
      img.src = logo;
      img.alt = '';
      thumb.replaceChildren(img);
      dropLabel.textContent = file.name;
      clear.hidden = false;
      render();
    } catch {
      status.textContent = 'That image couldn’t be read. Try a PNG or JPG version of your logo.';
    }
  };

  const clearLogo = () => {
    logo = '';
    fileInput.value = '';
    thumb.textContent = '+';
    dropLabel.textContent = 'Add your logo';
    clear.hidden = true;
    render();
  };

  fileInput.addEventListener('change', () => setLogo(fileInput.files[0]));
  clear.addEventListener('click', (event) => { event.preventDefault(); clearLogo(); });
  ['dragenter', 'dragover'].forEach((type) => drop.addEventListener(type, (event) => {
    event.preventDefault();
    drop.classList.add('is-over');
  }));
  ['dragleave', 'drop'].forEach((type) => drop.addEventListener(type, () => drop.classList.remove('is-over')));
  drop.addEventListener('drop', (event) => {
    event.preventDefault();
    setLogo(event.dataTransfer.files[0]);
  });

  reviewForm.addEventListener('input', render);

  reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = '';
    if (!REVIEWS_ENDPOINT) {
      status.textContent = 'Sorry, reviews can’t be sent just yet. Please email krishanalathamby@gmail.com instead.';
      return;
    }

    const body = new URLSearchParams({ ...current(), website: reviewForm.elements.website.value });
    submit.disabled = true;
    submit.textContent = 'Sending…';
    try {
      const res = await fetch(REVIEWS_ENDPOINT, { method: 'POST', body });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'failed');
      reviewForm.hidden = true;
      document.querySelector('[data-review-thanks]').hidden = false;
    } catch {
      status.textContent = 'Something went wrong sending your review. Please try again in a moment.';
      submit.disabled = false;
      submit.textContent = 'Send review';
    }
  });

  render();
}
