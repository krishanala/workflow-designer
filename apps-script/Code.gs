/**
 * Two Loaves Studio: client reviews (Google Apps Script web app)
 *
 * The review page (review.html) posts here. Each review is:
 *   1. saved as a row in the "Testimonials" sheet, with "Show on site" unticked, and
 *   2. emailed to OWNER_EMAIL so you know it arrived.
 *
 * The homepage asks this script for reviews. It only gets the rows you've ticked "Show on site" on,
 * in the same order as the sheet (drag rows to reorder them).
 *
 * Setup steps are in apps-script/README.md.
 */

const OWNER_EMAIL = 'krishanalathamby@gmail.com';
const SHEET_NAME = 'Testimonials';
const HEADERS = ['Received', 'Name', 'Role', 'Company', 'Review', 'Logo', 'Show on site'];
const COL = { name: 2, role: 3, company: 4, quote: 5, logo: 6, show: 7 };
const MAX_LENGTH = { name: 80, role: 80, company: 100, quote: 600, logo: 45000 };

// The logo is either an image the review page shrank for us, or a https link you paste in yourself.
const LOGO_PATTERN = /^(data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+|https:\/\/\S+)$/;

// The homepage reads approved reviews from here.
function doGet() {
  const sheet = getSheet_();
  const rows = sheet.getLastRow() > 1
    ? sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getValues()
    : [];

  const testimonials = rows
    .filter((row) => row[COL.show - 1] === true && row[COL.quote - 1])
    .map((row) => ({
      name: String(row[COL.name - 1]),
      role: String(row[COL.role - 1]),
      company: String(row[COL.company - 1]),
      quote: String(row[COL.quote - 1]),
      logo: LOGO_PATTERN.test(row[COL.logo - 1]) ? String(row[COL.logo - 1]) : '',
    }));

  return json_({ testimonials });
}

// The review page sends new reviews here.
function doPost(e) {
  try {
    const params = (e && e.parameter) || {};

    // Honeypot: the hidden "website" field is invisible to people, so only bots fill it in.
    if (params.website) return json_({ ok: true });

    const review = {
      name: clean_(params.name, MAX_LENGTH.name),
      role: clean_(params.role, MAX_LENGTH.role),
      company: clean_(params.company, MAX_LENGTH.company),
      quote: clean_(params.quote, MAX_LENGTH.quote),
      logo: String(params.logo || ''),
    };
    if (review.logo.length > MAX_LENGTH.logo || !LOGO_PATTERN.test(review.logo)) review.logo = '';

    if (!review.name || !review.company || !review.quote) {
      return json_({ ok: false, error: 'missing-fields' });
    }

    const sheet = getSheet_();
    sheet.appendRow([new Date(), review.name, review.role, review.company, review.quote, review.logo, false]);
    sheet.getRange(sheet.getLastRow(), COL.show).insertCheckboxes();

    emailOwner_(review);
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server' });
  }
}

// Run this once from the editor: it asks for permissions and adds a test review (unticked).
function testReview() {
  const result = doPost({
    parameter: {
      name: 'Test Person',
      role: 'Manager',
      company: 'Test Company',
      quote: 'This is a test review from the Apps Script editor. Delete this row when you’re done.',
    },
  });
  console.log(result.getContent());
}

function getSheet_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(COL.quote, 420);
    sheet.setColumnWidth(COL.logo, 120);
  }
  return sheet;
}

function emailOwner_(review) {
  const sheetUrl = SpreadsheetApp.getActiveSpreadsheet().getUrl();
  const from = review.role ? `${review.name}, ${review.role} at ${review.company}` : `${review.name}, ${review.company}`;
  MailApp.sendEmail({
    to: OWNER_EMAIL,
    subject: `New review from ${review.name} (${review.company})`,
    body: [
      `${from} left a review:`,
      '',
      review.quote,
      '',
      review.logo ? 'They added a logo.' : 'No logo (the card will show their initials).',
      '',
      `To show it on the website, tick "Show on site" in the sheet:`,
      sheetUrl,
    ].join('\n'),
  });
}

function clean_(value, maxLength) {
  return String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
