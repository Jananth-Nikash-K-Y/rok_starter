# Rok — backlog

Everything known to be outstanding, with the reason it matters. Ordered by
what blocks what, not by size.

Last audited: 25 August 2026.

---

## 1. Blocking submission

Nothing else counts until these are done.

| # | Item | Why it blocks | Who |
| --- | --- | --- | --- |
| 1.1 | **Deploy and paste the live URL** into `SUBMISSION.md` | The submission requires a live public link. The build is ready and `vercel.json` is in place; the deploy itself needs a Vercel or GitHub login. | You — needs your auth |
| 1.2 | **Record the 2-minute video** | Mandatory deliverable. Timed script and shot list are in `SUBMISSION.md` §3. | You |
| 1.3 | **Commit the working tree** | ~10 files uncommitted, including the evaluator gate and voice tooling. | Either |

**Do 1.1 first.** Verify by opening the URL on a phone, signing in with
`evaluator` / `rok-2026`, and completing one full case end to end.

---

## 2. Owed before anyone judges it

These do not block submitting, but the project makes claims that these
verify. Shipping without them means the claims are untested.

| # | Item | Why it matters |
| --- | --- | --- |
| 2.1 | **Native-speaker review of Hindi, Tamil and Telugu copy** | 206 keys per language, written carefully but unreviewed. `AGENTS.md` forbids shipping unreviewed Indic copy, and a mistranslation in a fraud report is worse than English. |
| 2.2 | **macOS Enhanced voices before filming** | Five minutes, free, no code change. The default compact voices are the robotic ones. See `docs/VOICE_SETUP.md` Part A. |
| 2.3 | **Manual NVDA / VoiceOver pass** | Automated checks prove every control has a name; they do not prove the flow is coherent by ear. The blind user is a headline target user. |
| 2.4 | **Lighthouse on the deployed build** | Targets: Accessibility ≥ 95, Performance ≥ 90. Never run — local checks are not a substitute. |

2.1 and Part B of the voice work are the same sitting: the reviewer reads
each line aloud while you record.

---

## 3. Post-submission improvements

Safe to land after the link is live. None require app changes that risk the
demo.

| # | Item | Notes |
| --- | --- | --- |
| 3.1 | **Ship the 120 audio clips** | `docs/VOICE_SETUP.md` Part B. Colab + Indic Parler-TTS, then `npm run audio:register`. Anything unrecorded falls back to synthesis, so this can land partially. |
| 3.2 | **Restore the NCRP field-mapping table** | It was dropped when Race View became a live timed race. Ten real mandatory NCRP fields against how each system obtains them — that content came straight from the concept document's Appendix B and is worth keeping below the race. |
| 3.3 | **Remove 5 orphaned i18n keys** | `caseComplete.helpline_card`, `caseComplete.copy_lines`, `raceView.field_column`, `raceView.table_caption`, `raceView.source_note` — left behind by the CaseComplete and RaceView rewrites. 20 entries across 4 locales. Resolve together with 3.2, which may re-use three of them. |
| 3.4 | **Offline / installable PWA** | Service worker plus manifest. The app is already fully client-side, so this is cheap, and "works with no signal" is a real claim for a rural user, not a checkbox. |
| 3.5 | **Bhashini as the production voice path** | MeitY's national platform covers all 22 scheduled languages. As a runtime API it is a dependency Rok deliberately avoids, but "in production the voice is the Government's own language stack" is a strong line for the pitch and a genuine path to 22 languages. |
| 3.6 | **More bank SMS templates** | 24 institutions plus a bank-agnostic fallback today. Every added template moves a message from `medium` to `high` confidence. |
| 3.7 | **Verify the four display modes on real devices** | Light, dark, light+high-contrast and dark+high-contrast all pass contrast audits and the 360px sweep in a browser. An OLED phone and an actual low-vision user are a different test. |
| 3.8 | **PNG icon exports for iOS** | The SVG favicon covers browsers and Android install. iOS home-screen icons need PNG (180px `apple-touch-icon`, plus 192/512 for a fuller manifest), and no rasteriser is installed here. Export once from `public/icon.svg` in any design tool, drop into `public/`, then add the `apple-touch-icon` link back to `index.html`. Until then iOS falls back to a screenshot — degraded, not broken, and no 404. |
| 3.9 | **Print stylesheet** | A victim taking the case to a cyber cell will print it. Today that prints the app chrome. |

---

## 4. Bigger questions, not yet decided

| # | Question | The trade-off |
| --- | --- | --- |
| 4.1 | **Cross-device guardian handoff** | Today the handoff code works on one device only, and says so on screen. Real handoff needs a relay server — which would end the "no backend, nothing to breach" security story that is currently one of the strongest claims. Not a bug; a deliberate trade that should only change with eyes open. |
| 4.2 | **Shared-device privacy** | Raised by a teammate and worth taking seriously. A case restored from `localStorage` is right for a victim on their own phone and wrong on a CSC operator's shared terminal. Current answer is that the operator taps "Report another fraud" between citizens, which clears storage. If kiosk deployment becomes real, this needs an explicit shared-device mode rather than removing restore, which would break mechanic M1. |

---

## 5. Accepted limitations — do not "fix" these

Listed so nobody spends a night solving something that is deliberate. Each
is stated on screen or in the docs.

- **No backend.** A server that never receives fraud evidence cannot leak or
  be subpoenaed. This is a security posture, not an unfinished piece.
- **No real submission to NCRP.** The portal has no public API. Rok produces
  a validated packet and a 1930 card and says so on screen. Faking a success
  screen would be the single most damaging thing this project could do.
- **The evaluator gate is not authentication.** Client-side check, static
  build, credentials printed on the screen they guard. There is nothing
  behind it to protect. See `SECURITY.md`.
- **The SMS inbox is a fixture.** Browsers cannot read SMS. The screenshot
  and OCR path is the genuinely working real-device path, and demo mode is
  labelled on screen.
- **Sentences carrying live data stay synthetic.** You cannot pre-record an
  amount you do not know yet, and splicing a synthetic number into a
  recorded sentence sounds worse than either alone.
- **Jurisdiction is a shortlist, not a determination.** One centre per state
  cannot represent a large irregular one — Bengaluru sits nearer the centre
  of Tamil Nadu than of Karnataka. Geometry narrows 36 to 3 reliably; it
  cannot pick 1. The user always confirms.
- **The amount is never masked.** The account number is. Recognition of the
  amount is the mechanic the Message Wall exists for.
