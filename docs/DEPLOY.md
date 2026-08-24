# Deploying Rok (via Codex)

Rok is a static build with no backend, so deployment is a single command.
Vercel is used here because its CLI needs zero dashboard clicking, which
matters if you want the *deploy* step itself to be something Codex ran,
not something you did by hand in a browser.

## One-time setup (you do this once, outside Codex)

```bash
npm install -g vercel
vercel login
```

This opens a browser once to authenticate the CLI to your Vercel account.
Codex should not need your login credentials — do this step yourself so
no secret ever needs to live in a prompt or in `AGENTS.md`.

## Letting Codex build and deploy

From the repo root, with Codex CLI installed (`npm install -g @openai/codex`,
see `docs/CODEX_SETUP.md`):

```bash
codex exec "Run npm install, npm run build, then npm run test and npm run lint. \
If all pass, run 'vercel --prod --yes' and report the deployment URL it prints."
```

Codex will ask for approval before running `vercel --prod` unless you have
set an approval mode that allows network-touching commands (see
`docs/CODEX_SETUP.md`). Approving that single command is the right amount
of caution for a deploy step — do not set full-auto approval for the
whole session just to skip one prompt.

## Alternative: GitHub + Vercel's own integration

If you'd rather not run the Vercel CLI at all:

1. Push this repo to GitHub.
2. In the Vercel dashboard: **New Project → Import** the repo.
3. Framework preset: **Vite**. Build command `npm run build`, output
   directory `dist`. No environment variables are required — Rok has no
   backend and no API keys.
4. Every push to `main` redeploys automatically.

This path is entirely UI-driven and doesn't involve Codex at all, which
is fine for iteration but won't count toward "built and deployed with
Codex" if that's a hackathon judging criterion — use the CLI path above
for the submission deploy.

## Sanity checks after deploy

- Open the deployed URL on an actual phone, not just desktop — the Palm
  screen and Message Wall are the ones most likely to break on small
  viewports.
- Run a screen reader pass (VoiceOver on iOS/macOS, TalkBack on Android,
  or NVDA on a Windows desktop pointed at the deployed URL) before
  submitting. This is the whole point of the project — do not skip it
  because the local dev build "looked fine."
- Confirm the debug ribbon (`?debug=1`) is genuinely hidden by default in
  production, not just visually collapsed.
