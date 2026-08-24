#!/usr/bin/env node
/**
 * Fails (non-zero exit) if src/i18n/en.json and src/i18n/ta.json don't
 * have identical key sets. Run via `npm run check:i18n`.
 * See AGENTS.md, i18n conventions.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const i18nDir = path.join(__dirname, "..", "src", "i18n");

const LOCALES = ["en", "ta"];
const IGNORE_KEYS = new Set(["_review_note"]);

function loadKeys(locale) {
  const file = path.join(i18nDir, `${locale}.json`);
  const data = JSON.parse(readFileSync(file, "utf-8"));
  return new Set(Object.keys(data).filter((k) => !IGNORE_KEYS.has(k)));
}

const keysByLocale = Object.fromEntries(LOCALES.map((l) => [l, loadKeys(l)]));
const allKeys = new Set(LOCALES.flatMap((l) => [...keysByLocale[l]]));

let hasError = false;
for (const key of allKeys) {
  const missingIn = LOCALES.filter((l) => !keysByLocale[l].has(key));
  if (missingIn.length > 0) {
    hasError = true;
    console.error(`Missing "${key}" in: ${missingIn.join(", ")}`);
  }
}

if (hasError) {
  console.error("\ni18n check failed — see AGENTS.md i18n conventions.");
  process.exit(1);
} else {
  console.log(`i18n check passed — ${allKeys.size} keys, ${LOCALES.length} locales, all in sync.`);
}
