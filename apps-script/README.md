# Setting up the website's enquiry form

The contact form sends each enquiry to a small Google Apps Script that runs in your own Google account. The script:

- emails the enquiry to krishanalathamby@gmail.com, with Reply-To set to the visitor, so you can reply straight away
- saves it as a row in an **Enquiries** sheet, so you have a lead tracker as well

The visitor never sees an email app. They press send and get a "Thank you, I've received your email! I'll get back to you within 24 hours." card.

Setup takes about 5 minutes and you only do it once.

## 1. Create the Sheet

1. Go to [sheets.new](https://sheets.new) while signed in as krishanalathamby@gmail.com.
2. Name it something like **Two Loaves Studio: Enquiries**.

## 2. Add the script

1. In the Sheet, open **Extensions → Apps Script**.
2. Delete the sample `function myFunction() {}` code.
3. Paste in everything from [`Code.gs`](Code.gs).
4. Click **Save** (the disk icon). You can name the project **Enquiry form**.

## 3. Give it permission and send a test

1. In the toolbar's function menu, choose **testEnquiry**, then click **Run**.
2. Google asks for permission. Click **Review permissions** and choose your account.
3. You'll see "Google hasn't verified this app". That's normal for your own script. Click **Advanced**, then **Go to Enquiry form (unsafe)**, then **Allow**.
4. Check two things:
   - your inbox has a "New enquiry from Test Person (Test Business)" email
   - your Sheet now has an **Enquiries** tab with a test row

You can delete the test row afterwards.

## 4. Publish it as a web app

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description:** Website form
   - **Execute as:** Me (krishanalathamby@gmail.com)
   - **Who has access:** Anyone
4. Click **Deploy**, then copy the **Web app URL**. It looks like `https://script.google.com/macros/s/…/exec`.

"Anyone" only means the website can send enquiries to it. Nobody can see your Sheet or your emails.

## 5. Connect it to the website

Paste the URL into `FORM_ENDPOINT` at the top of `js/main.js`:

```js
const FORM_ENDPOINT = 'https://script.google.com/macros/s/…/exec';
```

Then commit and push. (Or just send the URL to Claude.)

## Changing the script later

Edit the code, then **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**. The URL stays the same, so the website doesn't need changing.

## Good to know

- **Spam:** the form has a hidden field that only bots fill in. The script quietly ignores those submissions.
- **Limits:** a free Gmail account can send about 100 of these emails a day, which is plenty for a contact form.
- **Privacy:** enquiries are stored in your Gmail and this Sheet. The privacy policy already says so. Delete enquiries that don't become projects within 12 months, as the policy promises.
