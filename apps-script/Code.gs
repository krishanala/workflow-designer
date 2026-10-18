/**
 * Two Loaves Studio: website enquiry handler (Google Apps Script web app)
 *
 * The contact form on the website posts here. Each enquiry is:
 *   1. saved as a row in the "Enquiries" sheet of the Google Sheet this script belongs to, and
 *   2. emailed to OWNER_EMAIL, with Reply-To set to the visitor so you can just hit Reply.
 *
 * Setup steps are in apps-script/README.md.
 */

const OWNER_EMAIL = 'krishanalathamby@gmail.com';
const SHEET_NAME = 'Enquiries';
const HEADERS = ['Received', 'Name', 'Business', 'Email', 'Spreadsheet trouble', 'Status'];
const MAX_LENGTH = { name: 100, business: 150, email: 254, spreadsheet: 3000 };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function doPost(e) {
  try {
    const params = (e && e.parameter) || {};

    // Honeypot: the hidden "website" field is invisible to people, so only bots fill it in.
    if (params.website) return json_({ ok: true });

    const enquiry = {
      name: clean_(params.name, MAX_LENGTH.name),
      business: clean_(params.business, MAX_LENGTH.business),
      email: clean_(params.email, MAX_LENGTH.email),
      spreadsheet: clean_(params.spreadsheet, MAX_LENGTH.spreadsheet),
    };

    if (!enquiry.name || !enquiry.business || !enquiry.spreadsheet || !EMAIL_PATTERN.test(enquiry.email)) {
      return json_({ ok: false, error: 'missing-fields' });
    }

    saveToSheet_(enquiry);
    emailOwner_(enquiry);
    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server' });
  }
}

// Visiting the web app URL in a browser shows this, so you can check the deployment is live.
function doGet() {
  return ContentService.createTextOutput('Two Loaves Studio enquiry form is running.');
}

// Run this once from the editor: it asks for permissions, then sends you a test enquiry.
function testEnquiry() {
  const result = doPost({
    parameter: {
      name: 'Test Person',
      business: 'Test Business',
      email: OWNER_EMAIL,
      spreadsheet: 'This is a test enquiry from the Apps Script editor.',
    },
  });
  console.log(result.getContent());
}

function saveToSheet_(enquiry) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const book = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = book.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = book.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([
      new Date(),
      safeCell_(enquiry.name),
      safeCell_(enquiry.business),
      safeCell_(enquiry.email),
      safeCell_(enquiry.spreadsheet),
      'New',
    ]);
  } finally {
    lock.releaseLock();
  }
}

function emailOwner_(enquiry) {
  MailApp.sendEmail({
    to: OWNER_EMAIL,
    replyTo: enquiry.email,
    name: 'Two Loaves Studio website',
    subject: `New enquiry from ${enquiry.name} (${enquiry.business})`,
    body: [
      'You have a new enquiry from the Two Loaves Studio website.',
      '',
      `Name: ${enquiry.name}`,
      `Business: ${enquiry.business}`,
      `Email: ${enquiry.email}`,
      '',
      'Which spreadsheet is causing trouble:',
      enquiry.spreadsheet,
      '',
      'Reply to this email to answer them directly. You promised a reply within 24 hours.',
    ].join('\n'),
  });
}

function clean_(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

// Stop a value like "=IMPORTXML(...)" from running as a formula when it lands in the sheet.
function safeCell_(value) {
  return /^[=+\-@]/.test(value) ? `'${value}` : value;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
