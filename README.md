# Rok — रोक

**Stop the money before the paperwork starts.**

A browser-based reimagining of India's National Cyber Crime Reporting Portal
(cybercrime.gov.in), built for the **Build What Moves India** hackathon.

| 21 steps → 4 questions | ~10 minutes → under 60 seconds | 0 words typed | 4 languages, spoken aloud | No login, no backend |
| --- | --- | --- | --- | --- |

## The problem

India's fraud-freeze machinery already works. The Citizen Financial Cyber
Fraud Reporting and Management System connects police, banks and telecom
operators so a single complaint can hold a mule account while the money is
still traceable — more than ₹7,000 crore saved across 23 lakh complaints.

The bottleneck is not the police or the banks. It is citizen intake.

To open a financial-fraud complaint today, a victim must register with an
OTP, classify their own crime into a government taxonomy, choose the state
that will investigate, find a twelve-digit transaction ID, upload a scanned
government photo ID, and write two hundred characters about their own
humiliation without using an apostrophe — across roughly 21 steps, in Hindi
or English only. An incomplete form is not a partial complaint. It is no
complaint at all.

**The Golden Hour is spent filling the form.**

## The inversion

NCRP is a *prove-it* document, structured for the investigator who reads it
later. Rok is a *stop-it* signal, structured for the money that is moving
right now.

The case opens on the first tap, before anything is known. Rok never asks
for a transaction ID — it shows the victim their own bank messages, reads
them aloud in their language, and asks one question: **which one is the
wrong one?** It infers the government taxonomy from four icon taps, writes
the mandatory description itself, and reads it back for a yes or no. A
visible Golden Hour clock decides what the interface is allowed to ask;
everything that is paperwork waits until after the case exists.

The result is a complete, submittable complaint in under a minute, with
zero words typed and no English required — and the accessible path and the
fast path are the same path.

## The journey, as a wireframe

Seven screens. Four of them are questions. Nothing is typed.

```
   ENTRY                                                    THE CLOCK STARTS HERE
     │                                                                │
     ▼                                                                ▼
┌──────────────────┐   tap    ┌──────────────────┐         ┌──────────────────┐
│       ✋         │  ──────▶ │  Are they still  │  ─ No ─▶ │ Which one is     │
│                  │          │  on the phone?   │         │ wrong?           │
│  My money is     │          │                  │         │                  │
│  gone            │          │  ┌─────┐ ┌─────┐ │         │ ┌──────────────┐ │
│ ┌──────────────┐ │          │  │ 📞  │ │ 📵  │ │         │ │ SBI          │ │
│ │  START NOW   │ │          │  │ Yes │ │ No  │ │         │ │ ₹45,000   ✓  │ │◀── tap
│ └──────────────┘ │          │  └─────┘ └─────┘ │         │ ├──────────────┤ │    every
│  🔊 Read to me   │          │        │         │         │ │ HDFC         │ │    one
└──────────────────┘          └────────┼─────────┘         │ │ ₹12,500   ✓  │ │    that's
   case opens                          │ Yes               │ └──────────────┘ │    wrong —
   on this tap                         ▼                   │ 📷 Upload photo  │    not just
                              ┌──────────────────┐         │ [ Continue → ]   │    the first
                              │  HANG UP NOW.    │         └────────┬─────────┘
                              │  1 End the call  │                  │
                              │  2 Tell them     │                  ▼
                              │    nothing       │         ┌──────────────────┐
                              │  3 Send nothing  │         │ This is what we  │
                              │  [Tell someone]  │         │ read             │
                              └────────┬─────────┘         │  ₹45,000  SBI    │
                                       │                   │  ✓ Read clearly  │
                                       └──────────────────▶│  [Fix it here]   │
                                                           │  ◀ 1 of 2 ▶      │◀── swipe
                                                           │ [Yes, right → ]  │    each one
                                                           └────────┬─────────┘
                                                                    │
     ┌──────────────────┐         ┌──────────────────┐         ┌────▼─────────────┐
     │ Is this true?    │ ◀────── │ Which state are  │ ◀────── │ How did they     │
     │                  │         │ you in?          │         │ reach you?       │
     │ "₹57,500 left    │         │ ┌────┐┌────┐┌───┐│         │                  │
     │  your accounts…" │         │ │T.N.││Kar.││AP ││         │ 📞  💬  🟢  🔗   │
     │ ┌────┐  ┌──────┐ │         │ └────┘└────┘└───┘│         └──────────────────┘
     │ │ No │  │ YES  │ │         │  36 → 3 by GPS   │            taxonomy inferred
     │ └────┘  └──────┘ │         └──────────────────┘
     │  ●●○  3 sentences│
     └────────┬─────────┘
              │
              ▼
     ┌────────────────────────────────────────────┐
     │              ✓  YOUR CASE IS OPEN          │   ◀── under 60 seconds
     │                                            │
     │              ROK-NX7-V4K                   │
     │                 For ₹57,500                │
     ├────────────────────────────────────────────┤
     │  Your case in four lines                   │
     │  1 My case reference is ROK-NX7-V4K.       │
     │  2 Rs.45,000 left my SBI account on…       │
     │  3 Rs.12,500 left my HDFC account on…      │
     │  4 The money went to scammer123@…          │
     │                                            │
     │  SEND IT WHICHEVER WAY SUITS YOU           │
     │  ┌──────────┐ ┌──────────┐ ┌────────────┐  │
     │  │ 📞 Speak │ │ 💬 Write │ │ 👥 Ask     │  │  ◀── peers, not
     │  │ Call 1930│ │ No call  │ │ someone    │  │      a primary
     │  └──────────┘ └──────────┘ └────────────┘  │      and fallbacks
     └───────────────────┬────────────────────────┘
                         │
                         ▼   the clock and progress bar disappear here
              ┌──────────────────────┐
              │  When you are ready  │   Calm mode: ID, address, evidence.
              │  (no clock, no red)  │   None of it was needed to open the case.
              └──────────────────────┘
```

