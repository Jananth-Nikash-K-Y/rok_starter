/* eslint-disable no-unused-vars -- stub, remove this line once implemented */
/**
 * Output adapters: NCRP-shaped packet, 1930 read-aloud card, case PDF,
 * guardian handoff code. Full spec: docs/BUILD_BRIEF.md, section 5.
 *
 * Reminder: buildNcrpPacket produces a packet for the user to review and
 * self-submit — NCRP has no public API, this must never claim to have
 * submitted anything on the user's behalf.
 */

// TODO(codex, phase 4): implement.
export function buildNcrpPacket(caseObj) {
  throw new Error("not implemented — see docs/BUILD_BRIEF.md section 5");
}

// TODO(codex, phase 4): implement.
export function buildHelplineCard(caseObj, locale) {
  throw new Error("not implemented — see docs/BUILD_BRIEF.md section 5");
}

// TODO(codex, phase 4): implement (jspdf is already in package.json).
export function buildCasePdf(caseObj) {
  throw new Error("not implemented — see docs/BUILD_BRIEF.md section 5");
}

// TODO(codex, phase 5): implement (localStorage-backed demo, see brief
// for the explicit caveat to note in a code comment here).
export function buildGuardianHandoffCode(caseObj) {
  throw new Error("not implemented — see docs/BUILD_BRIEF.md section 5");
}
