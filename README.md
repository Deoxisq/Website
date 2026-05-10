# Andres Lopez — portfolio (static)

Black-and-white portfolio site with a **live age** readout (decimal years to nanosecond-style precision + day/hour/min/sec/**ms** breakdown).

## Run locally

Open `index.html` in a browser, or from this folder:

```bash
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Set your birth instant

Edit `script.js` and set `BIRTH_INSTANT_ISO` to a real ISO string, for example:

```js
const BIRTH_INSTANT_ISO = "2004-06-12T08:15:00.000-05:00";
```

Use your actual date, time, and offset (or `Z` for UTC). The millisecond field under “milliseconds (fraction)” is the **sub-second** remainder (0–999), updated every animation frame (~60 Hz). Decimal years string updates continuously for a “by the millisecond” feel.

## Customize

- Copy is in `index.html`.
- Grayscale theme: `styles.css` (`:root` variables).
- Age logic: `script.js`.

## Deploy

Upload the folder to any static host (GitHub Pages, Netlify, Vercel static, Cloudflare Pages, etc.).
