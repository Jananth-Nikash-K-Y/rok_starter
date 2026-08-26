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

### The sign-in grants, it does not block

Rok's entire argument is that a fraud victim should never be asked to
register. A login placed in front of the citizen journey contradicted the
product — so it no longer sits there.

**The citizen experience is the landing page.** Anyone who opens the URL
lands on "My money is gone" and can report a fraud immediately. There is no
gate.

The credentials now *unlock the reviewer tools* rather than unlocking the
product: signing in turns on the inferred-NCRP-taxonomy ribbon and the
side-by-side Race. Evaluators experience the platform using the supplied
credentials, which is what this submission asks for, and nobody in a crisis
ever meets a login screen.

**Reviewers:** open the app, then use **"Reviewing this project? Sign in"**
in the footer. The sign-in screen also makes the argument directly — beside
the form it sets what NCRP demands before a complaint can begin (register,
OTP, password, then a 21-step form) against what Rok demands before a case
is open (**nothing**).

There is no citizen login and no case-status lookup, because there is no
server: a case lives in the browser that created it. A returning user is
offered "Continue my report" on the opening screen when a case really is on
that device — no code, nothing to remember, nothing to forget.

It is a doorbell, not a lock, and says so on screen: the check runs in the
browser, there is no server, no accounts and no personal data behind it.
Credentials live in `src/config/demoAccess.js`.

---

## 3. Two-minute video script

Reflects the actual shipped flow as of 26 August 2026: ungated landing,
four questions, live in English/Hindi/Tamil/Telugu, auto-saving PDF, three
equal ways to send the case (call, write, or hand to a helper). Do not
accelerate anything on screen — the real timing is the point. Speak at a
natural pace; the lines below run close to 150 words/minute, which lands
inside 60 seconds each half with room to breathe.

### First 60 seconds — the user demo (no narration of tech, no jargon)

Record one clean, uninterrupted run. Do several takes and pick the one
where nothing stumbles — this half has to look effortless because the
product is supposed to be.

| Time | On screen | Say |
| --- | --- | --- |
| 0:00–0:08 | Black, or the NCRP instructions page for one beat | "It's midnight. Forty-five thousand rupees just left Kamala's account. To report it today, she'd need to register, wait for an OTP, and fill a twenty-one step form — in a language she doesn't read." |
| 0:08–0:14 | Rok's landing screen. Tamil selected. Just the red button. | "Rok asks her one thing." |
| 0:14–0:19 | Tap the button. Nothing else on screen. | *(no narration — let the silence land)* "That's it. Her case is already open." |
| 0:19–0:26 | "Are they still on the phone?" → tap No | "First question is about her, not the money." |
| 0:26–0:38 | The message wall. Slow pan across the amounts. Tap ₹45,000. The receipt fills in. | "Then the only real question: which one is wrong? She recognizes her own money — she never typed a number." |
| 0:38–0:48 | Only this one → How they were contacted (tap the phone icon) → the state auto-narrows to three, tap one | "A few taps confirm what happened. No forms, no categories to understand." |
| 0:48–0:55 | Read-back: three short sentences, tap Yes each time | "Rok writes the complaint. She just says yes." |
| 0:55–1:00 | Green screen, case number large, PDF already saving | "Done. Under a minute. She never typed a word." |

### Second 60 seconds — why it was built this way

| Time | On screen | Say |
| --- | --- | --- |
| 1:00–1:10 | Split screen or the NCRP step list again | "The system that freezes stolen money already works — it's recovered thousands of crores. What fails is the first sixty seconds: the intake form. So we rebuilt the intake, not the backend." |
| 1:10–1:20 | Message wall again, tap-to-select | "The core idea is recognition over recall. A victim in shock can't remember a transaction ID, but she can recognize her own bank message. So Rok shows her the evidence and asks her to point, not type." |
| 1:20–1:30 | Language switcher: English → Hindi → Tamil → Telugu | "It runs in four languages, speaks every screen aloud, and works for someone who can't read at all — because the fast path and the accessible path are the same path here, not two separate builds." |
| 1:30–1:38 | The three "send it" options on the final screen | "Filing still needs a human step today, so we give three equal ways to finish: call it in, send it in writing, or hand it to a helper — because a phone-only option would exclude anyone who's deaf." |
| 1:38–1:48 | The auto-saving PDF notice | "The moment the case is ready, a PDF saves itself in her own language — so even if she closes the app, she's holding proof." |
| 1:48–1:58 | The landing screen again, empty | "There's no login for a citizen, no account, nothing to remember. It's a browser proof of concept — no backend, so there's nothing of hers stored anywhere but her own phone." |
| 1:58–2:00 | Rok wordmark | "Rok — stop the money, not the paperwork." |

**Shots to capture before editing:** one uninterrupted full run of the
citizen flow start to finish; the language switcher; the three send
options; the auto-save notice appearing.

## 4. Summary (max 250 words)

Rok rebuilds how citizens report financial cyber fraud to India's
National Cyber Crime Reporting Portal.

The freeze machinery behind the portal already works and has recovered
thousands of crores. What fails is the first sixty seconds: reporting a
fraud today means registering, waiting for an OTP, and completing a
roughly twenty-one step form — in Hindi or English only — while recalling
a twelve-digit transaction ID from memory. That is often impossible for a
frightened or low-literacy victim, and every lost minute is money gone.

Rok replaces recall with recognition. One tap opens the case immediately,
before anything else is known. Instead of typing a transaction ID, the
citizen is shown their own bank messages and asked to point at the wrong
one — Rok reads the amount, time, and reference number from it directly.
A few short questions later, Rok has written the complaint and read it
back for a yes. It runs in English, Hindi, Tamil, and Telugu, speaks
every screen aloud, and needs no account, login, or typing.

The finished case saves itself as a document in the citizen's own
language, and can be filed by phone, in writing, or through a helper.

Rok is built for the people existing portals fail hardest: elderly
citizens, low-literacy users, non-English speakers, and anyone too
frightened to navigate a government form. It is a working browser proof
of concept, not a mockup — citizen-first, accessible by default, and far
simpler than the system it replaces.

---

## Requirement checklist

| Requirement | Status |
| --- | --- |
| Browser-based POC, not a mobile app | React + Vite single page, runs in any modern browser |
| Live public link anyone can test | Static build ready; deploy step needs your Vercel/GitHub login |
| Login credentials for evaluators | `evaluator` / `rok-2026`, printed on the sign-in screen (reached via the "Reviewing this project? Sign in" link in the footer) |
| Citizen perspective reachable with them | The citizen flow needs no credentials at all — it is the landing page. Signing in unlocks reviewer-only tools (taxonomy ribbon, side-by-side Race) on top of it |
| 2-minute video | Script above, timed and shot-listed |
| 250-word summary | Above |
