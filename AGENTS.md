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
