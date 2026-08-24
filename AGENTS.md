# AGENTS.md — Rok

Instructions Codex should follow on every task in this repository.
Full one-time build spec lives in `docs/BUILD_BRIEF.md` — read it before
the first implementation task, but do not re-read it on every small task.

## What this project is

A client-side-only React app that replaces the intake flow of India's
National Cyber Crime Reporting Portal with a 60-second, recognition-first
flow. Read `docs/Rok_NCRP_Concept.pdf` (or `docs/DESIGN_SUMMARY.md` for the
plain-text version) once for the "why" before writing product logic.

## Architecture

- Frontend: React 18 + Vite, plain CSS (no Tailwind, no component library).
  Design tokens live in `src/theme.css` — use CSS variables from there,
  never hard-coded hex values in components.
- State: one explicit finite state machine in `src/state/machine.js`
  (XState-style reducer, hand-rolled — no external state library). The
  flow must stay auditable: every screen transition is a named event.
- No backend, no server code, no API routes. If a task seems to need a
  server, stop and flag it instead of adding one.
- Parsing logic (`src/engines/smsParser.js`) is deterministic regex/rules,
  never a model call, never network-dependent. It must work fully offline.
- Speech: Web Speech API only (`src/engines/speech.js`), with a
  pre-recorded-audio-file fallback path already stubbed — do not add a
  cloud TTS/STT dependency.

## Commands

- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Test: `npm run test` (Vitest)

Run `npm run lint` and `npm run test` after any change under `src/`
before considering a task done. Fix failures yourself; do not leave
red tests.

## Conventions

- Functional components only, no class components.
- One component per file, filename matches the default export.
- All user-facing strings go through `src/i18n/` — never hard-code English
  copy inside a component. Every string needs at minimum an `en` and `ta`
  entry; other languages can be TODO-stubbed.
- Every interactive element must be reachable by keyboard and must have an
  accessible name. This is not optional polish for this project — treat a
  missing `aria-label` or an unreachable focus target as a bug, not a
  nice-to-have.
- Never persist or transmit an OTP, PIN, password, or full account number,
  in any form, anywhere in the codebase — including logs, fixtures, and
  comments. If a task seems to require this, stop and flag it.
- Money, dates, and phone numbers are formatted for India (₹, DD/MM/YYYY,
  +91) via `src/i18n/format.js` — do not use `Intl` defaults inline.

## What "done" means for a screen

1. Works with mouse/touch and with keyboard-only navigation.
2. Every state change is announced via the shared `AccessibilityBus`
   (see `src/engines/a11yBus.js`) — text, and TTS if `speechEnabled`.
3. No layout requires horizontal scrolling below 360px width.
4. Passes `npm run lint` and `npm run test`.

## PRs / commits

- Small, single-purpose commits. Message format: `screen: what changed`
  or `engine: what changed` (e.g. `smsParser: add HDFC UPI debit format`).
- Do not commit `dist/`, `node_modules/`, or anything under `.env*`.

## Government UI standards (GIGW 3.0 / WCAG 2.1 AA)

Rok is not an official Government of India platform, but its interface
must read as trustworthy and dependable in the way a real GoI digital
service does. Treat GIGW 3.0 (Guidelines for Indian Government Websites
and Apps, MeitY) as the binding visual/interaction standard, on top of
the accessibility rules already in this file:

- Text contrast >= 4.5:1 (body), >= 3:1 (large text, icons, UI borders).
  Verify every color pairing in theme.css against this, not just the
  ones that look fine at a glance.
- Never convey state by color alone — every colored state (red/green/amber
  cards, confidence flags) must also carry an icon or text label.
- Visible focus indicator on every interactive element (already in
  theme.css via :focus-visible — do not remove it for aesthetics).
- Layout must not break, clip, or require horizontal scroll at 360px
  width OR at 200% browser zoom. Test both, not just one.
- No autoplaying audio. Every spoken announcement must be user-initiated
  or clearly previewable/mutable — add a persistent mute toggle once
  speech.js is implemented.
- Do NOT use the State Emblem of India, the Ashoka Chakra, the national
  flag, or any official government insignia anywhere in the UI or
  marketing assets. This is restricted under the State Emblem of India
  (Prohibition of Improper Use) Act, 2005, and using it would misrepresent
  the project's affiliation. Instead: restrained palette (already set in
  theme.css), official-document typography, generous whitespace, and a
  permanent footer line reading "Not an official Government of India
  platform — hackathon proof of concept."

## Security posture and the guardian-handoff backend

The core flow is client-only by design, not by shortcut: for data this
sensitive (fraud evidence, financial details), a server that never
receives the data cannot be breached, subpoenaed, or misconfigured into
leaking it. State this explicitly in any pitch material — do not let
"no backend" read as unfinished.

Harden the client itself:

- Content-Security-Policy: disallow inline scripts/eval, restrict
  connect-src to same-origin, block third-party trackers and analytics
  entirely.
- No external CDN <script> tags at runtime — vendor/bundle all
  dependencies (Tesseract.js, jspdf) so nothing loads from a third-party
  origin the app doesn't control.
- Never render parsed SMS/OCR text via dangerouslySetInnerHTML — JSX's
  default escaping is the only path for user-influenced text.
- `npm audit` must be clean (or documented exceptions) before submission.
- No analytics SDK, no error-tracking SDK — either could exfiltrate case
  data as a side effect of its normal operation.

DECISION FOR THIS SUBMISSION: no real backend is being built. Guardian
handoff (src/engines/outputs.js -> buildGuardianHandoffCode) stays a
localStorage-backed demo simplification, same-browser/same-device only.
Do not build a serverless function, a KV store, or any network relay for
this feature. Keep the existing code comment that flags this as a demo
simplification, and make sure the UI itself never implies cross-device
handoff works in the deployed build (no copy like "send this code to
someone on another phone" — say "reload on this device" or similar).

Document this as a deliberate scope decision in SECURITY.md, not an
oversight: zero backend = zero server-side attack surface for financial
fraud evidence, which is the stronger security posture for a POC anyway.
List it under "Out of scope for this submission" alongside the other
non-goals already in docs/BUILD_BRIEF.md section 10.

## Competing at hackathon scale (10k+ submissions)

- Target Lighthouse Accessibility >= 95 and Performance >= 90 on the
  deployed build — run it and fix what it flags, don't just estimate.
- Finish the Race View (P2 in BUILD_BRIEF screen list) — a side-by-side
  timed comparison is the single highest-leverage thing for standing out
  in a 90-second judge skim.
- Ship a one-page README section with 3-4 real screenshots and a 60-90
  second demo video script — judges reviewing thousands of entries decide
  in seconds whether to look closer.
