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

## Formspree setup

The sign-up form posts to [Formspree](https://formspree.io). The endpoint is
defined in **one place** at the top of [`script.js`](script.js):

```js
const FORMSPREE_ENDPOINT = "https://formspree.io/f/REPLACE_WITH_YOUR_FORM_ID";
```

1. Create a free Formspree account and a new form.
2. Copy the form's endpoint URL (looks like `https://formspree.io/f/abcdwxyz`).
3. Paste it in place of the placeholder above.

Until a real endpoint is set, the form runs in **demo mode**: it validates,
shows the inline success state, and posts nothing. Once the real endpoint is in,
submissions POST via `fetch` and the page shows the success state inline with no
reload. The submitted fields are: name, email, best position, last played, and
neighborhood (optional).

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

No environment variables are required. The Formspree endpoint lives in
`script.js`, so update it there and redeploy if it changes.
