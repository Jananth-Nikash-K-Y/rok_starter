# Rok — Build Brief for OpenAI Codex

This is the master specification. Feed this whole file to Codex as the
first task (`codex "Read docs/BUILD_BRIEF.md in full and build Phase 0."`
or paste it into an interactive session). Work through the phases in
order — each phase is a separate Codex task/session so the diffs stay
reviewable. Do not skip ahead to a later phase before the current one's
acceptance criteria pass.

Read `AGENTS.md` first — it holds the rules that apply to every phase
below and is not repeated here.

---

## 0. One-paragraph brief

Build a single-page React app, `Rok`, that lets a fraud victim in India
open a complete, submittable financial-fraud complaint (shaped like an
NCRP complaint) in under 60 seconds, using **zero typing**, by recognizing
their own bank SMS rather than recalling a transaction ID. The whole
interaction is voice+text+icon simultaneously, in English and Tamil for
this build, and runs entirely client-side with no backend.

---

## 1. The state machine

Implement in `src/state/machine.js` as a single reducer with named states
and events. This is the spine every screen hooks into.

```
States:
  IDLE                  -> the Palm screen
  SAFETY_TRIAGE          -> "are they still on the phone"
  MESSAGE_WALL            -> select the fraudulent SMS
  SCOPE                   -> only this one, or more
  REACHED_VIA              -> how the scammer made contact (icon taps)
  READ_BACK                -> confirm 3 generated sentences
  CASE_COMPLETE            -> green screen + outputs
  CALM_MODE                 -> deferred fields (ID, address, evidence)
  GUARDIAN_HANDOFF (parallel, reachable from any state via a persistent button)

Events (illustrative, refine as needed):
  OPEN_CASE            IDLE -> SAFETY_TRIAGE            (also stamps case.openedAt = now())
  STILL_ON_CALL_YES     SAFETY_TRIAGE -> SAFETY_HANGUP_SCRIPT (terminal-ish; offers ALERT_CONTACT)
  STILL_ON_CALL_NO      SAFETY_TRIAGE -> MESSAGE_WALL
  SELECT_MESSAGE(msg)    MESSAGE_WALL -> SCOPE           (runs smsParser, stores parsed fields)
  SCOPE_ONLY_THIS        SCOPE -> REACHED_VIA
  SCOPE_MORE             SCOPE -> MESSAGE_WALL           (loop, accumulate transactions[])
  SELECT_CHANNEL(icon)   REACHED_VIA -> READ_BACK        (runs taxonomyInference)
  CONFIRM_SENTENCE(i, y/n) READ_BACK -> READ_BACK | CASE_COMPLETE (advance i, or transition when i==3)
  ENTER_CALM_MODE        CASE_COMPLETE -> CALM_MODE
  GENERATE_HANDOFF_CODE  any -> unchanged (side effect only)

case object shape (keep this exact shape, it feeds every output adapter):
  {
    id: string,               // uuid
    openedAt: ISOString,
    stillOnCall: boolean | null,
    transactions: [{
      raw: string,             // original SMS/OCR text
      bank: string,
      amount: number,
      currency: 'INR',
      timestamp: ISOString | null,
      accountTail: string | null,
      utr: string | null,
      beneficiaryVpa: string | null,
      confidence: 'high' | 'medium' | 'low',
    }],
    channel: 'call' | 'sms' | 'whatsapp' | 'link' | null,
    ncrpCategory: string | null,
    ncrpSubCategory: string | null,
    stateUt: string | null,
    narrative: string | null,       // composed, >=200 chars, no special chars
    sentenceConfirmations: [boolean, boolean, boolean],
    idAttachment: File | null,      // calm mode only
  }
```

Persist `case` to `localStorage` on every transition (key: `rok:case:<id>`)
so a refresh never loses an in-progress case. Never persist anything under
`AGENTS.md`'s "never persist" list.

---

## 2. The Evidence Recognition Engine (`src/engines/smsParser.js`)

Deterministic, no ML, no network call. One parser function per bank
pattern, tried in sequence; first match wins; return `null` (never throw)
if nothing matches, and let the UI fall back to manual entry.

```ts
parseTransactionSms(text: string): {
  bank: string, amount: number, timestamp: string | null,
  accountTail: string | null, utr: string | null,
  beneficiaryVpa: string | null, confidence: 'high'|'medium'|'low'
} | null
```

Seed it with fixtures for at least these six formats — write them into
`src/fixtures/sampleSms.js` as an exported array `SAMPLE_INBOX`, used by
the Message Wall in demo mode:

