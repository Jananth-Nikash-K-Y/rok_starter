# Rok — Hackathon Submission

Four deliverables: the live link, the evaluator credentials, the 2-minute
video script, and the 250-word summary.

---

## 1. Live public link

> **URL:** `_______________________________`
> *(fill this in after deploying — see "Deploying" below)*

Rok is a fully client-side single-page app. It is **browser-based, not a
mobile app**, and works on any modern browser on a phone, tablet or laptop.
There is no backend to provision, so the deployment is a static build.

### Deploying

The build is already passing and `vercel.json` (with the CSP headers) is in
place. Either route works:

**Vercel CLI**

```bash
npm install -g vercel && vercel login && vercel --prod --yes
```

**Vercel dashboard** — New Project → Import `Jananth-Nikash-K-Y/rok_starter`.
Framework preset **Vite**, build `npm run build`, output `dist`. No
environment variables are needed.

Both need your own Vercel or GitHub authentication, so this is the one step
that has to be run by you. `docs/DEPLOY.md` has the detail.

Verify after deploying: open the URL on a phone, sign in with the
credentials below, and complete one full case.

---

## 2. Evaluator credentials

| | |
| --- | --- |
| **Username** | `evaluator` |
| **Password** | `rok-2026` |

Both are printed on the sign-in screen itself, so an evaluator never has to
hunt for them. The username is case- and whitespace-insensitive.

### Why there is a sign-in at all

Rok's entire argument is that a fraud victim should never be asked to
register — NCRP's OTP gate is the thing that costs people their money. A
login placed in front of the citizen journey would contradict the product.

So the gate is deliberately **not part of the citizen journey**. It is one
screen, shown once per session, addressed to evaluators, and it uses the
requirement to make the case: beside the sign-in form it lists what NCRP
demands before a complaint can begin (register, OTP, password, then a
21-step form) against what Rok demands before a case is open (**nothing**).
Sign in once and everything after it asks for nothing at all.

It is a doorbell, not a lock, and says so on screen: the check runs in the
browser, there is no server, no accounts and no personal data behind it.
Credentials live in `src/config/demoAccess.js`.

---

## 3. Two-minute video script

Record at 1080p portrait or landscape, real device or browser at 390×844.
Speak at a normal pace — the timings below assume roughly 150 words/minute.
Do not accelerate the app; the point is that it is genuinely this fast.

### Minute one — the user's perspective (0:00–1:00)

| Time | On screen | Say |
| --- | --- | --- |
| 0:00–0:10 | The concept doc's list of NCRP demands, or the Race view paused | "It's 11:47 at night and ₹45,000 has just left Kamala's account. To report it, the national portal asks her to register, wait for an OTP, classify her own crime, find a twelve-digit transaction ID, and write two hundred characters — about twenty-one steps, in Hindi or English. She reads neither." |
| 0:10–0:16 | Rok opens. One red button. Tamil selected. | "Rok asks her for one thing." |
| 0:16–0:22 | Tap **Start now**. Clock appears at 59:5x. | "Her case is open. Timestamped. Before a single question." |
| 0:22–0:30 | "Are they still on the phone?" → tap **No** | "First question is her safety, not her money." |
| 0:30–0:42 | Message Wall. Slow scroll past the amounts. Tap **₹45,000**. Receipt appears. | "Then the only question that matters: which one is the wrong one? She recognises the amount. Rok reads out the bank, the time, the reference number and where the money went — from her own message. She typed nothing." |
| 0:42–0:50 | **Only this one** → **Phone call** → **Where are you?** → tap the State | "Only this one. They called her. She confirms her State — the app narrowed thirty-six down to three." |
| 0:50–0:56 | Read-back, three sentences, tap Yes each time | "It writes the complaint for her, and reads it back. She only says yes." |
| 0:56–1:00 | Green screen, case reference large | "Fifty seconds. Nothing typed. No English." |

### Minute two — design and development decisions (1:00–2:00)

| Time | On screen | Say |
| --- | --- | --- |
| 1:00–1:12 | Race view, running | "The machinery to freeze that money already works — over seven thousand crore recovered. The bottleneck is intake. So we changed what a report *is*: NCRP is a prove-it document for the investigator who reads it later. Rok is a stop-it signal for the money moving now." |
| 1:12–1:24 | Message Wall again | "That changes the unit of success: an open case plus one freeze-relevant identifier, not a completed form. And it means recognition, not recall — the answer is already in her pocket. Recognition is the one thing that survives panic, age, low literacy and blindness." |
| 1:24–1:34 | Golden Hour clock, then Calm Mode | "The clock isn't decoration — it decides what the screen is allowed to ask. ID, address and paperwork are deferred to a calm mode that opens only after the case exists." |
| 1:34–1:46 | Code or architecture figure | "It's a hundred percent client-side. No backend isn't a shortcut — a server that never receives fraud evidence can't leak it. Parsing is deterministic regex, no model in the critical path, works offline. OCR runs on the device." |
| 1:46–1:54 | Language picker, then the three send routes | "Four languages, auto-detected. And because 1930 is a telephone line that excludes deaf users, sending in writing and handing the case to a helper are equal options, not fallbacks." |
| 1:54–2:00 | The "not yet filed" notice | "NCRP has no public API, so Rok doesn't fake a submission. It produces a validated packet and a helpline card, and says so on screen." |

**Shots to capture in advance:** one clean uninterrupted run of the citizen
flow (this is the hardest to get right — do it several times), the Race
reaching 1:05, the language picker open, and the three send routes.

---

## 4. Summary (250 words)

Rok reimagines citizen intake for India's National Cyber Crime Reporting
Portal.

India's fraud-freeze machinery already works: the system connecting police,
banks and telecoms has saved over ₹7,000 crore across 23 lakh complaints.
The bottleneck is intake. To report a fraud today, a victim must register
with a mobile number and an OTP, classify their own crime into a government
taxonomy, select the investigating State, locate a twelve-digit transaction
ID, upload a scanned photo ID, and write a 200-character description without
special characters: roughly 21 steps, offered only in Hindi and English. An
incomplete form is not a partial complaint — it is no complaint at all. The
golden hour is spent filling the form.

Rok opens a timestamped case on the first tap, before anything is known. It
never asks for a transaction ID: it shows victims their own bank messages,
reads them aloud in their language, and asks one question — which one is the
wrong one? It extracts the amount, time, bank, reference and beneficiary
from that message, infers the taxonomy from four icon taps, narrows 36
jurisdictions to one confirmation, composes the mandatory description, and
reads it back for a yes or no.

The result is a submittable complaint in under a minute, with zero words
typed and no English required, in four languages. Accessibility is not a
layer added afterwards: recognising your own evidence is simultaneously the
fastest, spoken and icon path. Abandon it halfway and a live case still
exists.

---

## Requirement checklist

| Requirement | Status |
| --- | --- |
| Browser-based POC, not a mobile app | React + Vite single page, runs in any modern browser |
| Live public link anyone can test | Static build ready; deploy step needs your Vercel/GitHub login |
| Login credentials for evaluators | `evaluator` / `rok-2026`, printed on the sign-in screen |
| Citizen perspective reachable with them | Sign-in leads directly into the full citizen flow |
| 2-minute video | Script above, timed and shot-listed |
| 250-word summary | Above |