Selecting more than one wrong payment carries all the way through — the
total, the read-back, the four-lines helpline card, and the downloaded PDF
each account for every transaction the citizen ticked, not just the first.

Every screen carries the same three things in the same place: the step count,
the question, and a **Listen** button. A user who cannot read learns one
layout, not eight.

## For evaluators

Sign in with **`evaluator` / `rok-2026`** (both printed on the sign-in
screen). That one screen exists only because the submission asks for
credentials — a citizen never sees it, and everything after it asks for
nothing at all. Full submission details, including the video script and the
250-word summary, are in [`SUBMISSION.md`](./SUBMISSION.md).

## See it in 60 seconds

Open **NCRP today vs Rok** from the footer and press **Start the race**. Both
lanes run against one clock, in real time and unaccelerated: Rok files at
0:50, while the portal is still waiting on an OTP at step 3 of 21.

## Status

Built and running. The full flow works end to end, from the first tap to a
downloadable complaint packet, with a live Golden Hour clock and a working
screenshot-to-OCR path.

The interface speaks **English, Hindi, Tamil and Telugu**, each in its own
typeface. The language is detected from the browser before the user is asked
for anything — a fraud victim should not have to find a menu in a script they
cannot read — and the guess is shown, and changeable, from every screen.

Every change must pass all five checks before it lands:

```bash
npm run lint && npm run test && npm run build && npm run check:i18n && npm audit
```

**Known gaps, stated plainly:** none of the Hindi, Tamil or Telugu copy has
been reviewed by a native speaker, and it should not be demoed as final
until it has. A manual screen-reader pass and a Lighthouse run on the
deployed build are still owed — the automated checks above do not replace
either.

## What this deliberately is not

- **Not a chatbot.** Four fixed questions, recognition-only inputs, no free
  text anywhere in the flow.
- **Not a translation layer.** A translated hostile form is still hostile.
  Rok removes the questions rather than translating them.
- **Not "add voice".** Voice was already added to this exact form because
  the form is too slow, and it did not make the form shorter.
- **Not a fake integration.** NCRP has no public API. Rok produces a
  validated packet and a 1930 read-aloud card, and says so on screen.
- **Not a wall of text.** Every question is short enough to hear in one
  breath, every answer is an icon plus a few words, and every screen has a
  Listen button. Nothing autoplays.
- **Not dependent on a phone call.** 1930 is a telephone line, which
  excludes deaf and non-verbal users entirely. Speaking, sending in writing
  and handing the case to a helper are offered as peers — whichever a
  person can do is the right one.
- **Not a contrast toggle instead of a design.** Rok ships text-size and
  high-contrast controls *on top of* defaults that already clear WCAG 2.1
  AA; in high-contrast mode every text pairing clears AAA. The critique of
  NCRP is that a toggle was offered in place of considered design, not that
  toggles are bad.

## Stack

- React 18 + Vite, plain CSS with design tokens — no component library
- One explicit finite state machine; the flow is auditable, not emergent
- Deterministic regex parsing, no model in the critical path, works offline
- Tesseract.js for OCR, Web Speech API for audio, client-side PDF
- Fonts self-hosted, so nothing loads from a third-party origin at runtime
- **No backend.** A server that never receives fraud evidence cannot leak
  it. Nothing is transmitted anywhere until the user exports a file.

Security posture and threat model: [`SECURITY.md`](./SECURITY.md).

## Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build -> dist/
npm run preview    # serve the production build locally
```

Append `?debug=1` to surface the state machine and the inferred NCRP
taxonomy mapping.

## Deployment

Static build, deployable anywhere that serves static files. See
[`docs/DEPLOY.md`](./docs/DEPLOY.md).

## License / disclaimer

Hackathon proof of concept. Not affiliated with I4C, MHA, or the Government
of India. Produces a validated complaint *packet* — it does not submit to
cybercrime.gov.in, which has no public API.