```
1. SBI debit:
"Dear Customer, Rs.45000.00 debited from A/c XX4521 on 24-Aug-26 23:47:12
 to VPA scammer123@okhdfcbank (UPI Ref No 412583947261). If not done by
 you, forward this SMS to 9215676766 -SBI"

2. HDFC Bank UPI:
"Alert: Rs 12,500.00 debited from a/c **4521 on 24-08-26 to VPA
 fraudster@ybl. UPI Ref 512348820193. Not you? Call 18002586161. -HDFC Bank"

3. ICICI Bank:
"INR 8,000.00 debited from your A/c XX9981 on 24-Aug-26 for UPI txn.
 Ref No 402719384756. Avl Bal INR 3,241.10 - ICICI Bank"

4. Bank of Baroda:
"Rs.22,000 withdrawn from A/c ...5643 on 24/08/2026 18:32 IST. Info: UPI/
 CR/398271640012/xyz. Bal INR 890.00 -BOB"

5. PNB:
"Your A/c XX7734 debited by Rs 5000.00 on 24-08-2026 15:02:44. UPI Ref
 908172635401 to abc@paytm. If not you, call 18001802222 -PNB"

6. Paytm wallet:
"Rs 3,499 sent to 91XXXXXXXX21 from Paytm Wallet on 24 Aug 2026, 20:11.
 Order ID PYTM88291736452. Helpline 01204456456"
```

For each format, extract amount (strip currency symbol/commas), bank name
(from the sign-off or sender pattern), a plausible timestamp (parse
DD-MM-YY / DD/MM/YYYY variants), the account tail (last 4 digits after
`XX`, `**`, or `...`), the UTR/reference number (the longest pure-digit
run near "Ref"/"UPI Ref"/"Info:"), and a beneficiary VPA (`[\w.]+@[\w]+`
pattern) if present. Mark `confidence: 'low'` if amount or UTR is missing.

Also implement `parseTransactionImage(file): Promise<ParsedTransaction | null>`
in the same file, using Tesseract.js to OCR the image, then running the
extracted text through `parseTransactionSms`.

---

## 3. Taxonomy inference (`src/engines/taxonomy.js`)

Map the four `REACHED_VIA` icons to NCRP-shaped category/sub-category
strings. Use these real NCRP top-level categories (verify current exact
wording against cybercrime.gov.in before finalizing, since portal
taxonomies are revised periodically):

- `call` -> category "Financial Fraud", sub-category "UPI Related Frauds"
  or "Debit/Credit Card Fraud" (choose based on whether a VPA or a card
  reference was parsed)
- `sms` -> category "Financial Fraud", sub-category "Fraud Call/Vishing"
- `whatsapp` -> category "Financial Fraud", sub-category "Internet Banking
  Related Fraud"
- `link` -> category "Financial Fraud", sub-category "Phishing"

Infer `stateUt` from `navigator.language`/`Intl.DateTimeFormat().resolvedOptions().timeZone`
as a best-effort default (e.g. `Asia/Kolkata` gives no state signal — so
in practice this should default to a configurable value and always be
shown to the user as a single confirm/change step, never silently
finalized). Document this limitation in a code comment; do not overstate
what can actually be inferred from a browser.

---

## 4. Narrative composer (`src/engines/narrative.js`)

`composeNarrative(caseObj): string` — build a >=200 character, English,
plain-ASCII (strip everything outside `[A-Za-z0-9 ,.\-]`) description from
the structured case data. Deterministic template, not a model call.
Example shape: "On {date} at {time}, the complainant received a
{channel}-based fraudulent request and subsequently observed an
unauthorized debit of Rs.{amount} from their account ending {tail}
processed via UPI reference {utr} to {vpa}. The complainant did not
authorize this transaction and is reporting it as {subCategory} under
{category}." — pad with a second sentence about the safety-triage answer
if the total is under 200 characters.

`composeReadBackSentences(caseObj): [string, string, string]` — three
short plain-language sentences in the active locale (pull phrasing from
`src/i18n/`), used by the Read-Back screen. These are NOT the same string
as the narrative — they are the spoken/simplified version for confirmation.

---

## 5. Output adapters (`src/engines/outputs.js`)

- `buildNcrpPacket(caseObj): object` — a JSON object whose keys mirror the
  NCRP field list in `docs/DESIGN_SUMMARY.md` Appendix B. This is what
  gets shown/downloaded as the "submission packet" — label it clearly in
  the UI as **not** an actual submission (NCRP has no public API).
- `buildHelplineCard(caseObj, locale): string[]` — four short lines, in
  the target script AND a Latin transliteration, readable aloud to a 1930
  operator.
- `buildCasePdf(caseObj): Blob` — client-side PDF (use a lightweight lib,
  e.g. `pdf-lib` or `jspdf`; pick one and add it to `package.json`).
- `buildGuardianHandoffCode(caseObj): string` — short alphanumeric code;
  for the POC, store the full case JSON in `localStorage` under that code
  and let a second browser tab/window "join" by entering it (this is a
  demo simplification — call it out in a code comment, real handoff would
  need a relay, not localStorage).

---

## 6. Accessibility bus (`src/engines/a11yBus.js`)

A small pub/sub: any screen calls `announce(text, {locale})` on state
entry. Subscribers: (a) an `aria-live="assertive"` region rendered once at
the app root, (b) `speechSynthesis.speak()` if `speechEnabled` is true in
app settings. Every screen must call `announce()` in a `useEffect` on
mount with its own spoken prompt — do not rely on a component remembering
to do this ad hoc; centralize it so it cannot be forgotten.

---

## 7. i18n (`src/i18n/`)

