# Deploying Rok

Rok is a static build with no backend, so deployment is a single command
against any static host.

## Build

```bash
npm install
npm run build
```

This produces `dist/` — a fully static site. No environment variables are
required; Rok has no backend and no API keys.

## Vercel (CLI)

```bash
npm install -g vercel
vercel login          # one-time, opens a browser to authenticate
vercel --prod
```

## Vercel (GitHub integration, no CLI)

1. Push this repo to GitHub.
2. In the Vercel dashboard: **New Project → Import** the repo.
3. Framework preset: **Vite**. Build command `npm run build`, output
   directory `dist`.
4. Every push to `main` redeploys automatically.

## Any other static host

`dist/` after `npm run build` is deployable as-is to Netlify, GitHub Pages,
Cloudflare Pages, S3 + CloudFront, or any static file server — there is
nothing Vercel-specific in the build output.

## Sanity checks after deploy

- Open the deployed URL on an actual phone, not just desktop — the Palm
  screen and Message Wall are the ones most likely to break on small
  viewports.
- Run a screen reader pass (VoiceOver on iOS/macOS, TalkBack on Android,
  or NVDA on a Windows desktop) against the deployed URL before treating
  a release as final — this is the whole point of the project.
- Confirm the debug ribbon (`?debug=1`) is genuinely hidden by default in
  production, not just visually collapsed.
