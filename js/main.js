// Every enquiry goes to this address.
const CONTACT_EMAIL = 'krishanalathamby@gmail.com';

// Optional: paste a Google Apps Script web app URL here to receive enquiries in a Google Sheet.
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

puzzles.forEach((puzzle) => {
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

function say(message) {
  status.textContent = message;
}

function enquiryMailto(data) {
  const subject = `New enquiry from ${data.get('name')} (${data.get('business')})`;
  const body = [
    `Name: ${data.get('name')}`,
    `Business: ${data.get('business')}`,
    `Email: ${data.get('email')}`,
    '',
    'Which spreadsheet is causing trouble:',
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

  try {
    await fetch(FORM_ENDPOINT, { method: 'POST', body: new FormData(form), mode: 'no-cors' });
    form.reset();
    fields.forEach((field) => field.removeAttribute('aria-invalid'));
    say('Thanks! Your message is on its way. I’ll be in touch soon.');
  } catch {
    say(`Sorry, that didn’t send. Please email me at ${CONTACT_EMAIL} instead.`);
  } finally {
    button.disabled = false;
    button.innerHTML = label;
  }
});
