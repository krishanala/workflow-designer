const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const worlds = {
  bright: document.querySelector('[data-world="bright"]'),
  dark: document.querySelector('[data-world="dark"]'),
  dev: document.querySelector('[data-world="dev"]'),
};
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/* ---------- Toast ---------- */

const toast = document.querySelector('[data-toast]');
const toastText = toast?.querySelector('[data-toast-text]');
let toastTimer = 0;

function showToast(html) {
  if (!toast) return;
  toastText.innerHTML = html;
  toast.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('is-in')));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-in'), 6000);
}

/* ---------- Rebus puzzles + score, counted per side ---------- */

const ALL_SOLVED = {
  bright: '<strong>All bright-side puzzles solved.</strong> Now drag the handle and see the other side.',
  dark: '<strong>All puzzles solved.</strong> Imagine what we could do with your spreadsheet.',
  dev: '<strong>All puzzles solved.</strong> You’d make a great product owner.',
};

Object.entries(worlds).forEach(([name, world]) => {
  const puzzles = [...world.querySelectorAll('.rebus')];
  const scoreEls = world.querySelectorAll('[data-score]');
  const solved = new Set();
  let celebrated = false;

  world.querySelectorAll('[data-total]').forEach((el) => { el.textContent = puzzles.length; });

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
      if (solved.size === puzzles.length && !celebrated) {
        celebrated = true;
        showToast(ALL_SOLVED[name]);
      }
    });
  });
});

/* ---------- Which side is showing ---------- */

const skip = document.querySelector('[data-skip]');
const themeColor = document.querySelector('meta[name="theme-color"]');
const SIDE_INFO = {
  bright: { main: '#b-main', hash: '', color: '#ffffff' },
  dark: { main: '#main', hash: '#dark-side', color: '#0a0a0a' },
  dev: { main: '#dev-main', hash: '#build', color: '#ff6a1f' },
};

// Only the side on screen can be reached by keyboard and screen readers.
function setSide(side, { keepHash = false } = {}) {
  root.dataset.side = side;
  Object.entries(worlds).forEach(([name, world]) => { world.inert = name !== side; });
  skip.setAttribute('href', SIDE_INFO[side].main);
  themeColor.setAttribute('content', SIDE_INFO[side].color);
  if (!keepHash) history.replaceState(null, '', SIDE_INFO[side].hash || location.pathname + location.search);
  syncKnob();
  syncBubble();
  syncLog();
}

/* ---------- The handle between the bright and dark sides ---------- */

const knob = document.querySelector('[data-knob]');
const peek = document.querySelector('[data-peek]');
const rest = () => (window.innerWidth <= 760 ? 0.84 : 0.75); // matches --sliver in the CSS
const width = () => root.clientWidth;

let frac = root.dataset.side === 'dark' ? 0 : rest(); // handle position, 0 (all dark) to 1 (all bright)
let slideRaf = 0;
let dragging = null;
let interacted = false;

function paint() {
  root.style.setProperty('--split', `${(frac * width()).toFixed(1)}px`);
  knob.setAttribute('aria-valuenow', String(Math.round(frac * 100)));
}

function syncKnob() {
  knob.setAttribute('aria-valuetext', root.dataset.side === 'dark' ? 'Dark side' : 'Bright side');
}

function stopSlide() {
  cancelAnimationFrame(slideRaf);
  slideRaf = 0;
}

const easeOut = (t) => 1 - (1 - t) ** 3;

function slideTo(to, done, duration) {
  stopSlide();
  const from = frac;
  if (reduceMotion.matches || from === to) {
    frac = to;
    paint();
    done?.();
    return;
  }
  const ms = duration ?? clamp(Math.abs(to - from) * 1100, 260, 820);
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / ms);
    frac = from + (to - from) * easeOut(t);
    paint();
    if (t < 1) slideRaf = requestAnimationFrame(step);
    else { slideRaf = 0; done?.(); }
  };
  slideRaf = requestAnimationFrame(step);
}

function settle(side) {
  slideTo(side === 'dark' ? 0 : rest(), () => {
    if (root.dataset.side !== side) setSide(side);
  });
}

function goSide(side) {
  markInteracted();
  if (window.scrollY > 4) window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  settle(side);
}

