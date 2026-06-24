# Andres Lopez — work log

Personal blog for progress updates on projects, school, and side builds. Static HTML/CSS/JS with an ASCII aquarium background.

## Run locally

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Add a post

1. Copy `posts/ai-humanizer-wip.html`.
2. Rename it and edit the title, date, tag, and body.
3. Add a preview card to the feed in `index.html` under `.post-feed`.

## About page

Edit `about.html` for your personal bio. Linked from the nav on every page.

No build step required.

## Set your birth instant

Edit `script.js` and set `BIRTH_INSTANT_ISO` to your real birth date/time:

```js
const BIRTH_INSTANT_ISO = "2005-08-22T03:14:07.000-05:00";
```

## Customize

- Home feed and about copy: `index.html`
- Post pages: `posts/`
- Theme and layout: `styles.css`
- Age counter + aquarium: `script.js`

## Deploy

Upload the folder to any static host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc.).
