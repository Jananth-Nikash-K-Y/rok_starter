# Worklog — 24 August 2026

**UI rebuild and foundation hardening.**

Commits `9f307ab` (rebuild) and `4ee015d` (README), on top of `72c75d8`.
51 files changed, 4,376 insertions, 1,845 deletions.

Entering the day the repo had Phases A and B committed and Phase C partially
done. All five verification commands passed, but passing checks were hiding
a product-level defect in the one screen the pitch rests on. The day split
into three parts: **audit**, **foundation**, **interface**.

---

## 1. Audit

Ran the app before changing anything. Five defects were found by reading and
executing the code, and a sixth — the most serious — by looking at the
rendered screen.

### 1.1 The Message Wall was masking the amount

`docs/BUILD_BRIEF.md:243` specified each card as *"bank, masked amount,
timestamp"*. That was implemented literally:

```js
export function formatMaskedIndianCurrency(amount) {
  return formatIndianCurrency(amount).replace(/\d/g, "•");
}
```

Every amount rendered as `₹••,•••.••`, and the unmasked `formatIndianCurrency`
was called nowhere in the application.

Mechanic M2 is recognition: the victim identifies the fraudulent transaction
*by its amount*. Masking those digits removes the only cue they have, so the
screen the entire product rests on could not perform its one function. The
spec almost certainly meant the masked *account number*, which is the actual
security requirement.

**Root cause was the specification, not the implementation.** Fixed in the
code and in both documents that produced it, so it cannot be reintroduced.

### 1.2 Reachable blank screen

`CaseComplete.jsx:145` dispatched `ENTER_CALM_MODE`. The reducer transitioned
to `ROK_STATES.CALM_MODE`. `App.jsx`'s `screenFor` had no case for it and fell
through to `default: return null`. A visible button led to an empty page with
no way back — live in the deployed build.

### 1.3 The parser discarded most Indian banks

```js
const bank = parseBank(text);
if (!bank) return null;          // whole parse abandoned
```

`parseBank` matched a hardcoded list of six institutions. A well-formed Axis,
Kotak, Canara or Union Bank alert returned `null` outright, discarding a
perfectly extractable amount, UTR and VPA. This hit hardest on the
screenshot/OCR path — the one the concept document calls the genuinely
working real-device path.

### 1.4 Fabricated transaction times

Two of the six fixtures carry a date but no clock time. The parser defaulted
them to midnight IST and returned `confidence: 'high'`. The invented `00:00`
rendered on the card and flowed into the composed narrative as stated fact —
in a project whose stated strength is that every claim is sourced.

### 1.5 Silent degradations

- `amount ?? 0` turned a failed amount parse into a ₹0 transaction.
- `'medium'` was in the confidence contract but never emitted.
- The case was written to `localStorage` on every transition and **never read
  back**, so mechanic M1's "abandonment leaves a live case" did not survive a
  page reload.
- `buildGuardianHandoffCode` / `retrieveHandoffCase` were implemented and
  unreferenced by any screen.

### 1.6 Fonts were declared but never loaded

`theme.css` requested `"Inter"` and `"Noto Sans Tamil"`. Neither was imported
and the CSP (`default-src 'self'`, no `font-src`) forbids Google Fonts. Every
screen — including all Tamil copy — rendered in system fallback.

---

## 2. Foundation

### 2.1 `src/engines/smsParser.js` — rewritten

Bank recognition no longer gates the parse. The parser extracts whatever the
message contains, names the institution when it recognises one, and grades
confidence by how much freeze-relevant evidence it actually recovered.

|              | Before                  | After                                         |
| ------------ | ----------------------- | --------------------------------------------- |
| Institutions | 6                       | 24, plus sign-off fallback for unlisted banks |
| Unknown bank | returns`null`         | returns evidence at reduced confidence        |
| Confidence   | `high` / `low` only | `high` / `medium` / `low`, by rule      |
| Time         | defaulted to midnight   | `timeKnown` flag, no invention              |
| Amount       | `?? 0`                | `null`, reported as unconfirmed             |
| Direction    | not detected            | `debit` / `credit` / `unknown`          |

Two further defects surfaced while writing the new tests:

