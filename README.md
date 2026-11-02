# Two Loaves Studio: website

A short one-page site for Two Loaves Studio, a design-and-build studio for small teams in Malaysia.

Live at https://krishanala.github.io/workflow-designer/

**Style:** white page, ink type and one orange accent. Colour tokens are on `:root` in `css/styles.css`.

**Fonts:** Bricolage Grotesque for headings, Lato for body text (both from Google Fonts).

**Logo:** two smiling loaves. It lives as the `#mark` symbol in the sprite at the top of each page, and as `favicon.svg`.

## The page

1. **Hero:** what the studio does, with the founder photo and a **Contact us** button.
2. **Services:** four cards. UI/UX design, Web development and Google Workspace, plus a fourth "Coming soon" placeholder (the last `<li class="service service--soon">` in `index.html`).
3. **Testimonials:** client reviews as cards, each with the client's logo beside their review. It stays hidden until there's at least one approved review. See [Client reviews](#client-reviews).
4. **About:** a short intro with links to the design portfolio and the clinic case study.
5. **Contact:** a **Contact us** button.

Every **Contact us** button opens the Google Calendar booking page (https://calendar.app.google/YWKjsHaXESSNEb7WA) in a new tab. To use a different schedule, replace that link in `index.html` (it appears three times).

## Client reviews

Send clients the review page: https://krishanala.github.io/workflow-designer/review.html

Reviews are saved to a Google Sheet. You tick the ones to show, and they appear on the homepage. One-time setup: [`apps-script/README.md`](apps-script/README.md). Until it's set up (`REVIEWS_ENDPOINT` in `js/main.js` is empty), the testimonials section stays hidden and the review page asks people to email instead.

## Run it locally

No build step and nothing to install. From this folder:

```bash
python3 -m http.server 8100
```

Then open http://localhost:8100.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The homepage, including the SVG icon sprite at the top of `<body>` |
| `review.html` | The page clients use to leave a review, with a live preview of their card |
| `css/styles.css` | All styles for every page |
| `js/main.js` | Scroll fade-ins, the testimonial cards and the review form |
| `apps-script/` | Google Apps Script that stores reviews and serves the approved ones |
| `privacy.html` | Privacy policy (PDPA notice) in English and Bahasa Malaysia |
| `case-study-clinic-booking.html` | Case study: WhatsApp bookings to a shared Google Calendar, linked from About |
| `images/founder.webp` | Photo in the hero |
| `favicon.svg` | Browser tab icon |

## Still to fill in

- [ ] The fourth service (currently "Coming soon")
- [ ] Set up client reviews ([`apps-script/README.md`](apps-script/README.md))
- [ ] The clinic booking case study's placeholders (dashed outlines): no-show and hours-saved numbers, how patients confirm or cancel, and a quote from the clinic
- [ ] Have the Bahasa Malaysia privacy policy read by a fluent speaker
- [ ] If you change any service the site uses, update `privacy.html` and its "Last updated" date

## Deploying

The site is static, so GitHub Pages can host it for free: **Settings → Pages → Deploy from a branch → `main` / root**.
