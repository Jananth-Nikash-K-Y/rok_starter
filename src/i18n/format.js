/**
 * India-specific formatting. Do not reach for `Intl` defaults inline —
 * everything user-facing goes through here.
 */

const INDIA_OFFSET_MILLISECONDS = (5 * 60 + 30) * 60 * 1000;

/**
 * 12,34,567.89 — the Indian digit grouping, not the Western one.
 *
 * Whole-rupee amounts drop the paise entirely. "45,000" is recognised at a
 * glance where "45,000.00" has to be read, and this number exists to be
 * recognised.
 */
function formatIndianNumber(value) {
  const [integer, decimal] = Number(value).toFixed(2).split(".");
  const lastThree = integer.slice(-3);
  const remaining = integer.slice(0, -3);
  const grouped = remaining
    ? `${remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${lastThree}`
    : lastThree;
  return decimal === "00" ? grouped : `${grouped}.${decimal}`;
}

/**
 * The amount, in full.
 *
 * This is deliberately never masked. The entire Message Wall mechanic is
 * recognition — the victim identifies the fraudulent transaction *by its
 * amount*. Hiding those digits removes the only cue they have. What must be
 * masked is the account number, and `formatMaskedAccount` does that.
 */
export function formatIndianCurrency(amount) {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return null;
  return `₹${formatIndianNumber(amount)}`;
}

/** The last four digits only. Rok never holds a full account number. */
export function formatMaskedAccount(accountTail) {
  return accountTail ? `•••• ${accountTail}` : null;
}

function toIndiaClock(timestamp) {
  return new Date(new Date(timestamp).getTime() + INDIA_OFFSET_MILLISECONDS);
}

/** DD/MM/YYYY, in IST regardless of where the browser thinks it is. */
export function formatIndianDate(timestamp) {
  if (!timestamp) return null;
  const date = toIndiaClock(timestamp);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getUTCFullYear()}`;
}

/** HH:MM, IST. */
export function formatIndianTime(timestamp) {
  if (!timestamp) return null;
  const date = toIndiaClock(timestamp);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}`;
}

/**
 * Date and time together — but only when the source actually carried a time.
 * A date-only bank alert must not be rendered as though it happened at
 * midnight; `timeKnown: false` returns the date alone so the interface never
 * states a clock time the evidence does not support.
 */
export function formatIndianDateTime(timestamp, timeKnown = true) {
  if (!timestamp) return null;
  const date = formatIndianDate(timestamp);
  return timeKnown ? `${date}, ${formatIndianTime(timestamp)}` : date;
}

/** MM:SS, for the Golden Hour countdown. */
export function formatDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}
