=== COPY EVERYTHING BELOW THIS LINE INTO docs/PHASES.md ===
# PHASES.md — Rok build plan (execute in order)

This file consolidates every remaining build phase into one document so
you can work through it in a single session without re-prompting between
phases. Read this whole file before writing any code.

**Process rules — non-negotiable, apply to every phase below:**

1. Complete phases strictly in order: A, then B, then C, then D, then E.
   Do not start a later phase before the current one's exit checklist is
   fully green.
2. After finishing a phase: run `npm run lint`, `npm run test`,
   `npm run build`, `npm run check:i18n`, `npm audit`. All five must pass
   (or `npm audit` must be 0 vulnerabilities) before you commit.
3. If something fails, fix it yourself. If the same issue is still
   failing after 3 real attempts, stop, do not skip it, and write a clear
   note at the end of your final report explaining what's stuck and why.
4. Commit at the end of each phase, separately, with the message given
   in that phase's section below. Never bundle two phases into one
   commit.
5. Never touch a later phase's files while working on an earlier one.
6. Read `AGENTS.md` and `docs/BUILD_BRIEF.md` before Phase A if you
   haven't already this session — they contain the state machine shape,
   the engine contracts, and the security/i18n/accessibility rules that
   apply throughout. This file does not repeat those; it sequences them.

---

## THE UI/UX BAR — read this before touching a single screen

This is competing against 10,000+ hackathon submissions. A functionally
correct but visually generic screen will not stand out, and "generic AI
output" is a real, recognizable failure mode judges have seen thousands
of times this cycle. Every screen must clear all of the following before
its phase is considered done — this is not a final polish pass, apply it
as you build each screen, not after:

- **No default browser chrome.** No unstyled `<button>`, no default
  `<select>`, no browser-default focus rectangle look (use the
  `:focus-visible` treatment already in `theme.css`), no system font
  fallback showing through anywhere.
- **Real spacing rhythm.** Pick a spacing scale (e.g. 4/8/12/16/24/32/48px)
  and use only those values — no arbitrary one-off margins. Inconsistent
  spacing is the single most common tell of an unpolished AI-built UI.
- **Motion with purpose, not decoration.** The Message Wall's
  card-to-receipt transition, state-to-state screen transitions, and the
  Read-Back sentence advance should all have a deliberate, short
  transition (150-250ms, ease-out) — not an abrupt cut, but also not a
  gratuitous bounce. Respect `prefers-reduced-motion`.
- **Every screen has a considered empty/loading/error state**, not just
  a happy path. The screenshot-upload path needs a visible
  "reading your screenshot..." state during OCR, and a clear, calm
  message if parsing fails (never a raw error or a blank screen).
- **Hierarchy is obvious without reading.** On every screen, the single
  most important action must be visually dominant (size, weight, color
  from `theme.css`) — a judge skimming for 10 seconds should know what to
  tap without reading body text.
- **Consistent iconography.** Pick one icon approach (inline SVG,
  hand-drawn simple shapes matching the palm/card motifs already implied
  by the product) and use it everywhere — no mixing emoji with SVG icons
  with text labels for equivalent concepts.
- **Mobile-first, genuinely tested, not just responsive-by-accident.**
  Build and check every screen at 360px width first, then confirm it
  still looks intentional at wider viewports — not the reverse.
- **The red/indigo/green/amber palette in `theme.css` is used
  meaningfully** (urgency, trust/action, success, caution) — not
  decoratively. Don't introduce new colors outside the token set.
- Before marking a phase's screens done, look at each one and ask: "if a
  judge saw only this one screenshot, would it look like a considered
  product or a scaffold?" If the honest answer is scaffold, keep working
  on that screen before moving on.

---

## Phase A — Evidence Recognition Engine + Message Wall

**Scope:**
- `src/engines/smsParser.js`: implement `parseTransactionSms` against all
  six fixtures in `src/fixtures/sampleSms.js` (SBI, HDFC, ICICI, Bank of
  Baroda, PNB, Paytm Wallet), extracting bank, amount, timestamp,
  accountTail, utr, beneficiaryVpa, confidence. Implement
  `parseTransactionImage` using Tesseract.js (OCR to text, then run
  through `parseTransactionSms`).
- `src/engines/smsParser.test.js`: one assertion block per fixture,
  checking every field.
- Message Wall screen, fully styled per the UI/UX bar above: card list
  from `SAMPLE_INBOX`, "upload a screenshot instead" button wired to
  `parseTransactionImage` (with a visible OCR-in-progress state), each
  card showing bank/masked amount/timestamp, a read-aloud button, full
  keyboard operability, and a receipt-view transition on selection
  before firing `SELECT_MESSAGE`.
- **Bug fix:** the `Current state: <STATE>` debug text currently renders
  unconditionally on screen. Gate it behind `?debug=1`, same convention
  as the Phase B `ReachedVia` debug ribbon — it must never be visible on
  a normal page load.
- Remove the `eslint-disable no-unused-vars -- stub` comment at the top
  of `smsParser.js` now that it's implemented.
- All new/changed strings through `src/i18n/en.json` and `ta.json`.

**Exit checklist:** all 5 verification commands pass; every fixture
produces bank/amount/utr with `confidence: 'high'` or `'medium'` (flag
any that come out `'low'` or null in your report); Message Wall clears
the UI/UX bar; debug state text is hidden by default.

