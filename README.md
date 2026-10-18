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
| `privacy.html` | Privacy policy (PDPA notice) in English and Bahasa Malaysia |
| `images/founder.webp` | Photo in the About section |
| `favicon.svg` | Browser tab icon |

## Still to fill in

Every placeholder has a dashed outline on the page so it's easy to spot. Replace:

- [ ] Your SSM registration number in the footer, once you have it
- [ ] Optional: the languages you work in, in the About section
- [ ] Optional: add a number to the clinic result in "What changes for your team" if you measure one (for example, how many check-in messages a week it saved)
- [ ] Check the privacy policy matches how you actually work (two-step verification on, retention periods, free access requests), and have the Bahasa Malaysia version read by a fluent speaker
- [ ] If you connect the form to Google Sheets or change any service the site uses, update `privacy.html` and its "Last updated" date
- [ ] Check the prices. They are estimates for the Malaysian market

## Connecting the contact form

The form isn't connected to anything yet. To receive enquiries in a Google Sheet:

1. Create a Google Apps Script web app that appends the posted fields (`name`, `business`, `email`, `spreadsheet`) to a sheet.
2. Deploy it with access set to "Anyone".
3. Paste the web app URL into `FORM_ENDPOINT` at the top of `js/main.js`.

Until then, submitting the form opens the visitor's email app with their enquiry addressed to `CONTACT_EMAIL` (krishanalathamby@gmail.com), set at the top of `js/main.js`. Every enquiry goes to that address.

The "Book a free 20-minute call" buttons point to the contact form (`#contact`). To link them to a booking page instead, such as a Google Calendar appointment schedule, change those `href`s.

## Deploying

The site is static, so GitHub Pages can host it for free: **Settings → Pages → Deploy from a branch → `main` / root**.
