# Security

## Assets

Rok processes a user-selected bank SMS or screenshot, the locally derived
transaction details (bank or wallet name, amount, date and time, masked
account tail, reference number, and beneficiary VPA where present), and the
reporting choices made during the intake flow. The in-progress case is stored
only in the browser's `localStorage` so it can survive a reload; it is never
sent to a server. Rok must never collect, persist, log, or transmit an OTP,
PIN, password, or full account number.

## Threats and mitigations

| Threat | Mitigation |
| --- | --- |
| XSS could expose locally held case data. | The deployment sends a restrictive Content-Security-Policy, the app uses React's default JSX escaping rather than `dangerouslySetInnerHTML`, and it includes no third-party trackers, analytics, or runtime CDN scripts. Dependencies are bundled by Vite and must be audited before submission. |
| A malicious browser extension could read `localStorage`. | Browser extensions can operate outside a website's normal security boundary, so CSP cannot fully prevent this. Rok keeps data local and does not create a server-side copy; users should use a trusted browser profile with only trusted extensions when handling a case. |
| A helper could overshare case details through screen recording or screenshots. | Guardian handoff is limited to the same browser on the same device, avoiding a network relay. The POC does not promise cross-device sharing; helpers should only view or record case material with the victim's informed consent. |

## The evaluator sign-in is not authentication

The submission requires credentials, so `src/config/demoAccess.js` holds a
username and password checked in the browser. This is a demo affordance and
must never be described as a security control: the build is static, the
value is readable in the source, and it is printed on the screen it guards.
That is acceptable only because nothing sits behind it — no accounts, no
server, no personal data, and no privileged action. Do not place anything
sensitive behind it, and do not reuse the pattern.

## Out of scope for this submission

No backend, serverless function, KV store, database, or network relay is
being built. Guardian handoff is a same-device, same-browser
`localStorage`-backed demo simplification only. This is a deliberate security
decision, not an oversight: keeping financial-fraud evidence out of a server
eliminates a server-side attack surface for this proof of concept. Real NCRP
submission, inbox access, bank integrations, payment integrations, accounts,
and authentication remain out of scope for this proof of concept.
