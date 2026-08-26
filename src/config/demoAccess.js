/**
 * Evaluator sign-in for the hackathon submission.
 *
 * READ THIS BEFORE CHANGING ANYTHING HERE.
 *
 * The submission requires credentials so evaluators can reach the citizen
 * experience. Rok's entire argument is that a fraud victim should never be
 * asked to register, and that NCRP's OTP gate is what costs people their
 * money — so this gate is deliberately NOT part of the citizen journey. It
 * sits in front of the product, is shown once per session, and says on
 * screen that a real victim never sees it.
 *
 * This is NOT authentication and must never be described as such. The check
 * runs in the browser, in a static build with no server, so the value below
 * is readable by anyone who views source. That is acceptable only because
 * there is nothing behind it to protect: no accounts, no personal data, no
 * stored cases but the evaluator's own, and no privileged action. It is a
 * doorbell, not a lock. Do not put anything sensitive behind it, and do not
 * reuse this pattern for anything real.
 */
export const DEMO_ACCESS = {
  username: "evaluator",
  password: "rok-2026",
};

/** Case-insensitive on the username, exact on the password. */
export function checkDemoAccess(username, password) {
  return (
    String(username).trim().toLowerCase() === DEMO_ACCESS.username &&
    String(password) === DEMO_ACCESS.password
  );
}
