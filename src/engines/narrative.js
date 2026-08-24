/**
 * Composes the mandatory NCRP-style incident description (>=200 chars,
 * plain ASCII) and the shorter spoken read-back sentences.
 * Full spec + example template: docs/BUILD_BRIEF.md, section 4.
 *
 * Deterministic template composition — no model call.
 */

import { inferTaxonomy } from "./taxonomy.js";

/**
 * Strips everything outside the safe NCRP character set.
 * @param {string} text
 * @returns {string}
 */
function sanitize(text) {
  return text.replace(/[^A-Za-z0-9 ,.-]/g, "");
}

/**
 * @param {import('../state/machine.js').Case} caseObj
 * @returns {string} >=200 characters, plain ASCII only (A-Z a-z 0-9 space comma period hyphen)
 */
export function composeNarrative(caseObj) {
  const tx = caseObj.transactions[0];
  if (!tx) return sanitize("No transaction data available for this case. The complainant has initiated a report.").padEnd(200, " ");

  const { category, subCategory } = caseObj.channel
    ? inferTaxonomy(caseObj.channel, tx)
    : { category: "Financial Fraud", subCategory: "UPI Related Frauds" };

  const date = tx.timestamp ? new Date(tx.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "an unknown date";
  const time = tx.timestamp ? new Date(tx.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }) : "an unknown time";

  const channelMap = { call: "phone call", sms: "text message", whatsapp: "WhatsApp message", link: "fraudulent link" };
  const channelText = channelMap[caseObj.channel] || "unknown channel";

  const amountText = tx.amount ? `Rs.${tx.amount.toLocaleString("en-IN")}` : "an unknown amount";
  const accountText = tx.accountTail ? `account ending ${tx.accountTail}` : "their account";
  const utrText = tx.utr ? `UPI reference ${tx.utr}` : "an unidentified reference";
  const vpaText = tx.beneficiaryVpa ? ` to ${tx.beneficiaryVpa}` : "";

  let narrative = `On ${date} at ${time}, the complainant received a ${channelText}-based fraudulent request and subsequently observed an unauthorized debit of ${amountText} from ${accountText} processed via ${utrText}${vpaText}. The complainant did not authorize this transaction and is reporting it as ${subCategory} under ${category}.`;

  /* Pad with safety-triage context if under 200 characters. */
  if (caseObj.stillOnCall === true) {
    narrative += " The complainant was still on the phone with the suspected fraudster at the time of reporting and was instructed to hang up immediately.";
  } else if (caseObj.stillOnCall === false) {
    narrative += " The complainant confirmed they were no longer in contact with the suspected fraudster at the time of reporting.";
  }

  /* Final safety pad to guarantee >=200 chars. */
  if (narrative.length < 200) {
    narrative += " This report was generated using the Rok evidence-recognition system for rapid fraud reporting.";
  }

  return sanitize(narrative);
}

/**
 * @param {import('../state/machine.js').Case} caseObj
 * @returns {[string, string, string]}
 */
export function composeReadBackSentences(caseObj) {
  const tx = caseObj.transactions[0];
  if (!tx) {
    return [
      "You are reporting a financial fraud.",
      "We have recorded your report.",
      "Your case will be filed as a financial fraud complaint.",
    ];
  }

  const amountText = tx.amount ? `Rs.${tx.amount.toLocaleString("en-IN")}` : "an amount";
  const bankText = tx.bank || "your bank";
  const dateText = tx.timestamp
    ? new Date(tx.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : "a recent date";

  const channelMap = { call: "a phone call", sms: "a text message", whatsapp: "a WhatsApp message", link: "a link you clicked" };
  const channelText = channelMap[caseObj.channel] || "an unknown method";

  return [
    `${amountText} was debited from your ${bankText} account on ${dateText}.`,
    `You were contacted through ${channelText} and you did not authorize this transaction.`,
    `We will file this as a financial fraud complaint on your behalf.`,
  ];
}
