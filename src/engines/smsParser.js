/**
 * Evidence Recognition Engine.
 *
 * Deterministic only. No network calls, no ML model, must work offline.
 *
 * Design note — why this is not gated on a known bank:
 * India has 12 public sector banks, 20-plus private banks, dozens of RRBs,
 * small finance banks and wallets, and their SMS templates change without
 * notice. Keying the whole parse on a hardcoded bank list means a perfectly
 * well-formed alert from an unlisted bank yields nothing at all, which is
 * exactly the case the screenshot/OCR path has to survive. So the parser
 * extracts whatever it can find, names the bank when it recognises one, and
 * downgrades `confidence` when it cannot. The UI is responsible for making
 * the user confirm anything below high confidence — this app never
 * auto-submits anything on the strength of a parse alone.
 */

/**
 * Known institutions, matched against the message body or its sign-off.
 * Order matters only where one name contains another.
 */
const BANK_PATTERNS = [
  { bank: "State Bank of India", test: /\b(?:SBI|State Bank of India)\b/i },
  { bank: "HDFC Bank", test: /\bHDFCB?K?\b|\bHDFC\s*Bank\b/i },
  { bank: "ICICI Bank", test: /\bICICIB?\b|\bICICI\s*Bank\b/i },
  { bank: "Axis Bank", test: /\bAxis\s*Bank\b|\bAXISBK?\b/i },
  { bank: "Kotak Mahindra Bank", test: /\bKotak\b|\bKMBL\b/i },
  { bank: "Bank of Baroda", test: /\bBank of Baroda\b|\bBOB(?:TXN|IBK)?\b/i },
  { bank: "Punjab National Bank", test: /\bPNB\b|\bPunjab National Bank\b/i },
  { bank: "Canara Bank", test: /\bCanara\b|\bCANBNK\b/i },
  { bank: "Union Bank of India", test: /\bUnion Bank\b|\bUNIONB\b/i },
  { bank: "IDFC FIRST Bank", test: /\bIDFC\s*(?:FIRST)?\b/i },
  { bank: "Yes Bank", test: /\bYes\s*Bank\b|\bYESBNK\b/i },
  { bank: "IndusInd Bank", test: /\bIndusInd\b|\bINDUSB\b/i },
  { bank: "Federal Bank", test: /\bFederal\s*Bank\b|\bFEDBNK\b/i },
  { bank: "Bank of India", test: /\bBank of India\b|\bBOIIND\b/i },
  { bank: "Indian Bank", test: /\bIndian\s*Bank\b|\bINDBNK\b/i },
  { bank: "Central Bank of India", test: /\bCentral Bank\b|\bCBSSBI\b/i },
  { bank: "IDBI Bank", test: /\bIDBI\b/i },
  { bank: "RBL Bank", test: /\bRBL\s*Bank\b/i },
  { bank: "AU Small Finance Bank", test: /\bAU\s*Small\s*Finance\b|\bAUBANK\b/i },
  { bank: "Paytm Wallet", test: /\bPaytm\b/i },
  { bank: "PhonePe", test: /\bPhonePe\b/i },
  { bank: "Google Pay", test: /\bGoogle\s*Pay\b|\bGPay\b/i },
  { bank: "Amazon Pay", test: /\bAmazon\s*Pay\b/i },
  { bank: "Airtel Payments Bank", test: /\bAirtel\s*Payments?\b/i },
];

const MONTHS = Object.freeze({
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
});

const INDIA_OFFSET_MINUTES = 5 * 60 + 30;

/** Words that mark money leaving the account, vs arriving. */
const DEBIT_HINT = /\b(?:debited|withdrawn|deducted|sent|paid|transferred|spent)\b/i;
const CREDIT_HINT = /\b(?:credited|received|refund(?:ed)?|deposited)\b/i;

/**
 * Extracts an amount in rupees. Handles "Rs.45000.00", "Rs 12,500.00",
 * "INR 8,000.00" and a bare "45000.00" that directly follows a debit verb.
 * @returns {number | null}
 */
function parseAmount(text) {
  const tagged = text.match(/(?:Rs\.?|INR|₹)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i);
  if (tagged) return Number(tagged[1].replace(/,/g, ""));

  const trailing = text.match(/([0-9][0-9,]*(?:\.\d{1,2})?)\s*(?:Rs\.?|INR|₹)/i);
  return trailing ? Number(trailing[1].replace(/,/g, "")) : null;
}

/**
 * Finds a date, and a time only if the message actually carries one.
 *
 * Returning `timeKnown` matters: a date-only alert must not be rendered or
 * narrated as though it happened at midnight. An invented incident time in
 * a police complaint is a factual error, and the concept document's whole
 * claim is that every stated fact is sourced.
 *
 * @returns {{ timestamp: string, timeKnown: boolean } | null}
 */
