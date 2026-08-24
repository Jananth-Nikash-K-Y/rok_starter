/* eslint-disable no-unused-vars -- stub, remove this line once implemented */
/**
 * Maps a REACHED_VIA icon selection to an NCRP-shaped category and
 * sub-category. Full spec: docs/BUILD_BRIEF.md, section 3.
 *
 * Verify the exact current NCRP taxonomy wording against cybercrime.gov.in
 * before finalizing — portal taxonomies are revised periodically and this
 * stub's TODO fixtures should not be trusted as current without that check.
 */

/**
 * @param {'call'|'sms'|'whatsapp'|'link'} channel
 * @param {object} [parsedTransaction] - output of parseTransactionSms, used
 *   to disambiguate e.g. UPI vs card fraud sub-categories
 * @returns {{ category: string, subCategory: string }}
 */
// TODO(codex, phase 3): implement.
export function inferTaxonomy(channel, parsedTransaction) {
  throw new Error("not implemented — see docs/BUILD_BRIEF.md section 3");
}

/**
 * Best-effort State/UT default from browser locale/timezone. This is a
 * weak signal (timezone alone can't identify an Indian state) — always
 * surface it to the user as a single confirm/change step, never finalize
 * silently.
 * @returns {string | null}
 */
// TODO(codex, phase 3): implement.
export function inferStateUt() {
  throw new Error("not implemented — see docs/BUILD_BRIEF.md section 3");
}
