# Rok — Design Summary (for Codex reference)

Condensed from `Rok_NCRP_Concept.pdf`. Read this once before Phase 0; it
explains *why* the build brief is shaped the way it is. The PDF is the
full document for humans/judges — this file exists because Codex should
not need to parse a PDF to get context.

## The problem in one line

The Golden Hour is spent filling the form. NCRP requires OTP registration,
self-selected complaint category/sub-category, a State/UT selection, a
12-digit UTR typed from memory, a scanned government ID, and a
200-character hand-written description with no special characters —
roughly 21 documented steps — before a financial-fraud complaint is
considered filed. An incomplete form is not a partial complaint; it is no
complaint at all.

## The inversion

NCRP is a prove-it document, built for the investigator who reads it
later. Rok is a stop-it signal, built for the money that is moving now.
Time-critical fields are collected first; everything else (ID scan,
address, suspect details, evidence) is deferred to a calm mode that runs
*after* the case already exists.

## NCRP field -> how Rok obtains it

| NCRP field | Today | Rok |
|---|---|---|
| Category | Dropdown | Inferred from 1 icon tap |
| Sub-category | Dropdown | Inferred from the same tap + parsed txn type |
| State/UT | Selected by complainant | Inferred from locale, then confirmed |
| Incident date/time | Typed | Parsed from the selected SMS |
| Fraud amount | Typed | Parsed from the selected SMS |
| Bank/wallet/merchant | Typed/selected | Parsed from the selected SMS |
| 12-digit UTR | Located and typed | Parsed from the selected SMS |
| Incident description (>=200 chars) | Written by victim | Composed by Rok, read back for yes/no |
| National ID | Scanned and uploaded | Deferred to calm mode |
| Supporting evidence | Uploaded | Deferred; the selected SMS is retained automatically |

## The six mechanics (each is also the accessibility answer)

1. **Case opens on first tap** — nothing destroys an in-progress case.
2. **Point, don't type** — recognition of your own SMS, not recall of a
   UTR. This is the core interaction; it is simultaneously the audio path
   (blind users), the text path (deaf users), and the fast path (everyone).
3. **The clock is the information architecture** — a visible Golden Hour
   countdown gates which questions may appear.
4. **Narrative is derived, never written** — the mandatory description is
   composed from confirmed facts, read back sentence by sentence.
5. **"Are they still on the phone?"** — a direct counter to digital-arrest
   isolation tactics; hang-up script + one-tap alert to a trusted contact.
6. **Guardian handoff, nothing worth phishing** — a trusted helper can
   continue the same case; Rok never asks for an OTP/PIN/password/full
   account number, and says so permanently on screen.

## Target users (the design must work for all of them at once)

Senior citizens, blind/low-vision users, deaf/hard-of-hearing users,
people who read/write with difficulty, non-English/non-Hindi speakers,
rural users with low digital literacy, the "helper" (family member, bank
clerk, CSC operator) reporting on someone else's behalf, and confident
literate users who are also, in the moment, panicking.

## Full source document

`Rok_NCRP_Concept.pdf` in this same folder — cover, executive summary,
12 numbered sections, and three appendices (evidence register, full field
mapping, build plan). Sourced against cybercrime.gov.in's own published
instructions/FAQ and MHA replies placed before the Rajya Sabha; see
Appendix A for the citation for every specific figure or rule quoted
above.
