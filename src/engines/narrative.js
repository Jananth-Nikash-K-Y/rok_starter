/* eslint-disable no-unused-vars -- stub, remove this line once implemented */
/**
 * Composes the mandatory NCRP-style incident description (>=200 chars,
 * plain ASCII) and the shorter spoken read-back sentences.
 * Full spec + example template: docs/BUILD_BRIEF.md, section 4.
 *
 * Deterministic template composition — no model call.
 */

/**
 * @param {import('../state/machine.js').Case} caseObj
 * @returns {string} >=200 characters, matches /^[A-Za-z0-9 ,.\-]+$/
 */
// TODO(codex, phase 3): implement.
export function composeNarrative(caseObj) {
  throw new Error("not implemented — see docs/BUILD_BRIEF.md section 4");
}

/**
 * @param {import('../state/machine.js').Case} caseObj
 * @param {string} locale
 * @returns {[string, string, string]}
 */
// TODO(codex, phase 3): implement.
export function composeReadBackSentences(caseObj, locale) {
  throw new Error("not implemented — see docs/BUILD_BRIEF.md section 4");
}