- **Reference matcher** missed wallet order IDs. Rewritten to take the first
  qualifying token after a reference label — a helpline number later in the
  message must never be mistaken for the identifier the bank freezes on.
- **VPA regex** matched `care@hdfcbank` out of `care@hdfcbank.com`. Now
  captures the full token and rejects anything ending in a TLD, since an
  email address is a different identifier entirely.

All six fixtures now parse at `high` confidence, Paytm Wallet included.

### 2.2 `src/engines/goldenHour.js` — new

Mechanic M3 — *the clock is the information architecture* — had **no
implementation**. Added `goldenHourStatus()` deriving elapsed/remaining/phase
(`idle → calm → urgent → critical → elapsed`) and `mayAsk(kind, caseComplete)`,
which centralises the rule that only freeze-relevant questions may render
before the case exists. Deriving phase in one place is what makes that rule
enforceable rather than a convention each screen re-implements.

### 2.3 `src/state/machine.js` — extended

Added `RESTORE_CASE` (rehydration), `HANGUP_DONE`, `CORRECT_FIELD`,
`REJECT_READBACK`, `EXIT_CALM_MODE`, `SAVE_CALM_DETAILS`,
`OPEN_/CLOSE_GUARDIAN_HANDOFF`, and a `GUARDIAN_HANDOFF` state that remembers
`previous` so a helper returns exactly where they were.

`CORRECT_FIELD` exists because the risk register says a wrong identifier could
freeze an innocent account: every parsed value stays user-editable, and an
edited transaction is marked `confidence: 'corrected'`. The event whitelists
which fields may be written, so `raw` cannot be tampered with.

Added `caseReferenceFrom(id)` — a six-character reference over an alphabet
that omits `0/O`, `1/I` and `5/S`, because the reference exists to be read
aloud down a phone line to a 1930 operator.

### 2.4 `src/engines/narrative.js` — rewritten

Was formatting dates with `toLocaleDateString` in the **browser's** timezone,
not IST. Now uses the IST helpers, and states only what the evidence carries:
a date-only alert produces *"on 24-08-2026, at a time not recorded in the bank
alert"* rather than a fabricated midnight.

Two defects found through testing the sanitiser:

- NCRP permits only `[A-Za-z0-9 ,.-]`. Slashes and colons were being stripped,
  turning the incident date into `24082026` and the time into `2347`. Dates
  now use hyphens and times a period — both survive sanitisation and read
  correctly in a complaint.
- `scammer123@okhdfcbank` sanitised to `scammer123okhdfcbank`, silently
  corrupting the single identifier a bank traces the beneficiary by. Now
  written as `scammer123 at okhdfcbank`.

Also restored sentence case, which the sanitiser was destroying.

### 2.5 `src/i18n/format.js` — rewritten

`formatMaskedIndianCurrency` removed. `formatIndianCurrency` returns `null`
for an unknown amount rather than a misleading `₹0`, and drops trailing paise
on whole-rupee amounts — `₹45,000` is recognised at a glance where
`₹45,000.00` has to be read. Added `formatMaskedAccount` (the thing that
*should* be masked), IST-locked date/time helpers taking `timeKnown`, and
`formatDuration` for the countdown.

### 2.6 Output adapters

`buildNcrpPacket` now carries `incidentTimeRecorded`, `spokenCaseReference`
and `evidenceConfidence`, and reports a missing amount as `null` not `0`.
`buildHelplineCard` rewritten as four sentences a victim can read aloud
verbatim, rather than colon-delimited field labels.

### 2.7 Test suite: 14 → 56

| File                   | Tests |
| ---------------------- | ----- |
| `smsParser.test.js`  | 15    |
| `narrative.test.js`  | 14    |
| `machine.test.js`    | 14    |
| `format.test.js`     | 7     |
| `goldenHour.test.js` | 6     |

Each defect above has a regression test carrying a comment explaining what it
guards, including hostile-input cases asserting the parser never throws.

---

## 3. Interface

### 3.1 Design system — `src/theme.css` rewritten