function markInteracted() {
  interacted = true;
  root.classList.add('has-slid');
}

knob.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  event.preventDefault();
  markInteracted();
  stopSlide();
  knob.setPointerCapture(event.pointerId);
  dragging = { x: event.clientX, frac, moved: false };
  root.classList.add('is-dragging');
});

knob.addEventListener('pointermove', (event) => {
  if (!dragging) return;
  const dx = event.clientX - dragging.x;
  if (Math.abs(dx) > 4) dragging.moved = true;
  frac = clamp(dragging.frac + dx / width(), 0, rest() + 0.03);
  paint();
});

function endDrag() {
  if (!dragging) return;
  const { moved } = dragging;
  dragging = null;
  root.classList.remove('is-dragging');
  if (!moved) settle(root.dataset.side === 'dark' ? 'bright' : 'dark'); // a tap flips sides
  else settle(frac < 0.5 ? 'dark' : 'bright');
}

knob.addEventListener('pointerup', endDrag);
knob.addEventListener('pointercancel', endDrag);
knob.addEventListener('lostpointercapture', endDrag);

knob.addEventListener('keydown', (event) => {
  const side = root.dataset.side;
  let next = null;
  if (event.key === 'ArrowLeft' || event.key === 'Home') next = 'dark';
  else if (event.key === 'ArrowRight' || event.key === 'End') next = 'bright';
  else if (event.key === 'Enter' || event.key === ' ') next = side === 'dark' ? 'bright' : 'dark';
  if (!next) return;
  event.preventDefault();
  markInteracted();
  settle(next);
});

// The strip of dark side on the right: hovering leans the handle in, clicking slides over.
peek.addEventListener('click', () => goSide('dark'));
peek.addEventListener('pointerenter', (event) => {
  if (event.pointerType === 'mouse' && !slideRaf) slideTo(rest() - 0.025, null, 260);
});
peek.addEventListener('pointerleave', (event) => {
  if (event.pointerType === 'mouse' && root.dataset.side === 'bright' && !dragging) slideTo(rest(), null, 260);
});

document.querySelectorAll('[data-go-dark]').forEach((button) => button.addEventListener('click', () => goSide('dark')));
document.querySelectorAll('[data-go-bright]').forEach((button) => button.addEventListener('click', () => goSide('bright')));

window.addEventListener('resize', () => {
  if (dragging || slideRaf) return;
  frac = root.dataset.side === 'dark' ? 0 : rest();
  paint();
});

// Until someone touches the handle, the dark side leans in every few seconds to show it moves.
setInterval(() => {
  if (interacted || dragging || slideRaf || document.hidden || reduceMotion.matches) return;
  if (root.dataset.side !== 'bright') return;
  slideTo(rest() - 0.05, () => setTimeout(() => {
    if (!interacted && !dragging && root.dataset.side === 'bright') slideTo(rest(), null, 700);
  }, 220), 520);
}, 6500);

/* ---------- The floating bubble on the dark side ---------- */

const bubble = document.querySelector('[data-bubble]');
const ripple = document.querySelector('[data-ripple]');
let bubbleRaf = 0;
let bubbleClock = Math.random() * 60;
let bubbleLast = 0;
let bubblePaused = false;
let bubblePos = { x: 0, y: 0 };

function moveBubble(now) {
  const dt = bubbleLast ? Math.min(64, now - bubbleLast) : 16;
  bubbleLast = now;
  if (!bubblePaused) bubbleClock += dt / 1000;
  const t = bubbleClock;
  const size = bubble.offsetWidth;
  const top = 84;
  const maxX = Math.max(16, window.innerWidth - size - 16);
  const maxY = Math.max(top, window.innerHeight - size - 16);
  // Two slow waves on each axis give a lazy, never-repeating drift around the screen.
  const nx = 0.5 + 0.32 * Math.sin(t * 0.23 + 1.3) + 0.16 * Math.sin(t * 0.53);
  const ny = 0.5 + 0.3 * Math.sin(t * 0.19) + 0.18 * Math.sin(t * 0.41 + 2.1);
  bubblePos = { x: 16 + clamp(nx, 0, 1) * (maxX - 16), y: top + clamp(ny, 0, 1) * (maxY - top) };
  bubble.style.transform = `translate(${bubblePos.x.toFixed(1)}px, ${bubblePos.y.toFixed(1)}px)`;
  bubbleRaf = requestAnimationFrame(moveBubble);
}

