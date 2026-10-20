// Every enquiry goes to this address.
const CONTACT_EMAIL = 'krishanalathamby@gmail.com';

// The Google Apps Script web app URL (ends in /exec) from apps-script/README.md.
// With it set, the form sends enquiries in the background and shows the "received" card.
// While it is empty, the form opens the visitor's email app with the enquiry addressed to CONTACT_EMAIL.
const FORM_ENDPOINT = '';

/* ---------- Rebus puzzles + score ---------- */

const puzzles = [...document.querySelectorAll('.rebus')];
const scoreEls = document.querySelectorAll('[data-score]');
const toast = document.querySelector('[data-toast]');
const solved = new Set();
let celebrated = false;

document.querySelectorAll('[data-total]').forEach((el) => { el.textContent = puzzles.length; });

function celebrate() {
  if (!toast || celebrated) return;
  celebrated = true;
  toast.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('is-in')));
  setTimeout(() => toast.classList.remove('is-in'), 6000);
}

puzzles.forEach((puzzle, index) => {
  // Stagger the nudge dance so neighbouring puzzles don't move at the same moment.
  puzzle.style.setProperty('--nudge-delay', `${((index * 0.9) % 4.5).toFixed(1)}s`);
  puzzle.querySelectorAll('.pic').forEach((pic, step) => pic.style.setProperty('--nudge-step', step));

  puzzle.addEventListener('click', () => {
    const solving = puzzle.getAttribute('aria-pressed') !== 'true';
    puzzle.setAttribute('aria-pressed', String(solving));
    if (!solving) return;
    solved.add(puzzle);
    scoreEls.forEach((el) => { el.textContent = solved.size; });
    if (solved.size === puzzles.length) celebrate();
  });
});

/* ---------- Tidy the messy sheet ---------- */

const sheet = document.querySelector('[data-sheet]');
const tidyBtn = document.querySelector('[data-tidy]');

tidyBtn?.addEventListener('click', () => {
  const tidy = sheet.classList.toggle('is-tidy');
  tidyBtn.setAttribute('aria-pressed', String(tidy));
  tidyBtn.textContent = tidy ? 'Make it messy again' : 'Tidy this sheet';
});

/* ---------- Contact form ---------- */

const form = document.querySelector('[data-form]');
const status = form?.querySelector('[data-status]');
const received = form?.querySelector('[data-done]');

function say(message) {
  status.textContent = message;
}

// Swap the form for the "I've received your email" card.
function showReceived() {
  form.classList.add('is-sent');
  received.hidden = false;
  received.focus();
}

function enquiryMailto(data) {
  const subject = `New enquiry from ${data.get('name')} (${data.get('business')})`;
  const body = [
    `Name: ${data.get('name')}`,
    `Business: ${data.get('business')}`,
    `Email: ${data.get('email')}`,
    '',
    'What’s messy right now:',
    data.get('spreadsheet'),
  ].join('\n');
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const fields = [...form.querySelectorAll('input, textarea')];
  fields.forEach((field) => field.setAttribute('aria-invalid', String(!field.checkValidity())));
  const firstInvalid = fields.find((field) => !field.checkValidity());
  if (firstInvalid) {
    say('Please fill in every field, with a valid email, so I can get back to you.');
    firstInvalid.focus();
    return;
  }

  if (!FORM_ENDPOINT) {
    window.location.href = enquiryMailto(new FormData(form));
    say(`Your email app should open with your message ready, so just press send. If nothing opens, email me at ${CONTACT_EMAIL}.`);
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  const label = button.innerHTML;
  button.disabled = true;
  button.textContent = 'Sending…';
  say('');

  try {
    const response = await fetch(FORM_ENDPOINT, { method: 'POST', body: new FormData(form) });
    const result = await response.json();
    if (!result.ok) throw new Error(result.error || 'not-sent');
    form.reset();
    showReceived();
  } catch {
    say(`Sorry, that didn’t send. Please email me at ${CONTACT_EMAIL} instead.`);
  } finally {
    button.disabled = false;
    button.innerHTML = label;
  }
});
