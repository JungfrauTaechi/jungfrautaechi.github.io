# Jungfrau-Tächi redesign

Local Vite/React first version of the Jungfrau-Tächi Grindelwald redesign, structured as reusable shell, page-intro, card listing, flight-area, gallery and anniversary components.

```powershell
npm run inventory
npm run build
npm run test:sites
npm test
npm run dev
```

`npm run inventory` reads the public sitemap and writes JSON, Markdown, CSV and image-source manifests under `content/inventory/`. It performs public GET requests only and does not alter the live website. If the public crawl is unavailable after an internal-link parser correction, the retained corpus is kept but its internal-link values are explicitly marked unavailable rather than treated as zero; a successful fresh crawl restores current/complete link data.

The runtime uses mirrored local club images under `public/assets/source/` (served as `/assets/source/...`), so the deployed site does not depend on remote image delivery. The original club URLs and one-time retrieval provenance remain recorded in `content/inventory/assets-manifest.json`. Set the single `showAnniversary` flag in `src/data.js` to `false` to remove anniversary-only UI.

## GitHub Pages

The site publishes from the single public repository `JungfrauTaechi/jungfrautaechi.github.io`. The `main` branch is the production source and deploys to `https://jungfrautaechi.github.io/`. A `dev` branch may be used for ongoing work, but it is not deployed as a separate public Pages site; validate it locally before merging it into `main`.

`npm run build` retains the local/Sites-compatible build. For GitHub Pages, `npm run build:pages` builds the static client and copies `index.html` to `dist/client/404.html` so direct SPA links work on Pages. Vite reads `SITE_BASE`; the production root leaves it unset. See [DEPLOYMENT.md](DEPLOYMENT.md) for the branch workflow, Pages setup, promotion and rollback runbook.