function syncBubble() {
  const show = root.dataset.side === 'dark';
  cancelAnimationFrame(bubbleRaf);
  bubbleRaf = 0;
  bubbleLast = 0;
  bubble.getAnimations().forEach((animation) => animation.cancel());
  bubble.hidden = !show;
  if (!show) return;
  if (reduceMotion.matches) {
    bubble.style.transform = '';
    return;
  }
  bubbleRaf = requestAnimationFrame(moveBubble);
}

bubble.addEventListener('pointerenter', () => { bubblePaused = true; });
bubble.addEventListener('pointerleave', () => { bubblePaused = false; });
bubble.addEventListener('focus', () => { bubblePaused = true; });
bubble.addEventListener('blur', () => { bubblePaused = false; });
bubble.addEventListener('click', () => {
  const rect = bubble.getBoundingClientRect();
  openDev(rect.left + rect.width / 2, rect.top + rect.height / 2);
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(bubbleRaf); bubbleRaf = 0; bubbleLast = 0; }
  else if (root.dataset.side === 'dark' && !bubbleRaf && !reduceMotion.matches) bubbleRaf = requestAnimationFrame(moveBubble);
});

/* ---------- Into the build department and back ---------- */

const reach = (x, y) => Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 8;

// Rings that run out from (x, y). The first is the dark outline of the orange edge itself.
function waves(x, y, radius, duration) {
  const rings = [
    { cls: 'wave', delay: 0, ms: duration, size: radius * 2 },
    { cls: 'wave wave--glow', delay: 60, ms: duration * 0.8, size: radius * 2.2 },
    { cls: 'wave wave--glow', delay: 200, ms: duration * 0.9, size: radius * 2.4 },
  ];
  rings.forEach((ring) => {
    const el = document.createElement('span');
    el.className = ring.cls;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    ripple.append(el);
    el.animate(
      [{ width: '0px', height: '0px', opacity: 1 }, { width: `${ring.size}px`, height: `${ring.size}px`, opacity: ring.cls === 'wave' ? 1 : 0 }],
      { duration: ring.ms, delay: ring.delay, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'backwards' },
    ).onfinish = () => el.remove();
  });
}