**Commit message:** `feat: SMS parser + Message Wall (Phase A)`

---

## Phase B — the rest of the P0 spine

**Scope:**
- Screens: style and complete Palm and CaseComplete (rough placeholders
  exist). Fully implement SafetyTriage, Scope, ReachedVia, ReadBack from
  scratch — all per the UI/UX bar above.
- `src/engines/taxonomy.js`: implement `inferTaxonomy` and
  `inferStateUt` per `docs/BUILD_BRIEF.md` section 3.
- `src/engines/narrative.js`: implement `composeNarrative` (>=200 chars,
  matches `/^[A-Za-z0-9 ,.\-]+$/`) and `composeReadBackSentences`, per
  section 4. Add a test asserting both properties of `composeNarrative`'s
  output.
- `src/engines/a11yBus.js`: implement `announce()` per section 6, wired
  to `#a11y-live-region`. Wire it into every screen's mount.
- ReachedVia: debug ribbon behind `?debug=1` per BUILD_BRIEF screen 5.
- SafetyTriage "yes" path: hang-up script screen + "alert a trusted
  contact" via `navigator.share`, with a graceful fallback.
- Remove any remaining stub eslint-disable comments in files you
  implement here.

**Exit checklist:** all 5 verification commands pass; every screen
clears the UI/UX bar; describe in your report, state by state, what
happens on: Palm → SafetyTriage(No) → MessageWall → Scope(only this
one) → ReachedVia → ReadBack(yes×3) → CaseComplete.

**Commit message:** `feat: complete P0 screen spine + engines (Phase B)`

---

## Phase C — outputs, guardian handoff, calm mode

**Scope:**
- `src/engines/outputs.js`: implement `buildNcrpPacket`,
  `buildHelplineCard`, `buildCasePdf` (jsPDF), and
  `buildGuardianHandoffCode` (localStorage-only, same-device — per
  AGENTS.md's Security posture section, no network relay).
- Wire `buildNcrpPacket`/`buildHelplineCard`/`buildCasePdf` into
  CaseComplete's three exit cards ("Your money", "Your job now" with an
  editable `tel:` link, "By tomorrow" with static guidance text). Label
  the NCRP packet clearly as self-submit, never as an actual submission.
- `GuardianHandoff.jsx`: code display + join-by-code form, copy phrased
  for same-device continuation, not cross-device.
- `CalmMode.jsx`: ID photo (memory/localStorage only, never uploaded
  anywhere), address fields, evidence attachments.
- All per the UI/UX bar above.

**Exit checklist:** all 5 verification commands pass; generated PDF
opens and contains the expected fields (describe what you checked); both
new screens clear the UI/UX bar.

**Commit message:** `feat: output adapters, guardian handoff, calm mode (Phase C)`

---

## Phase D — i18n audit + accessibility pass

**Scope:**
- Grep `src/` for any hardcoded user-facing string not routed through
  `useT()`. Fix every one.
- Run `npm run check:i18n`, fix any key mismatch.
- Report a full table of every `ta.json` key: English, Tamil — I will
  review this myself, do not mark it resolved.
- Keyboard-only walkthrough of every screen: fix unreachable elements,
  missing focus states, wrong tab order.
- Confirm every interactive element has an accessible name; fix any
  icon-only button missing one.
- Confirm every screen calls `announce()` on mount.
- Compute or test contrast ratios in `theme.css` against WCAG 2.1 AA
  (4.5:1 body, 3:1 large text/UI) — report a table.
- Confirm every screen survives 360px width and 200% zoom with no
  horizontal scroll.
- If a screen-reader or axe-core testing tool is available in this
  environment, run it and report results; otherwise state plainly that a
  manual NVDA/VoiceOver pass is still required from me.

**Exit checklist:** all 5 verification commands pass; i18n table
reported in full; a11y issue list (found + fixed) reported in full.

**Commit message:** `fix: i18n completeness + accessibility pass (Phase D)`

---

## Phase E — Race View + final polish

**Scope:**
- `src/screens/RaceView.jsx`: static side-by-side comparison (NCRP's
  demands vs. Rok's flow), content from `docs/DESIGN_SUMMARY.md`'s field
  mapping table. Standalone screen, own route/link, clears the UI/UX bar
  — this is the screen most likely to be screenshotted, give it real
  attention.
- Confirm the footer disclaimer is present on every screen.
- Run a Lighthouse audit on the production build if tooling is available
  in this environment (`npm run build && npm run preview`, then
  Lighthouse against the preview URL); report Accessibility and
  Performance scores. If unavailable, say so explicitly.
- Update `README.md`'s Status section to accurately reflect what's built.
- Do one full pass over every screen against the UI/UX bar one more
  time, end to end, as if seeing it for the first time — fix anything
  that still reads as a scaffold rather than a finished product.

**Exit checklist:** all 5 verification commands pass; Lighthouse scores
reported (or explicitly noted as unavailable); README accurate.

**Commit message:** `feat: Race View + final UI polish pass (Phase E)`

---

## Final report format

After Phase E's commit, give me one summary covering: what's fully done,
what (if anything) is still stuck after 3 attempts, the final Lighthouse
scores, and the i18n/a11y tables from Phase D if not already delivered.
=== COPY EVERYTHING ABOVE THIS LINE ===