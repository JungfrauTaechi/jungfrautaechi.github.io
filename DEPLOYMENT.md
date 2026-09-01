# GitHub Pages deployment

The site uses one public repository and one public Pages deployment:

| Repository | Production branch | Public URL |
| --- | --- | --- |
| `JungfrauTaechi/jungfrautaechi.github.io` | `main` | `https://jungfrautaechi.github.io/` |

In the repository, open **Settings → Pages** and select **GitHub Actions** as the build and deployment source. The workflow runs only for `main`; a `dev` branch can hold ongoing work without creating a second public site.

## Local workflow and promotion

Develop and validate changes on `dev`:

```powershell
git switch dev
npm test
npm run build
npm run test:sites
npm run build:pages
npm run test:pages
git push origin dev
```

After local review, promote the exact tested commit by fast-forwarding `main`:

```powershell
git switch main
git merge --ff-only dev
git push origin main
```

The production workflow runs `npm ci`, the application tests, Sites worker tests, Pages tests, and `npm run build:pages`. It passes the official `actions/configure-pages` base path to Vite, uploads `dist/client`, and creates a `404.html` copy of the SPA entry point for direct links. The normal `npm run build` path remains available for the local/Sites-compatible output.

## Rollback

Prefer reverting an unwanted production commit so the public history remains clear:

```powershell
git switch main
git revert <unwanted-commit-sha>
git push origin main
```

Apply the same revert to `dev` if the change should also disappear from ongoing work.

## Optional custom domain

After the Pages deployment is working, a production custom domain may be configured under **Settings → Pages → Custom domain**. GitHub will show the required DNS and domain-verification steps; complete those at the DNS provider, then enable HTTPS.

GitHub Pages is static hosting: it has no server-side runtime. All public panorama assets are included locally under `public/assets/panoramas/`.
