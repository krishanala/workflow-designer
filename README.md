# Two Loaves Studio: one-page website

A one-page business site for Two Loaves Studio, a Google Sheets workflow and automation service for small teams in Malaysia.

Live at https://krishanala.github.io/workflow-designer/

**Style:** Rebus. Every section opens with a picture puzzle that visitors can tap to solve, and a counter tracks how many they've solved. The page is black and white; colour only appears inside the pictograms and symbols.

**Three sides, one body:** the page has three personalities that share every component and only swap colour tokens.

1. **Bright side** (white, shown first): how most teams use Google, done by hand.
2. **Dark side** (black): Google supercharged with Apps Script. Drag the handle on the right (or click the dark strip) to slide over. Links to dark-side sections, like `index.html#pricing`, open it directly.
3. **Build department** (orange): websites, web apps and portals. Click the floating bubble on the dark side; the orange world ripples out from it. `index.html#build` opens it directly. Its case studies are under construction for now.

Each side has its own puzzles and score. Pictograms take their "white" from `--w`, so they invert on the dark side.

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
| `js/main.js` | Rebus puzzles and score, the slider between the sides, the bubble transition and the "Tidy this sheet" toggle |
| `apps-script/` | Google Apps Script for the old enquiry form. The page no longer uses it; it's kept in case a form comes back |
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
- [ ] If you change any service the site uses, update `privacy.html` and its "Last updated" date
- [ ] Check the prices. They are estimates for the Malaysian market

## Booking calls

Both contact sections (dark side `#contact`, build department `#dev-contact`) embed the Google Calendar appointment schedule "Let's Connect ~ Two Loaves Studio" in an iframe. Visitors pick a slot without leaving the page and Google sends the invite.

To use a different schedule: in Google Calendar, open the appointment schedule → **Share** → **Website embed**, copy the `src` URL (it ends in `?gv=true`) and replace both `<iframe src>` values in `index.html`. Update the "Open the booking page" links next to them with the schedule's short link too.

The "Switch it on" and "Let's build" buttons point to those sections.

## Deploying

The site is static, so GitHub Pages can host it for free: **Settings → Pages → Deploy from a branch → `main` / root**.