// The bubble swells, blurs and bursts into sparks.
function dissolve(x, y) {
  bubblePaused = true;
  cancelAnimationFrame(bubbleRaf);
  bubbleRaf = 0;
  const from = bubble.style.transform || 'none';
  bubble.animate(
    [{ transform: `${from} scale(1)`, opacity: 1, filter: 'blur(0px)' }, { transform: `${from} scale(1.7)`, opacity: 0, filter: 'blur(14px)' }],
    { duration: 480, easing: 'cubic-bezier(.2,.7,.3,1)', fill: 'forwards' },
  );
  const colours = ['#ff6a1f', '#ffc21a', '#fff4e8', '#ff4f36'];
  for (let i = 0; i < 18; i += 1) {
    const spark = document.createElement('span');
    spark.className = 'spark';
    spark.style.left = `${x}px`;
    spark.style.top = `${y}px`;
    spark.style.background = colours[i % colours.length];
    ripple.append(spark);
    const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.3;
    const distance = 90 + Math.random() * 110;
    spark.animate(
      [{ transform: 'translate(0, 0) scale(1)', opacity: 1 }, { transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`, opacity: 0.4 }],
      { duration: 650 + Math.random() * 250, easing: 'cubic-bezier(.1,.8,.3,1)' },
    ).onfinish = () => spark.remove();
  }
}

let moving = false;

function openDev(x, y) {
  if (moving || root.dataset.side === 'dev') return;
  const dev = worlds.dev;
  dev.scrollTop = 0;
  if (reduceMotion.matches) { setSide('dev'); dev.querySelector('h1').focus?.(); return; }
  moving = true;
  const radius = reach(x, y);
  const duration = 1000;
  dissolve(x, y);
  dev.classList.add('is-moving');
  waves(x, y, radius, duration);
  const grow = dev.animate(
    [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${radius}px at ${x}px ${y}px)` }],
    { duration, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'forwards' },
  );
  grow.onfinish = () => {
    setSide('dev');
    dev.classList.remove('is-moving');
    grow.cancel();
    moving = false;
    focusTop(dev);
  };
}

// Back to the Google automations site, as it first opens: the bright side with the handle at rest.
function closeDev(from) {
  if (moving || root.dataset.side !== 'dev') return;
  const dev = worlds.dev;
  const rect = from.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  stopSlide();
  frac = rest();
  paint();
  if (reduceMotion.matches) { setSide('bright'); window.scrollTo(0, 0); focusTop(worlds.bright); return; }
  moving = true;
  dev.classList.add('is-moving');
  setSide('bright');
  window.scrollTo(0, 0);
  const radius = reach(x, y);
  const shrink = dev.animate(
    [{ clipPath: `circle(${radius}px at ${x}px ${y}px)` }, { clipPath: `circle(0px at ${x}px ${y}px)` }],
    { duration: 850, easing: 'cubic-bezier(.65,0,.25,1)', fill: 'forwards' },
  );
  shrink.onfinish = () => {
    dev.classList.remove('is-moving');
    shrink.cancel();
    moving = false;
    focusTop(worlds.bright);
  };
}

function focusTop(world) {
  const heading = world.querySelector('h1');
  heading.setAttribute('tabindex', '-1');
  heading.focus({ preventScroll: true });
}

document.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', () => closeDev(button)));

/* ---------- Supercharge this sheet ---------- */

const sheet = document.querySelector('[data-sheet]');
const tidyBtn = document.querySelector('[data-tidy]');
const tidyLabel = document.querySelector('[data-tidy-label]');
const hoursEl = document.querySelector('[data-hours]');
const MANUAL_MINUTES = 315;
let countRaf = 0;

const formatMinutes = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` : `${m} min`);

function countTo(target) {
  cancelAnimationFrame(countRaf);
  const from = parseInt(hoursEl.dataset.minutes ?? MANUAL_MINUTES, 10);
  const start = performance.now();
  const ms = reduceMotion.matches ? 0 : 1200;
  const step = (now) => {
    const t = ms ? Math.min(1, (now - start) / ms) : 1;
    const value = Math.round(from + (target - from) * easeOut(t));
    hoursEl.dataset.minutes = value;
    hoursEl.textContent = formatMinutes(value);
    if (t < 1) countRaf = requestAnimationFrame(step);
  };
  countRaf = requestAnimationFrame(step);
}

tidyBtn?.addEventListener('click', () => {
  const on = sheet.classList.toggle('is-tidy');
  tidyBtn.setAttribute('aria-pressed', String(on));
  tidyLabel.textContent = on ? 'Back to manual' : 'Supercharge this sheet';
  countTo(on ? 0 : MANUAL_MINUTES);
  syncLog();
});

/* ---------- Live log under the sheet (an illustration, not real data) ---------- */

const log = document.querySelector('[data-log]');
const logLines = document.querySelector('[data-log-lines]');
const LOG = [
  ['onFormSubmit', 'New enquiry from Aisyah → row 214 → reply sent'],
  ['onEdit', 'Order #1087 marked paid → receipt emailed'],
  ['every Monday 08:00', 'Weekly report built → sent to 4 people'],
  ['onFormSubmit', 'New client “Tan & Co” → folder and 6 templates created'],
  ['every day 18:00', '12 reminders sent for tomorrow’s appointments'],
  ['every day 09:00', 'Invoice #392 is 7 days late → polite nudge sent'],
  ['onChange', 'Kaya jar 250g below 10 in stock → alert sent'],
];
let logTimer = 0;
let logIndex = 0;
let logVisible = false;

function addLogLine() {
  const [trigger, text] = LOG[logIndex % LOG.length];
  logIndex += 1;
  const li = document.createElement('li');
  const time = document.createElement('time');
  time.textContent = new Date().toLocaleTimeString('en-GB');
  const b = document.createElement('b');
  b.textContent = `⚡ ${trigger}`;
  li.append(time, b, text);
  logLines.append(li);
  while (logLines.children.length > 5) logLines.firstElementChild.remove();
}

function syncLog() {
  const on = sheet?.classList.contains('is-tidy') && root.dataset.side === 'dark' && logVisible;
  log.hidden = !sheet?.classList.contains('is-tidy');
  clearInterval(logTimer);
  logTimer = 0;
  if (!on) return;
  if (!logLines.children.length) addLogLine();
  logTimer = setInterval(addLogLine, reduceMotion.matches ? 4000 : 1600);
}

log.hidden = true;
new IntersectionObserver(([entry]) => { logVisible = entry.isIntersecting; syncLog(); }).observe(sheet);

/* ---------- Pick your pain (build department) ---------- */

const PAINS = [
  {
    pain: 'Customers keep asking “where’s my order?”',
    title: 'An order tracker your customers check themselves',
    body: 'A small portal: they type in their order number, see exactly where it is, and get an email at every step. Your phone goes quiet by lunchtime.',
    tags: ['Customer portal', 'Status emails', 'Admin screen'],
  },
  {
    pain: 'Our bookings live in WhatsApp and someone’s memory.',
    title: 'A booking system with a brain',
    body: 'Online booking with real availability, deposits if you want them, reminders before every slot, and one calendar your whole team can see.',
    tags: ['Booking page', 'Payments', 'Reminders', 'Staff calendar'],
  },
  {
    pain: 'We copy the same data between four apps.',
    title: 'Glue. Lots of lovely glue.',
    body: 'We connect the apps you already use so data moves by itself. Type it once and it shows up everywhere it should, with an alert if anything fails.',
    tags: ['API integrations', 'Webhooks', 'Sync jobs', 'Error alerts'],
  },
  {
    pain: 'Our website looks like it’s from 2009.',
    title: 'A website that actually brings in work',
    body: 'Fast, gorgeous on a phone, findable on Google, and wired to an enquiry tracker so no lead dies in an inbox.',
    tags: ['Design', 'Build', 'SEO basics', 'Enquiry tracker'],
  },
  {
    pain: 'Quotes take two days and three people.',
    title: 'A quote builder',
    body: 'Pick the items, the price works itself out, a branded PDF goes to the client, and they accept with one click. Follow-ups chase themselves.',
    tags: ['Quote builder', 'PDF generation', 'One-click accept', 'Follow-ups'],
  },
  {
    pain: 'Our “system” is one spreadsheet only Ahmad understands.',
    title: 'An internal tool the whole team can use',
    body: 'We turn the mega-spreadsheet into a proper app: logins, roles, forms that can’t be filled in wrong, and a history of who changed what. Ahmad can finally take leave.',
    tags: ['Web app', 'User roles', 'Audit trail', 'Data migration'],
  },
  {
    pain: 'Nobody knows the real numbers until month-end.',
    title: 'A live dashboard',
    body: 'Every number you care about on one screen, updated as it happens. Month-end becomes a formality instead of a fire drill.',
    tags: ['Data pipeline', 'Dashboard', 'Alerts', 'Access by role'],
  },
];

const rx = document.querySelector('[data-rx]');
if (rx) {
  const pains = rx.querySelector('[data-rx-pains]');
  const card = rx.querySelector('.rx__card');
  const title = rx.querySelector('[data-rx-title]');
  const body = rx.querySelector('[data-rx-body]');
  const tags = rx.querySelector('[data-rx-tags]');

  const show = (index, animate) => {
    const item = PAINS[index];
    pains.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    title.textContent = item.title;
    body.textContent = item.body;
    tags.replaceChildren(...item.tags.map((tag) => Object.assign(document.createElement('li'), { textContent: tag })));
    if (animate) {
      card.classList.remove('is-new');
      void card.offsetWidth; // restart the pop-in
      card.classList.add('is-new');
    }
  };

  PAINS.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'rx__pain';
    button.textContent = item.pain;
    button.addEventListener('click', () => show(index, true));
    pains.append(button);
  });
  show(0, false);
}

/* ---------- Start ---------- */

setSide(root.dataset.side, { keepHash: true });
paint();

// A link straight to a section on the dark side or in the build department lands on it.
const target = location.hash && document.getElementById(location.hash.slice(1));
if (target && !['dark-side', 'build', 'b-top'].includes(target.id)) requestAnimationFrame(() => target.scrollIntoView());
