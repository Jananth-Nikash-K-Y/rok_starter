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
  const transactions = caseObj.transactions ?? [];

  if (transactions.length === 0) {
    return sanitize(
      "The complainant has opened a financial fraud report using the Rok intake system. " +
      "No transaction evidence has been attached to this case yet. The complainant intends " +
      "to supply the debit details and supporting evidence as soon as they are available.",
    );
  }

  const primary = transactions[0];
  const { category, subCategory } = caseObj.channel
    ? inferTaxonomy(caseObj.channel, primary)
    : { category: "Financial Fraud", subCategory: "UPI Related Frauds" };
  const channelText = CHANNEL_TEXT[caseObj.channel] ?? "method the complainant could not identify";

  /* One clause per confirmed transaction — a case is not always a single
     debit, and a complaint that only describes the first one silently
     drops every other payment the victim confirmed. */
  const describeTransaction = (transaction) => {
    const date = transaction.timestamp
      ? formatIndianDate(transaction.timestamp).replace(/\//g, "-")
      : null;
    const time = transaction.timestamp && transaction.timeKnown
      ? formatIndianTime(transaction.timestamp).replace(":", ".")
      : null;

    let when = "on a date the complainant is unable to confirm";
    if (date && time) when = `on ${date} at approximately ${time} hours IST`;
    else if (date) when = `on ${date}, at a time not recorded in the bank alert`;

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

    return `${when}, an unauthorised debit of ${amountText} was observed from ${accountText}${bankText}. ${referenceText}${beneficiaryText}`;
  };

  const total = transactions.reduce((sum, tx) => sum + (tx.amount ?? 0), 0);
  const totalLine = transactions.length > 1
    ? `In total, ${transactions.length} unauthorised transactions amounting to Rs.${total.toLocaleString("en-IN")} were observed. `
    : "";

  const sentences = [
    `The complainant was contacted by an unknown person through a ${channelText}.`,
    totalLine + transactions.map(describeTransaction).join(" "),
    "The complainant states that they did not authorise this transaction and did not knowingly share any credentials.",
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

  if (transactions.some((tx) => tx.confidence === "low" || tx.confidence === "medium")) {
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

export function composeReadBackSentences(caseObj, t) {
  const translate = typeof t === "function" ? t : (key, vars = {}) => fallback(key, vars);
  const transactions = caseObj.transactions ?? [];

  if (transactions.length === 0) {
    return [
      translate("readBack.fallback_one"),
      translate("readBack.fallback_two"),
      translate("readBack.fallback_three"),
    ];
  }

  /* Every confirmed payment, summed and named — not just the first one
     the victim ticked. */
  const total = transactions.reduce((sum, tx) => sum + (tx.amount ?? 0), 0);
  const amount = transactions.every((tx) => tx.amount === null)
    ? translate("readBack.some_money")
    : `₹${total.toLocaleString("en-IN")}`;
  const banks = [...new Set(transactions.map((tx) => tx.bank).filter(Boolean))];
  const bankText = banks.length ? banks.join(", ") : translate("readBack.your_bank");
  const primary = transactions[0];

  return [
    translate("readBack.sentence_money", {
      amount,
      bank: bankText,
      date: formatIndianDate(primary.timestamp) ?? translate("readBack.recently"),
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
