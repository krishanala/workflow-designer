# Two Loaves Studio: website

A small site for Two Loaves Studio, a design and engineering studio in Malaysia run by Krisha (UI/UX design) and Deepak (full-stack development).

Live at https://krishanala.github.io/workflow-designer/

**Style:** Rebus. Every section opens with a picture puzzle that visitors tap to solve, and a counter in the menu tracks how many they've solved. The page is white with bold ink outlines and hard shadows, and orange is the accent. Anything filled orange (buttons, the contact card, the principle numbers, testimonial initials and the demo's picked states) has white text and a soft glowing orange outline (`--glow-edge` and `--glow`) instead of the ink outline. Other colours only appear inside the puzzle pictograms and the About us page. Tokens are on `:root` in `css/styles.css`.

**Fonts:** Bricolage Grotesque for headings, Lato for body text (both from Google Fonts).

**Logo:** two smiling loaves. It lives as the `#mark` symbol in the sprite at the top of each page, and as `favicon.svg`.

## The page

The order follows "explain, prove, ask": name the problems, say what we do and how we work, then ask for a call.

1. **Hero:** a full-width photo across the top (a placeholder for now), with what the studio does centred below it.
2. **Problems:** six problems growing businesses run into, each saying which service fixes it, with a link down to Services.
3. **Services:** four cards, each tilted slightly until hovered, when it straightens and glows orange. UI/UX design, Web development and Google Workspace, plus a fourth "Coming soon" placeholder (the last `<li class="service service--soon">` in `index.html`).
4. **Guiding principles:** four principle cards, each with an image across the top. Placeholder for now: the lede and each principle's title and text have dashed outlines to replace.
5. **Testimonials:** client reviews as cards, each with the client's logo beside their review. It sits just before the contact card. Until there's at least one approved review it shows three placeholder cards with dashed outlines, so connect reviews (or remove the section) before going live. See [Client reviews](#client-reviews).
6. **Contact:** a **Contact us** button, then a footer with services, studio links and contact details.

**About us** is its own page, `about.html`, linked from the menu and the footer. It tells our story on white, like the homepage. "Two people, two paths, one studio." sits at the top, then Krisha's journey (left) and Deepak's (right) run side by side as chapters. Each of us has an accent colour: sky blue for Krisha and teal for Deepak, used for the shadow behind each portrait, the chapter dots, the role and the hobby card (`--sky`, `--teal` and their `-ink` text versions in `css/styles.css`). Each journey's dashed path draws itself as you scroll, and each lane ends with an "Off the clock" chapter of that person's hobbies. At the bottom both paths curve in to a red heart, under "Where our paths meet": that we're a couple who work together, a photo of us, the hobbies we share, our cats as "Also on the team", and a "Book a call" link. There are no puzzles or contact card on this page. On phones the journeys stack, with a dashed line between them.

**Live demo** is its own page, `demo.html`, linked from the menu and the footer. It has three tabs visitors can try, all running in the browser with nothing sent anywhere: an enquiry form that sets off a Google Workspace workflow, a booking picker, and a before/after slider of a form redesign.

**Puzzles:** the homepage has four (Problems, Services, Guiding principles, Contact), and the demo page has two. The About us page has none. Each is a `<button class="rebus">`, and its pictures are `p-*` symbols in the sprite at the top of the page. The score counts the puzzles on the page by itself, and a message pops up once they're all solved.

Every **Contact us** button opens the Google Calendar booking page (https://calendar.app.google/YWKjsHaXESSNEb7WA) in a new tab. To use a different schedule, replace that link everywhere it appears in `index.html`, `about.html` and `demo.html`.

## Client reviews

Send clients the review page: https://krishanala.github.io/workflow-designer/review.html

Reviews are saved to a Google Sheet. You tick the ones to show, and they appear on the homepage. One-time setup: [`apps-script/README.md`](apps-script/README.md). Until it's set up (`REVIEWS_ENDPOINT` in `js/main.js` is empty), the testimonials section shows placeholder cards and the review page asks people to email instead.

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
| `about.html` | The About us page |
| `demo.html` | The live demo page |
| `review.html` | The page clients use to leave a review, with a live preview of their card |
| `css/styles.css` | All styles for every page |
| `js/main.js` | Scroll fade-ins, the puzzles and score, the testimonial cards, the review form and the live demos |
| `apps-script/` | Google Apps Script that stores reviews and serves the approved ones |
| `privacy.html` | Privacy policy (PDPA notice) in English and Bahasa Malaysia |
| `case-study-clinic-booking.html` | Case study: WhatsApp bookings to a shared Google Calendar, linked from About us |
| `images/founder.webp` | Krisha's photo on the About us page |
| `images/work-*.jpg` | Thumbnails for Krisha's selected work |
| `favicon.svg` | Browser tab icon |

## Still to fill in

- [ ] The hero photo (currently a striped placeholder). Save it as `images/hero.jpg`, 2400 × 1000, and follow the comment above `hero__shot` in `index.html`
- [ ] The other photos. Each placeholder is a striped box labelled with the photo it needs and its size, and the comment above it in the HTML has the `<img>` line to swap in. Use real photos of your own work and team rather than stock:
  - `images/service-ux.jpg`, `images/service-web.jpg`, `images/service-workspace.jpg`: a screenshot of real work on each service card (1200 × 750)
  - `images/team.jpg`: the two of you working together, at the end of the About us story (1600 × 900)
  - `images/cat-1.jpg`, `images/cat-2.jpg`: your cats, shown as round photos on their team cards (600 × 600)
  - `images/deepak.webp`: Deepak's portrait, shown big at the top of his lane (a 3:4 portrait, about 1086 × 1448 like Krisha's)
- [ ] The About us story (dashed outlines in `about.html`):
  - how Krisha got into design (her Chapter 01)
  - Deepak's three chapters: how he started, a turning point, and what he builds today, plus his selected work
  - how you met and why you started the studio together, under "Where our paths meet"
  - a year and place for each chapter (the "Year · place" outlines)
  - your hobbies: Krisha's and Deepak's at the end of each lane, and the ones you share under "Where our paths meet" (the "Hobby" outlines)
  - your cats' names, and their joke job titles if you'd like different ones (copy an `<li class="cat">` for more cats)
- [ ] The guiding principles: a lede and four principles (title and a sentence or two each), plus an image for each card (`images/principle-1.jpg` to `principle-4.jpg`, 1200 × 600; the comment above each placeholder has the `<img>` line)
- [ ] The fourth service (currently "Coming soon")
- [ ] The privacy policy still speaks as Krisha alone ("I"). Update it if Deepak also handles client data
- [ ] Set up client reviews ([`apps-script/README.md`](apps-script/README.md)). Until then the homepage testimonials are placeholders
- [ ] The clinic booking case study's placeholders (dashed outlines): no-show and hours-saved numbers, how patients confirm or cancel, and a quote from the clinic
- [ ] Have the Bahasa Malaysia privacy policy read by a fluent speaker
- [ ] If you change any service the site uses, update `privacy.html` and its "Last updated" date

## Deploying

The site is static, so GitHub Pages hosts it for free. It currently deploys from the **`three-sides-v2`** branch (**Settings → Pages → Deploy from a branch → `three-sides-v2` / root**), so anything pushed there goes live within a minute or so. `main` still holds the previous version; switch the setting back to `main` to restore it.
