/**
 * The languages Rok speaks.
 *
 * NCRP itself offers Hindi and English only, for a crime that
 * disproportionately hits people who read neither. Every locale here is
 * listed by its own name in its own script — a language picker written in
 * English is useless to exactly the person who needs it.
 *
 * `speech` is the BCP-47 tag handed to the Web Speech API. `font` names the
 * CSS custom property carrying that script's typeface.
 */
export const LOCALES = [
  { code: "en", native: "English", english: "English", speech: "en-IN", font: "--rok-font", complete: true },
  { code: "hi", native: "हिन्दी", english: "Hindi", speech: "hi-IN", font: "--rok-font-devanagari", complete: true },
  { code: "ta", native: "தமிழ்", english: "Tamil", speech: "ta-IN", font: "--rok-font-tamil", complete: true },
  { code: "te", native: "తెలుగు", english: "Telugu", speech: "te-IN", font: "--rok-font-telugu", complete: true },
];

export const DEFAULT_LOCALE = "en";

const BY_CODE = new Map(LOCALES.map((locale) => [locale.code, locale]));

export function localeMeta(code) {
  return BY_CODE.get(code) ?? BY_CODE.get(DEFAULT_LOCALE);
}

export function isSupported(code) {
  return BY_CODE.has(code);
}

/** The tag to hand speechSynthesis for this locale. */
export function speechTagFor(code) {
  return localeMeta(code).speech;
}
