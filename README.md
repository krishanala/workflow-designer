# Workflow Designer for Google Workspace: one-page website

A one-page business site for a Google Sheets workflow and automation service for small teams in Malaysia.

**Style:** Rebus. Every section opens with a picture puzzle that visitors can tap to solve, and a counter tracks how many they've solved. The page is black and white; colour only appears inside the pictograms and symbols.

**Fonts:** Bricolage Grotesque for headings, Lato for body text (both from Google Fonts).

## Run it locally

No build step and nothing to install. From this folder:

```bash
python3 -m http.server 8100
```

Then open http://localhost:8100.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole page, including the SVG pictogram sprite at the top of `<body>` |
| `css/styles.css` | All styles. Colour tokens are on `:root` |
| `js/main.js` | Rebus puzzles and score, the "Tidy this sheet" toggle, and the contact form |
| `privacy.html` | Privacy policy page (placeholder, still to be written) |
| `favicon.svg` | Browser tab icon |

## Before you publish

Every placeholder has a dashed outline on the page so it's easy to spot. Replace:

- [ ] `[Your Brand]`: nav, page title, footer and privacy page
- [ ] `[Your Name]`: About section
- [ ] WhatsApp number: `https://wa.me/60000000000` link and `[your number]` text
- [ ] Email: `mailto:you@example.com` link and `[your email]` text
- [ ] `[SSM registration number]`: footer
- [ ] Website plus Smart Enquiry System price: `RM[set your price]`
- [ ] Your photo and one personal sentence in the About section
- [ ] The 1-minute demo video in the `#demo` frame
- [ ] The example result line ("Weekly reporting went from 5 hours to 10 minutes") with a real number after your first client
- [ ] The privacy policy text in `privacy.html`
- [ ] Check the prices. They are estimates for the Malaysian market

## Connecting the contact form

The form isn't connected to anything yet. To receive enquiries in a Google Sheet:

1. Create a Google Apps Script web app that appends the posted fields (`name`, `business`, `spreadsheet`, `whatsapp`) to a sheet.
2. Deploy it with access set to "Anyone".
3. Paste the web app URL into `FORM_ENDPOINT` at the top of `js/main.js`.

Until then, the form asks visitors to message you on WhatsApp or by email instead.

The "Book a free 20-minute call" buttons point to the contact form (`#contact`). To link them to a booking page instead, such as a Google Calendar appointment schedule, change those `href`s.

## Deploying

The site is static, so GitHub Pages can host it for free: **Settings → Pages → Deploy from a branch → `main` / root**.
