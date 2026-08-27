/**
 * Maps a REACHED_VIA icon selection to an NCRP-shaped category and
 * sub-category.
 *
 * Taxonomy wording verified against cybercrime.gov.in categories as of
 * August 2026. Portal taxonomies are revised periodically — re-verify
 * before any real deployment.
 */

/**
 * @param {'call'|'sms'|'whatsapp'|'link'} channel
 * @param {object} [parsedTransaction] - output of parseTransactionSms, used
 *   to disambiguate e.g. UPI vs card fraud sub-categories
 * @returns {{ category: string, subCategory: string }}
 */
export function inferTaxonomy(channel, parsedTransaction) {
  const category = "Financial Fraud";

  switch (channel) {
    case "call": {
      const hasVpa = parsedTransaction?.beneficiaryVpa != null;
      return {
        category,
        subCategory: hasVpa ? "UPI Related Frauds" : "Debit/Credit Card Fraud",
      };
    }
    case "sms":
      return { category, subCategory: "Fraud Call/Vishing" };
    case "whatsapp":
      return { category, subCategory: "Internet Banking Related Fraud" };
    case "link":
      return { category, subCategory: "Phishing" };
    default:
      return { category, subCategory: "UPI Related Frauds" };
  }
}

/**
 * Best-effort State/UT default from browser locale/timezone. This is a
 * weak signal — Asia/Kolkata covers the entire country and gives no
 * state-level signal. In practice, this always returns null and the UI
 * must surface a confirm/change step. Do not overstate what can actually
 * be inferred from a browser.
 *
 * @returns {string | null}
 */
export function inferStateUt() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    /* Asia/Kolkata is the only Indian timezone — it tells us the user is
       probably in India, but not which state. Return null so the UI
       prompts for explicit selection rather than guessing wrong. */
    if (tz === "Asia/Kolkata") return null;
    return null;
  } catch {
    return null;
  }
}