`en.json` and `ta.json`, flat key-value, one file per locale, loaded via a
tiny custom hook `useT()` — do not add a heavy i18n library for a
two-language POC. Every string used anywhere in `src/` must have a key in
both files; add a `npm run check:i18n` script that fails CI if a key is
missing in either file.

---

## 8. Screens (`src/screens/`), in build order

Build and manually verify each screen before moving to the next.

1. **Palm** (`Palm.jsx`) — P0. Full-bleed single button. No dependency on
   reading; icon + short caption. Mic permission requested only after tap
   if voice trigger is used.
2. **SafetyTriage** (`SafetyTriage.jsx`) — P0. Two large icon buttons.
   "Yes" path shows the hang-up script full-screen with a single
   "Alert a trusted contact" button (stub: opens the device's native
   share sheet via the Web Share API with a pre-filled message — do not
   build real SMS sending, browsers cannot do this).
3. **MessageWall** (`MessageWall.jsx`) — **P0, build this one carefully.**
   Card list from `SAMPLE_INBOX` (demo) or an "Upload a screenshot"
   button (real OCR path). Each card: bank, masked amount, timestamp,
   read-aloud button, tap-to-select. Selecting animates the extracted
   fields into a small receipt view before advancing.
4. **Scope** (`Scope.jsx`) — P0. "Only this one" / "There were more" —
   loops back to MessageWall if more.
5. **ReachedVia** (`ReachedVia.jsx`) — P0. Four icon buttons (call, sms,
   whatsapp, link). Include a small collapsed "debug ribbon" (toggle via
   `?debug=1` query param) showing the inferred NCRP category — useful
   for your own demo, not meant for the end user.
6. **ReadBack** (`ReadBack.jsx`) — P0. One sentence at a time, big text +
   TTS, thumbs/yes-no per sentence.
7. **CaseComplete** (`CaseComplete.jsx`) — P0. Large case reference,
   spoken. Three exit cards: "Your money" (static explanation of what
   happens next), "Your job now" (tel: link to a bank helpline field the
   user can edit — do not hardcode a real bank's number), "By tomorrow"
   (static nearest-cyber-cell guidance; do not fake a maps integration
   unless you wire real geolocation + a real static list of cyber cells).
8. **GuardianHandoff** (`GuardianHandoff.jsx`) — P1. Code display +
   "join with a code" entry form.
9. **CalmMode** (`CalmMode.jsx`) — P1. ID photo upload (stored only in
   memory/localStorage, never uploaded anywhere), address fields,
   evidence attachments.
10. **RaceView** (`RaceView.jsx`) — P2, optional, for the pitch itself.
    Side-by-side static comparison (this can mostly reuse the content in
    `docs/DESIGN_SUMMARY.md` Appendix, doesn't need to be dynamic).

---

## 9. Phased task list (hand these to Codex one at a time)

- **Phase 0 — scaffold** (this brief + `AGENTS.md` already do most of
  this): confirm `npm run dev` boots a blank app with the theme tokens
  loaded and routing between the 7 P0 screens as unstyled placeholders
  wired to the state machine. No visual design yet — just prove the
  machine transitions work end to end with console-logged state.
- **Phase 1 — Evidence Recognition Engine**: implement `smsParser.js`
  against the 6 fixtures in section 2, with unit tests
  (`src/engines/smsParser.test.js`) asserting every field for every
  fixture. This can be built and tested with zero UI.
- **Phase 2 — Message Wall**: build screen 3 for real, wired to Phase 1's
  parser and the fixtures. This is the screen the whole pitch rests on —
  budget real time on visual polish here, per `docs/theme` tokens.
- **Phase 3 — the rest of the spine**: screens 1, 2, 4, 5, 6, 7 (P0 set),
  narrative composer, taxonomy inference, accessibility bus wired
  everywhere.
- **Phase 4 — outputs**: `outputs.js`, wired to the Case Complete screen.
- **Phase 5 — guardian handoff + calm mode** (P1).
- **Phase 6 — i18n pass**: audit every string against `en.json`/`ta.json`,
  run `npm run check:i18n`, fix gaps. Get a native Tamil speaker (or a
  careful back-translation pass) to sanity-check the `ta.json` copy
  before the demo — do not ship machine-translated Tamil unreviewed.
- **Phase 7 — accessibility pass**: keyboard-only walkthrough of every
  screen, NVDA/VoiceOver spot check, fix anything silent or unreachable.
- **Phase 8 — Race View + demo polish**.

Acceptance for each phase: `npm run lint && npm run test` pass, and the
phase's own screens/engines meet the "what done means" checklist in
`AGENTS.md`.

---

## 10. Explicit non-goals for this POC

Do not attempt any of the following — they are out of scope and listed
here so Codex doesn't quietly add them:

- No real submission to cybercrime.gov.in (no public API exists).
- No real SMS inbox reading (no browser API for this; screenshot/OCR is
  the real path, the fixture inbox is clearly labeled as a demo).
- No account freeze, no bank integration, no payment integration.
- No server, no database, no user accounts, no auth.
- No collection or storage of OTP, PIN, password, or full account number,
  anywhere, under any circumstance.
