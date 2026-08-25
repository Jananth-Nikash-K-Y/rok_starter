/**
 * Picking a language before the user has said anything.
 *
 * A fraud victim should not have to find a language menu in a script they
 * cannot read before they can report a crime. So Rok guesses first and lets
 * them correct it, rather than asking first.
 *
 * Order of evidence, most to least reliable:
 *   1. a language they already chose here before
 *   2. the browser's own language preferences
 *   3. the region reported by the browser locale or timezone
 *
 * The guess is always visible and always changeable — `detectLocale` returns
 * how it decided, so the interface can say so.
 */

import { DEFAULT_LOCALE, isSupported, LOCALES } from "./locales.js";

const STORAGE_KEY = "rok:locale";

/**
 * Indian states whose dominant language Rok speaks, keyed by the region
 * subtag a browser may report (e.g. `ta-IN`, or `en-IN` with a regional
 * timezone). This is a hint, never a conclusion.
 */
const TIMEZONE_HINTS = {
  "Asia/Kolkata": null, // one timezone for the whole country — no state signal
};

function fromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && isSupported(stored) ? stored : null;
  } catch {
    return null;
  }
}

function fromBrowserLanguages() {
  const preferences = typeof navigator === "undefined"
    ? []
    : navigator.languages ?? [navigator.language].filter(Boolean);

  for (const preference of preferences) {
    const base = String(preference).toLowerCase().split("-")[0];
    if (isSupported(base)) return base;
  }
  return null;
}

/**
 * Asia/Kolkata covers all of India and tells us nothing about which state
 * the user is in — so this deliberately yields nothing rather than guessing
 * a language from geography. Kept explicit because it is a question every
 * reviewer asks, and the honest answer is that a browser cannot know.
 */
function fromTimezone() {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_HINTS[zone] ?? null;
  } catch {
    return null;
  }
}

/**
 * @returns {{ locale: string, source: 'stored' | 'browser' | 'region' | 'default' }}
 */
export function detectLocale() {
  const stored = fromStorage();
  if (stored) return { locale: stored, source: "stored" };

  const browser = fromBrowserLanguages();
  if (browser) return { locale: browser, source: "browser" };

  const region = fromTimezone();
  if (region) return { locale: region, source: "region" };

  return { locale: DEFAULT_LOCALE, source: "default" };
}

export function rememberLocale(code) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* A language preference is a convenience, never worth failing over. */
  }
}

export { LOCALES, STORAGE_KEY };
