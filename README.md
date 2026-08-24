# Rok — रोक

**Stop the money before the paperwork starts.**

A browser-based reimagining of India's National Cyber Crime Reporting Portal
(cybercrime.gov.in), built for the **Build What Moves India** hackathon.

See [`AGENTS.md`](./AGENTS.md) for the persistent project rules that apply
to every change, and [`docs/BUILD_BRIEF.md`](./docs/BUILD_BRIEF.md) for the
master specification used to bootstrap the build.

## What this is

NCRP demands roughly 21 steps, a 12-digit UTR typed from memory, a
200-character hand-written incident description, and a government ID scan —
all in the first minutes after a fraud, from a victim who is often elderly,
panicking, low-literacy, or reading no English. Rok inverts the form: it
opens a case on the first tap, reads the victim's own bank SMS aloud and
asks "which one is the wrong one?", infers the government taxonomy from
four icon taps, and defers every non-urgent field to a calm mode *after*
the freeze-relevant complaint already exists.

Full design rationale, evidence register, and diagrams:
[`docs/Rok_NCRP_Concept.pdf`](./docs/Rok_NCRP_Concept.pdf)

## Status

**Built and running.** All ten screens are implemented, styled and verified
end to end. Run `npm run dev` and the full flow works from the Palm screen
to a downloadable complaint packet.

| Area | State |
| --- | --- |
| Evidence Recognition Engine | 24 bank/wallet patterns, plus a bank-agnostic fallback so an unlisted bank still yields its amount and reference. In-browser OCR for the screenshot path. |
| P0 spine | Palm, Safety Triage, Message Wall, Scope, Reached Via, Read-Back, Case Complete |
| P1 | Guardian Handoff, Calm Mode |
| P2 | Race View |
| Golden Hour clock | Live, and it gates what each screen may ask |
| Languages | English and Tamil, 149 keys, parity enforced in CI |
| Accessibility | 360px and 200% zoom clean, no unnamed controls, palette verified against WCAG 2.1 AA |

Verification — all five must pass before a commit:

```bash
npm run lint && npm run test && npm run build && npm run check:i18n && npm audit
```

Currently: lint clean, 56 tests passing, build clean, i18n in sync, 0 vulnerabilities.

**Still outstanding:** the Tamil copy in `src/i18n/ta.json` has not been
reviewed by a native speaker — do not demo it as final until it has been.
A manual NVDA/VoiceOver pass and a Lighthouse run on the deployed build
are also still owed; the automated checks above do not replace either.

## Stack

- React 18 + Vite
- Plain CSS (design tokens in `src/theme.css`) — no component library
- Inter and Noto Sans Tamil, self-hosted via `@fontsource` so nothing loads
  from a third-party origin at runtime
- Web Speech API (TTS + STT), Tesseract.js (OCR), client-side PDF generation
- No backend. Everything runs in the browser. Nothing is transmitted
  anywhere until the user explicitly exports/shares a file.

## Local development

```bash
npm install
npm run dev       # http://localhost:5173
npm run build      # production build -> dist/
npm run preview    # serve the production build locally
```

## Deployment

Static build, deployable anywhere that serves static files. See
[`docs/DEPLOY.md`](./docs/DEPLOY.md) for the Codex-driven Vercel deploy flow
used for this submission.

## License / disclaimer

Hackathon proof of concept. Not affiliated with I4C, MHA, or the Government
of India. Produces a validated complaint *packet* — it does not submit to
cybercrime.gov.in, which has no public API.
