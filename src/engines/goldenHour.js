/**
 * The Golden Hour clock.
 *
 * Per the concept document (mechanic M3), this clock is not decoration: it
 * is the information architecture. A question may appear on screen only if
 * answering it changes whether the money is frozen within the hour.
 * Everything else — ID upload, address, police station, the 200-character
 * essay — is deferred to calm mode, after the case already exists.
 *
 * Deriving the phase here, rather than letting each screen decide, is what
 * keeps that rule enforceable in one place.
 */

export const GOLDEN_HOUR_MILLISECONDS = 60 * 60 * 1000;

/** Fraction of the hour at which the display shifts tone. */
const URGENT_AT = 0.5;
const CRITICAL_AT = 0.8;

/**
 * @param {string | null} openedAt - ISO timestamp of the first tap
 * @param {number} [now]
 * @returns {{
 *   elapsed: number,
 *   remaining: number,
 *   fraction: number,
 *   phase: 'idle' | 'calm' | 'urgent' | 'critical' | 'elapsed',
 *   expired: boolean
 * }}
 */
export function goldenHourStatus(openedAt, now = Date.now()) {
  if (!openedAt) {
    return { elapsed: 0, remaining: GOLDEN_HOUR_MILLISECONDS, fraction: 0, phase: "idle", expired: false };
  }

  const elapsed = Math.max(0, now - new Date(openedAt).getTime());
  const remaining = Math.max(0, GOLDEN_HOUR_MILLISECONDS - elapsed);
  const fraction = Math.min(1, elapsed / GOLDEN_HOUR_MILLISECONDS);

  let phase = "calm";
  if (fraction >= 1) phase = "elapsed";
  else if (fraction >= CRITICAL_AT) phase = "critical";
  else if (fraction >= URGENT_AT) phase = "urgent";

  return { elapsed, remaining, fraction, phase, expired: fraction >= 1 };
}

/**
 * Whether a given piece of information is allowed on screen right now.
 *
 * `freeze` fields change whether the bank can stop the money and are always
 * permitted. `paperwork` fields are only permitted once the case is complete,
 * which is the inversion the whole product argues for.
 *
 * @param {'freeze' | 'paperwork'} kind
 * @param {boolean} caseComplete
 */
export function mayAsk(kind, caseComplete) {
  if (kind === "freeze") return true;
  return Boolean(caseComplete);
}
