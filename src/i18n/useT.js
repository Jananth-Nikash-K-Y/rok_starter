import en from "./en.json";
import hi from "./hi.json";
import ta from "./ta.json";
import te from "./te.json";
import { DEFAULT_LOCALE } from "./locales.js";

const DICTIONARIES = { en, hi, ta, te };

/**
 * A deliberately small flat-key translator.
 *
 * Falls back to English per key rather than per locale, so a partially
 * translated language still renders every string — a missing key shows the
 * English sentence, never a raw key like `palm.caption`.
 */
export function useT(locale = DEFAULT_LOCALE) {
  const dictionary = DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
  return (key, variables = {}) => {
    const template = dictionary[key] ?? DICTIONARIES[DEFAULT_LOCALE][key] ?? key;
    return template.replace(/\{(\w+)\}/g, (_, name) => String(variables[name] ?? ""));
  };
}

export { DICTIONARIES };
