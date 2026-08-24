/* eslint-disable no-unused-vars -- stub, remove this line once implemented */
/**
 * Evidence Recognition Engine.
 * Full spec + 6 seed fixtures: docs/BUILD_BRIEF.md, section 2.
 * Fixture data already lives in src/fixtures/sampleSms.js — write this
 * parser against those six formats first, then generalize.
 *
 * Deterministic only. No network calls, no ML model, must work offline.
 */

/**
 * @param {string} text - raw SMS or OCR'd text
 * @returns {{
 *   bank: string,
 *   amount: number,
 *   timestamp: string | null,
 *   accountTail: string | null,
 *   utr: string | null,
 *   beneficiaryVpa: string | null,
 *   confidence: 'high' | 'medium' | 'low'
 * } | null}
 */
// TODO(codex, phase 1): implement.
export function parseTransactionSms(text) {
  throw new Error("not implemented — see docs/BUILD_BRIEF.md section 2");
}

/**
 * OCRs an image via Tesseract.js, then runs the result through
 * parseTransactionSms.
 * @param {File} file
 * @returns {Promise<ReturnType<typeof parseTransactionSms>>}
 */
// TODO(codex, phase 1): implement.
export async function parseTransactionImage(file) {
  throw new Error("not implemented — see docs/BUILD_BRIEF.md section 2");
}