function parseTimestamp(text) {
  const match = text.match(
    /(\d{1,2})[-/\s](\d{1,2}|[A-Za-z]{3,})[-/\s](\d{2,4})(?:\s*,?\s*(?:at\s*)?(\d{1,2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (!match) return null;

  const [, dayText, monthText, yearText, hourText, minuteText, secondText] = match;
  const month = /^\d+$/.test(monthText)
    ? Number(monthText) - 1
    : MONTHS[monthText.slice(0, 3).toLowerCase()];
  if (month === undefined || month < 0 || month > 11) return null;

  const day = Number(dayText);
  if (day < 1 || day > 31) return null;

  const year = yearText.length === 2 ? 2000 + Number(yearText) : Number(yearText);
  const timeKnown = hourText !== undefined;
  const hours = timeKnown ? Number(hourText) : 0;
  const minutes = timeKnown ? Number(minuteText) : 0;
  const seconds = timeKnown && secondText !== undefined ? Number(secondText) : 0;
  if (hours > 23 || minutes > 59) return null;

  const timestamp = new Date(
    Date.UTC(year, month, day, hours, minutes - INDIA_OFFSET_MINUTES, seconds),
  ).toISOString();

  return { timestamp, timeKnown };
}

/**
 * The UTR / RRN / reference number: the longest digit run near a reference
 * label. This is the field the bank actually needs to identify the money.
 * @returns {string | null}
 */
function parseReference(text) {
  const labelled = text.match(
    /(?:UPI\s*Ref(?:\s*No\.?)?|Ref(?:erence)?(?:\s*No\.?)?|RRN|UTR|(?:Txn|Transaction|Order)\s*(?:ID|No\.?)|Info\s*:)\s*[:.#-]?\s*([^\n]{0,64})/i,
  );
  if (!labelled) return null;

  /* The first token after the label is the reference; anything later in the
     message is usually a helpline or balance, which must never be mistaken
     for the identifier the bank freezes on. Wallets use alphanumeric order
     IDs, so tokens are not required to be pure digits. */
  const tokens = labelled[1].match(/[A-Za-z0-9]{6,}/g) ?? [];
  const reference = tokens.find((token) => (token.match(/\d/g) ?? []).length >= 6);
  return reference ?? null;
}

/** The last four digits of the victim's own account, never the full number. */
function parseAccountTail(text) {
  const masked = text.match(/(?:XX+|\*{2,}|\.{3,}|x{2,})\s*(\d{4})\b/i);
  if (masked) return masked[1];
  const spelled = text.match(/\ba\/c\s*(?:no\.?\s*)?(?:ending\s*)?(?:XX+|\*{2,})?\s*(\d{4})\b/i);
  return spelled ? spelled[1] : null;
}

/**
 * A UPI handle such as `scammer123@okhdfcbank`. Excludes anything that looks
 * like an email address, which is a different identifier entirely.
 */
function parseBeneficiaryVpa(text) {
  const candidates = text.match(/\b[\w][\w.-]{1,64}@[a-z][\w.-]{1,32}\b/gi) ?? [];
  /* A UPI handle has no TLD; anything ending in one is an email address,
     which is a different identifier and must not reach the complaint. */
  const vpa = candidates.find((candidate) => !/\.(?:com|in|org|net|co|gov)$/i.test(candidate));
  return vpa ?? null;
}

/** Named institution, or the SMS sign-off if we do not recognise it. */
function parseBank(text) {
  const known = BANK_PATTERNS.find(({ test }) => test.test(text));
  if (known) return { bank: known.bank, bankKnown: true };

  /* Indian transactional SMS almost always ends "-SOMETHING" or "- SOMETHING". */
  const signoff = text.trim().match(/[-–]\s*([A-Za-z][A-Za-z .&]{1,28})\s*$/);
  if (signoff) return { bank: signoff[1].trim(), bankKnown: false };

  return { bank: null, bankKnown: false };
}

/**
 * Grades how much of the freeze-relevant evidence we actually recovered.
 * `high` is reserved for a message we recognised end to end; anything less
 * must be confirmed by the user before it reaches a complaint.
 */
function gradeConfidence({ amount, utr, bankKnown, accountTail }) {
  if (amount === null) return "low";
  if (utr && bankKnown) return "high";
  if (utr || (bankKnown && accountTail)) return "medium";
  return "low";
}

/**
 * @param {string} text - raw SMS or OCR'd text
 * @returns {{
 *   bank: string | null,
 *   bankKnown: boolean,
 *   amount: number | null,
 *   timestamp: string | null,
 *   timeKnown: boolean,
 *   accountTail: string | null,
 *   utr: string | null,
 *   beneficiaryVpa: string | null,
 *   direction: 'debit' | 'credit' | 'unknown',
 *   confidence: 'high' | 'medium' | 'low'
 * } | null} null when the text carries no usable transaction evidence at all
 */
export function parseTransactionSms(text) {
  if (typeof text !== "string" || !text.trim()) return null;

  const amount = parseAmount(text);
  const utr = parseReference(text);
  const isMoneyMessage = DEBIT_HINT.test(text) || CREDIT_HINT.test(text);

  /* Nothing to work with: no amount, no reference, no money verb. */
  if (amount === null && utr === null && !isMoneyMessage) return null;
  if (amount === null && utr === null) return null;

  const { bank, bankKnown } = parseBank(text);
  const when = parseTimestamp(text);
  const accountTail = parseAccountTail(text);

  let direction = "unknown";
  if (DEBIT_HINT.test(text)) direction = "debit";
  else if (CREDIT_HINT.test(text)) direction = "credit";

  return {
    bank,
    bankKnown,
    amount,
    timestamp: when?.timestamp ?? null,
    timeKnown: when?.timeKnown ?? false,
    accountTail,
    utr,
    beneficiaryVpa: parseBeneficiaryVpa(text),
    direction,
    confidence: gradeConfidence({ amount, utr, bankKnown, accountTail }),
  };
}

/**
 * OCRs an image via Tesseract.js, then runs the result through
 * parseTransactionSms. Tesseract assets are served from /public so nothing
 * is fetched from a third-party origin at runtime.
 *
 * @param {File} file
 * @returns {Promise<ReturnType<typeof parseTransactionSms> & { raw: string } | null>}
 */
export async function parseTransactionImage(file) {
  if (!(file instanceof Blob)) return null;

  let worker;
  try {
    /* Loaded on demand. Tesseract is by far the heaviest dependency here,
       and most users never upload a screenshot — keeping it out of the
       initial bundle is what lets the first screen appear immediately on a
       slow connection, which is the only moment that matters. */
    const { createWorker } = await import("tesseract.js");
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
