# North Hills Narwhals

A single-page marketing site for the North Hills Narwhals, a 35-and-over men's
baseball team forming in the North Hills of Pittsburgh. The team doesn't exist
yet, so the page explains what it is and collects founding-roster sign-ups.

Plain HTML, CSS, and vanilla JavaScript. No framework, no build step.

```
index.html      Markup and content
styles.css      Design system + layout (themed off the six brand colors)
script.js       Form submit, scroll reveals, mobile nav, FAQ
assets/         Real logo SVGs (Primary mascot, Wordmark, Monogram)
brand.md        Brand spec (colors, type, logo placement)
copy.md         Approved site copy
```

## Local preview

It's a static site, so any static file server works. From the project root:

```bash
# Python 3
python3 -m http.server 8000

# or Node, if you have it
npx serve .
```

Then open <http://localhost:8000>. Opening `index.html` directly with
`file://` mostly works too, but a server is recommended so the Google Fonts
and the `fetch()` form submit behave normally.

## Sign-up form → Google Sheet

Submissions are appended as rows to a Google Sheet via a free Google Apps Script
Web App that acts as the form endpoint. The endpoint is defined in **one place**
at the top of [`script.js`](script.js):

```js
const FORM_ENDPOINT = "https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec";
```

Until it's set, the form runs in **demo mode**: it validates, shows the inline
success state, and posts nothing.

### One-time setup (about 2 minutes)

1. Create a new Google Sheet (sheet.new).
2. In the Sheet: **Extensions → Apps Script**. Delete the starter code and paste:

   ```js
   const SHEET_NAME = 'Signups';

   function doPost(e) {
     const lock = LockService.getScriptLock();
     lock.waitLock(20000);
     try {
       const ss = SpreadsheetApp.getActiveSpreadsheet();
       let sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
       if (sheet.getLastRow() === 0) {
         sheet.appendRow(['Timestamp', 'Name', 'Email', 'Best position', 'Last played', 'Neighborhood']);
       }
       const p = e.parameter || {};
       sheet.appendRow([new Date(), p.name || '', p.email || '', p.best_position || '', p.last_played || '', p.neighborhood || '']);
       return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
     } finally {
       lock.releaseLock();
     }
   }
   ```

3. **Deploy → New deployment** → type **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - **Deploy**, authorize when prompted, and copy the **Web app URL**
     (ends in `/exec`).
4. Paste that URL as `FORM_ENDPOINT` in [`script.js`](script.js), commit, and push
   (Vercel auto-redeploys).

The submitted fields are: name, email, best position, last played, and
neighborhood (optional). The script writes the header row automatically on the
first submission.

> Note: Apps Script Web Apps don't send CORS headers, so the form posts with
> `mode: "no-cors"` — the row is still written, but the browser can't read the
> response, so a submission that reaches the server is treated as success.

## Deploy

Zero config on either host. The site is just static files.

### Netlify

- **Drag and drop:** zip the project folder (or drag the folder) into the
  Netlify dashboard's "Deploy" area.
- **Git:** connect the repo. Leave the build command empty and set the publish
  directory to the project root (`.`).
- **CLI:** `npx netlify deploy --dir . --prod`

### Vercel

- **Dashboard:** import the repo. Framework preset: **Other**. No build command;
  output directory is the project root.
- **CLI:** run `vercel` in the project root and accept the defaults.

No environment variables are required. The form endpoint lives in `script.js`,
so update it there and redeploy if it changes.
