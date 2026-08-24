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
import { createWorker } from "tesseract.js";

const BANK_PATTERNS = [
  { bank: "SBI", matches: (text) => /\bSBI\b/i.test(text) },
  { bank: "HDFC Bank", matches: (text) => /\bHDFC\s*Bank\b/i.test(text) },
  { bank: "ICICI Bank", matches: (text) => /\bICICI\s*Bank\b/i.test(text) },
  { bank: "Bank of Baroda", matches: (text) => /\b(?:Bank of Baroda|BOB)\b/i.test(text) },
  { bank: "PNB", matches: (text) => /\bPNB\b/i.test(text) },
  { bank: "Paytm Wallet", matches: (text) => /\bPaytm\s*Wallet\b/i.test(text) },
];

const MONTHS = Object.freeze({
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
});

function parseAmount(text) {
  const match = text.match(/(?:Rs\.?|INR)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i);
  return match ? Number(match[1].replace(/,/g, "")) : null;
}

function parseTimestamp(text) {
  const match = text.match(/(\d{1,2})[-/\s](\d{1,2}|[A-Za-z]{3})[-/\s](\d{2,4})(?:,?\s+(\d{1,2}:\d{2}(?::\d{2})?))?/);
  if (!match) return null;

  const [, dayText, monthText, yearText, timeText] = match;
  const month = /^\d+$/.test(monthText) ? Number(monthText) - 1 : MONTHS[monthText.toLowerCase()];
  const year = yearText.length === 2 ? 2000 + Number(yearText) : Number(yearText);
  if (month === undefined || month < 0 || month > 11) return null;

  const [hours = 0, minutes = 0, seconds = 0] = (timeText ?? "0:0:0").split(":").map(Number);
  const indiaOffsetMinutes = 5 * 60 + 30;
  return new Date(Date.UTC(year, month, Number(dayText), hours, minutes - indiaOffsetMinutes, seconds)).toISOString();
}

function parseReference(text) {
  const referenceMatch = text.match(/(?:UPI\s*Ref(?:\s*No)?|Ref(?:\s*No)?|Info:\s*UPI\/\s*CR\/)([^\n]{0,48})/i);
  if (!referenceMatch) return null;
  const digitRuns = referenceMatch[1].match(/\d{6,}/g) ?? [];
  return digitRuns.sort((first, second) => second.length - first.length)[0] ?? null;
}

function parseBank(text) {
  return BANK_PATTERNS.find(({ matches }) => matches(text))?.bank ?? null;
}

export function parseTransactionSms(text) {
  if (typeof text !== "string" || !text.trim()) return null;

  const bank = parseBank(text);
  if (!bank) return null;

  const amount = parseAmount(text);
  const accountTail = text.match(/(?:XX|\*\*|\.\.\.)(\d{4})/i)?.[1] ?? null;
  const utr = parseReference(text);
  const beneficiaryVpa = text.match(/\b[\w.]+@[\w]+\b/)?.[0] ?? null;

  return {
    bank,
    amount: amount ?? 0,
    timestamp: parseTimestamp(text),
    accountTail,
    utr,
    beneficiaryVpa,
    confidence: amount === null || utr === null ? "low" : "high",
  };
}

/**
 * OCRs an image via Tesseract.js, then runs the result through
 * parseTransactionSms.
 * @param {File} file
 * @returns {Promise<ReturnType<typeof parseTransactionSms>>}
 */
export async function parseTransactionImage(file) {
  if (!(file instanceof Blob)) return null;

  let worker;
  try {
    worker = await createWorker("eng", 1, {
      workerPath: "/tesseract/worker.min.js",
      corePath: "/tesseract/tesseract-core-simd-lstm.wasm.js",
      langPath: "/tessdata",
      workerBlobURL: false,
      gzip: true,
    });
    const { data } = await worker.recognize(file);
    const parsed = parseTransactionSms(data.text);
    return parsed ? { ...parsed, raw: data.text } : null;
  } catch {
    return null;
  } finally {
    if (worker) await worker.terminate();
  }
}
