import en from "./en.json";
import ta from "./ta.json";

const translations = { en, ta };

/** A deliberately small flat-key translator for the two-locale POC. */
export function useT(locale = "en") {
  const dictionary = translations[locale] ?? translations.en;
  return (key, variables = {}) => (dictionary[key] ?? translations.en[key] ?? key)
    .replace(/\{(\w+)\}/g, (_, variable) => String(variables[variable] ?? ""));
}
