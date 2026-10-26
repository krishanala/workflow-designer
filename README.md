# Two Loaves Studio: one-page website

A one-page business site for Two Loaves Studio, a Google Sheets workflow and automation service for small teams in Malaysia.

Live at https://krishanala.github.io/workflow-designer/

**Style:** Rebus. Every section opens with a picture puzzle that visitors can tap to solve, and a counter tracks how many they've solved. The page is black and white; colour only appears inside the pictograms and symbols.

**Fonts:** Bricolage Grotesque for headings, Lato for body text (both from Google Fonts).

**Logo:** two smiling loaves, the big one with its crust scored like a spreadsheet grid. It lives as the `#mark` symbol in the sprite in `index.html`, and as `favicon.svg`.

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
| `apps-script/` | Google Apps Script that emails each enquiry to you and saves it to a Sheet, plus its setup guide |
| `privacy.html` | Privacy policy (PDPA notice) in English and Bahasa Malaysia |
| `case-study-clinic-booking.html` | Case study: WhatsApp bookings to a shared Google Calendar, linked from the About section |
| `images/founder.webp` | Photo in the About section |
| `favicon.svg` | Browser tab icon |

## Still to fill in

Every placeholder has a dashed outline on the page so it's easy to spot. Replace:

- [ ] Your SSM registration number in the footer, once you have it
- [ ] The clinic booking case study's placeholders: no-show and hours-saved numbers, how patients confirm or cancel, and a quote from the clinic
- [ ] Optional: the languages you work in, in the About section
- [ ] Optional: add a number to the clinic result in "What changes for your team" if you measure one (for example, how many check-in messages a week it saved)
- [ ] Check the privacy policy matches how you actually work (two-step verification on, retention periods, free access requests), and have the Bahasa Malaysia version read by a fluent speaker
- [ ] Set up the enquiry form's Google Apps Script ([`apps-script/README.md`](apps-script/README.md)) and paste its URL into `FORM_ENDPOINT`
- [ ] If you change any service the site uses, update `privacy.html` and its "Last updated" date
- [ ] Check the prices. They are estimates for the Malaysian market

## Connecting the contact form

Enquiries are sent in the background by a Google Apps Script in your Google account (`apps-script/Code.gs`). It emails each one to krishanalathamby@gmail.com and saves it to an **Enquiries** sheet. The visitor then sees a "Thank you, I've received your email! I'll get back to you within 24 hours." card.

Setup: follow [`apps-script/README.md`](apps-script/README.md), then paste the web app URL into `FORM_ENDPOINT` at the top of `js/main.js`.

While `FORM_ENDPOINT` is empty, submitting the form opens the visitor's email app instead, with the enquiry addressed to `CONTACT_EMAIL`.

The "Talk to me" buttons point to the contact form (`#contact`). To link them to a booking page instead, such as a Google Calendar appointment schedule, change those `href`s.

## Deploying

The site is static, so GitHub Pages can host it for free: **Settings → Pages → Deploy from a branch → `main` / root**.