Tokens only: an 8-step spacing scale (4→64), an 8-step type scale, semantic
colour with tint/line variants per role, navy-tinted elevation, and motion
tokens with a global `prefers-reduced-motion` block. Base body size raised to
17px and minimum tap target to 56px for the intended audience. Tamil gets its
own face and line-height under `:lang(ta)`.

Inter Variable and Noto Sans Tamil self-hosted via `@fontsource`, satisfying
both the CSP and AGENTS.md's no-runtime-CDN rule.

### 3.2 Component layer — `src/components/` new

`Icon` (one 24px grid, 2px stroke, `currentColor`, 22 glyphs), `Button`,
`Choice`, `GoldenHourClock`, `ProgressRail`, `ConfidenceBadge`, and
`ui.css` (421 lines) holding every shared class. Consolidating iconography
removes the mixed-emoji/mixed-SVG tell called out in `docs/PHASES.md`.

`ConfidenceBadge` pairs every level with its own icon *and* words, so
confidence is never conveyed by colour alone.

### 3.3 Screens

Seven rebuilt, three built from nothing:

- **CalmMode** — the fix for defect 1.2. Deliberately unhurried: the clock and
  progress rail are suppressed here, because showing a countdown over deferred
  paperwork would contradict the one thing the screen exists to demonstrate.
  The ID `File` is held in memory only and explicitly stripped before the
  snapshot is serialised — a photograph of a government ID must not reach
  `localStorage`.
- **GuardianHandoff** — code generation and join-by-code, with copy that
  states the same-device limitation on screen rather than implying
  cross-device handoff works.
- **RaceView** — the P2 pitch screen. Ten real NCRP mandatory fields against
  how each system obtains them, plus four headline contrasts.

`App.jsx` gained the app bar, language switcher, speech toggle, skip link,
snapshot restore, and a `default` branch that lands on the Palm rather than
rendering `null`.

### 3.4 Accessibility — measured, not estimated

Automated sweep across all ten screens at 360px:

- **No horizontal overflow** on any screen; none at 200% zoom.
- **No unnamed interactive element** on any screen.
- **No target under 44px.**

Two real failures found and fixed:

- The app bar overflowed by 8px at 360px, and flex-shrink was squeezing the
  icon buttons to 40px. Added `flex: none` to preserve tap targets and a
  ≤420px rule that drops the transliterated wordmark — the only element that
  can go without losing a function.
- **Contrast audit** of 20 token pairings against WCAG 2.1 AA found
  `--rok-line-strong` at **2.01:1** on white. It borders quiet buttons and
  form inputs, which WCAG 1.4.11 requires at 3:1. Changed `#aeb7cb → #7f8aa3`
  (3.46:1 on white, 3.17:1 on the page background). All 20 pairs now pass.

### 3.5 i18n

87 → **149 keys**, parity enforced by `npm run check:i18n`. Every new string
authored in both English and Tamil.

---

## 4. Documentation

- `docs/BUILD_BRIEF.md` — "masked amount" corrected to the full amount, with
  an explanation of why, so the defect cannot be regenerated.
- `docs/PHASES.md` — same correction to the Phase A scope line.
- `AGENTS.md` — two new standing rules: mask the account number never the
  amount; never state a fact the evidence does not carry.
- `.eslintrc.json` — `react/prop-types` disabled once centrally, replacing
  twelve per-file `eslint-disable` comments.
- `README.md` — rewritten at a higher level (commit `4ee015d`).

---

## 5. Verification

All five commands pass:

```
lint       clean
test       56 passed (5 files)
build      clean
check:i18n 149 keys x 2 locales in sync
audit      0 vulnerabilities
```

## 6. Still outstanding

1. **Tamil copy is unreviewed.** All 149 keys were authored carefully, but
   `AGENTS.md` forbids shipping unreviewed Tamil. Needs a native speaker
   before the demo.
2. **Manual screen-reader pass.** The automated sweep proves every control has
   a name; it does not prove the flow is coherent through NVDA or VoiceOver.
3. **Lighthouse on the deployed build** — targets are ≥95 accessibility,
   ≥90 performance.
4. **Bundle size** — main chunk is ~645 kB (~208 kB gzipped), over Vite's
   500 kB warning. Tesseract.js dominates; a dynamic import on the OCR path
   would cut it, since most users never upload a screenshot.
