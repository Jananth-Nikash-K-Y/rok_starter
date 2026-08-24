# Rok — रोक

**Stop the money before the paperwork starts.**

A browser-based reimagining of India's National Cyber Crime Reporting Portal
(cybercrime.gov.in), built for the **Build What Moves India** hackathon.

This repository is built and maintained entirely with **OpenAI Codex**.
See [`AGENTS.md`](./AGENTS.md) for the persistent project rules Codex reads
on every run, and [`docs/BUILD_BRIEF.md`](./docs/BUILD_BRIEF.md) for the
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

🚧 Scaffolded, not yet built. This repo intentionally ships with an empty
`src/` (folder structure + stub files only) so that **OpenAI Codex writes
the implementation**, per the hackathon's tooling requirement. See
`docs/BUILD_BRIEF.md` for the exact task to hand Codex first.

## Stack

- React 18 + Vite
- Plain CSS (design tokens in `src/theme.css`) — no component library
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
