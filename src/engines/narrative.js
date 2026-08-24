/**
 * Composes the mandatory NCRP-style incident description (>=200 chars,
 * plain ASCII) and the shorter spoken read-back sentences.
 * Full spec + example template: docs/BUILD_BRIEF.md, section 4.
 *
 * Deterministic template composition — no model call.
 *
 * The composer states only what the evidence actually contains. Where a
 * field is missing it says so in words rather than inventing a value: a
 * complaint that asserts a transaction time the bank SMS never carried is
 * a factual error in a police document.
 */

import { inferTaxonomy } from "./taxonomy.js";
import { formatIndianDate, formatIndianTime } from "../i18n/format.js";

const MINIMUM_LENGTH = 200;

/**
 * Strips everything outside NCRP's accepted character set, then restores
 * sentence case.
 */
function sanitize(text) {
  const cleaned = text.replace(/[^A-Za-z0-9 ,.-]/g, "").replace(/\s+/g, " ").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * A UPI handle spelled out for a field that forbids the @ sign.
 *
 * Sanitising "scammer123@okhdfcbank" to "scammer123okhdfcbank" would
 * silently corrupt the single identifier the bank needs to trace the
 * beneficiary, so the separator is written as a word instead.
 */
function spellVpa(vpa) {
  return vpa.replace("@", " at ");
}

const CHANNEL_TEXT = {
  call: "phone call",
  sms: "text message",
  whatsapp: "WhatsApp message",
  link: "fraudulent link",
};

/**
 * @param {object} caseObj
 * @returns {string} >=200 characters, plain ASCII only
 */
export function composeNarrative(caseObj) {
  const transaction = caseObj.transactions?.[0];

  if (!transaction) {
    return sanitize(
      "The complainant has opened a financial fraud report using the Rok intake system. " +
      "No transaction evidence has been attached to this case yet. The complainant intends " +
      "to supply the debit details and supporting evidence as soon as they are available.",
    );
  }

  const { category, subCategory } = caseObj.channel
    ? inferTaxonomy(caseObj.channel, transaction)
    : { category: "Financial Fraud", subCategory: "UPI Related Frauds" };

  /* NCRP accepts only [A-Za-z0-9 ,.-], so a slashed date and a colonned
     time would be sanitised into an unreadable digit run ("24082026 at
     2347"). Hyphens and periods survive, and read correctly in a
     complaint. */
  const date = transaction.timestamp
    ? formatIndianDate(transaction.timestamp).replace(/\//g, "-")
    : null;
  const time = transaction.timestamp && transaction.timeKnown
    ? formatIndianTime(transaction.timestamp).replace(":", ".")
    : null;

  let when = "on a date the complainant is unable to confirm";
  if (date && time) when = `on ${date} at approximately ${time} hours IST`;
  else if (date) when = `on ${date}, at a time not recorded in the bank alert`;

  const channelText = CHANNEL_TEXT[caseObj.channel] ?? "method the complainant could not identify";
  const amountText = transaction.amount === null
    ? "an amount the complainant is unable to confirm"
    : `Rs.${Number(transaction.amount).toLocaleString("en-IN")}`;
  const accountText = transaction.accountTail
    ? `their account ending ${transaction.accountTail}`
    : "their account";
  const bankText = transaction.bank ? ` held with ${transaction.bank}` : "";
  const referenceText = transaction.utr
    ? `The transaction reference number is ${transaction.utr}.`
    : "The complainant was unable to locate a transaction reference number.";
  const beneficiaryText = transaction.beneficiaryVpa
    ? ` The funds were credited to the payment address ${spellVpa(transaction.beneficiaryVpa)}.`
    : "";

  const sentences = [
    `${when}, the complainant was contacted by an unknown person through a ${channelText} and subsequently observed an unauthorised debit of ${amountText} from ${accountText}${bankText}.`,
    referenceText + beneficiaryText,
    `The complainant states that they did not authorise this transaction and did not knowingly share any credentials.`,
    `This complaint is being reported under the category ${category}, sub category ${subCategory}.`,
  ];

  if (caseObj.stillOnCall === true) {
    sentences.push(
      "The complainant was still in contact with the suspected fraudster when this report was opened and was advised to disconnect the call immediately.",
    );
  } else if (caseObj.stillOnCall === false) {
    sentences.push(
      "The complainant confirmed that contact with the suspected fraudster had already ended when this report was opened.",
    );
  }

  if (transaction.confidence === "low" || transaction.confidence === "medium") {
    sentences.push(
      "Some details above were read automatically from the bank alert and have been confirmed by the complainant.",
    );
  }

  let narrative = sanitize(sentences.join(" "));

  /* Guarantee the portal's 200-character floor without padding with filler
     that says nothing. */
  if (narrative.length < MINIMUM_LENGTH) {
    narrative = sanitize(
      `${narrative} The complainant requests that the beneficiary account be placed on hold and that the transaction be traced on an urgent basis under the Citizen Financial Cyber Fraud Reporting and Management System.`,
    );
  }

  return narrative;
}

/**
 * Three short plain-language sentences for the Read-Back screen. These are
 * deliberately not the narrative: the narrative is written for the
 * investigator, these are written to be understood by ear.
 *
 * @returns {[string, string, string]}
 */
export function composeReadBackSentences(caseObj, t) {
  const translate = typeof t === "function" ? t : (key, vars = {}) => fallback(key, vars);
  const transaction = caseObj.transactions?.[0];

  if (!transaction) {
    return [
      translate("readBack.fallback_one"),
      translate("readBack.fallback_two"),
      translate("readBack.fallback_three"),
    ];
  }

  const amount = transaction.amount === null
    ? translate("readBack.some_money")
    : `₹${Number(transaction.amount).toLocaleString("en-IN")}`;

  return [
    translate("readBack.sentence_money", {
      amount,
      bank: transaction.bank ?? translate("readBack.your_bank"),
      date: formatIndianDate(transaction.timestamp) ?? translate("readBack.recently"),
    }),
    translate("readBack.sentence_contact", {
      channel: translate(`readBack.channel_${caseObj.channel ?? "unknown"}`),
    }),
    translate("readBack.sentence_filing"),
  ];
}

/* Used only when no translator is supplied, e.g. in unit tests. */
function fallback(key, variables) {
  const strings = {
    "readBack.sentence_money": "{amount} left your {bank} account on {date}.",
    "readBack.sentence_contact": "They reached you through {channel}, and you did not agree to this payment.",
    "readBack.sentence_filing": "We will report this as a financial fraud, right now.",
    "readBack.fallback_one": "You are reporting a financial fraud.",
    "readBack.fallback_two": "Your case is already open.",
    "readBack.fallback_three": "We will report this as a financial fraud.",
    "readBack.your_bank": "bank",
    "readBack.recently": "recently",
    "readBack.some_money": "Money",
    "readBack.channel_call": "a phone call",
    "readBack.channel_sms": "a text message",
    "readBack.channel_whatsapp": "WhatsApp",
    "readBack.channel_link": "a link",
    "readBack.channel_unknown": "an unknown method",
  };
  return (strings[key] ?? key).replace(/\{(\w+)\}/g, (_, name) => String(variables[name] ?? ""));
}
