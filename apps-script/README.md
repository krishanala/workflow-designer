# Setting up client reviews

The testimonials on the homepage come from a Google Sheet in your own account. A small Google Apps Script sits in front of it:

- **Clients** fill in the review page (`review.html`). Their review lands as a new row in a **Testimonials** sheet, and you get an email.
- **You** tick **Show on site** on the reviews you want to publish.
- **The homepage** asks the script for ticked reviews and shows them as cards. Until at least one is ticked, the testimonials section shows placeholder cards.

Nothing appears on the website until you tick it, so spam or a review with a typo never goes live by accident.

Setup takes about 5 minutes and you only do it once.

## 1. Create the Sheet

1. Go to [sheets.new](https://sheets.new) while signed in as krishanalathamby@gmail.com.
2. Name it something like **Two Loaves Studio: Testimonials**.

## 2. Add the script

1. In the Sheet, open **Extensions → Apps Script**.
2. Delete the sample `function myFunction() {}` code.
3. Paste in everything from [`Code.gs`](Code.gs).
4. Click **Save** (the disk icon). You can name the project **Reviews**.

## 3. Give it permission and add a test review

1. In the toolbar's function menu, choose **testReview**, then click **Run**.
2. Google asks for permission. Click **Review permissions** and choose your account.
3. You'll see "Google hasn't verified this app". That's normal for your own script. Click **Advanced**, then **Go to Reviews (unsafe)**, then **Allow**.
4. Check two things:
   - your Sheet now has a **Testimonials** tab with a test row
   - your inbox has a "New review from Test Person (Test Company)" email

Delete the test row afterwards.

## 4. Publish it as a web app

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description:** Website reviews
   - **Execute as:** Me (krishanalathamby@gmail.com)
   - **Who has access:** Anyone
4. Click **Deploy**, then copy the **Web app URL**. It looks like `https://script.google.com/macros/s/…/exec`.

"Anyone" only means the website can send reviews to it and read the ones you've ticked. Nobody can see your Sheet, unticked reviews or your emails.

## 5. Connect it to the website

Paste the URL into `REVIEWS_ENDPOINT` at the top of `js/main.js`:

```js
const REVIEWS_ENDPOINT = 'https://script.google.com/macros/s/…/exec';
```

Then commit and push. (Or just send the URL to Claude.)

## Collecting reviews

Send clients this link: **https://krishanala.github.io/workflow-designer/review.html**

They enter their name, role, company, logo and review, and see a live preview of their card as they type. When you get the email:

1. Open the Sheet and read the review.
2. Fix any typos if you like (and let the client know).
3. Tick **Show on site**. It appears on the homepage the next time someone loads it.

**Order:** cards show in the same order as the rows. Drag rows up or down to change it.

**Logos:** the review page shrinks the logo and stores it in the **Logo** cell as text starting with `data:image/…`. To use a different logo, paste a `https://` link to an image into that cell instead. With no logo, the card shows the company's initials on an orange square.

**Removing a review:** untick it to hide it, or delete the row.

## Changing the script later

Edit the code, then **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. The URL stays the same, so the website doesn't need changing.

## Good to know

- **Spam:** the review form has a hidden field that only bots fill in. The script quietly ignores those. Anything else waits unticked until you approve it.
- **Limits:** a free Gmail account can send about 100 notification emails a day, which is plenty.
- **Privacy:** clients tick a box agreeing to their name, role, company, logo and review being shown. If someone asks for theirs to be removed, delete the row. The privacy policy covers this.
