#!/usr/bin/env node
/**
 * Fails (non-zero exit) if the locale files do not have identical key sets.
 * Run via `npm run check:i18n`.
 *
 * The locale list is read from src/i18n/locales.js rather than hardcoded
 * here, so adding a language cannot silently escape this check.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const i18nDir = path.join(__dirname, "..", "src", "i18n");

const localesSource = readFileSync(path.join(i18nDir, "locales.js"), "utf-8");
const LOCALES = [...localesSource.matchAll(/\{\s*code:\s*"([a-z-]+)"/g)].map((m) => m[1]);

if (LOCALES.length === 0) {
  console.error("Could not read any locale codes from src/i18n/locales.js");
  process.exit(1);
}
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
  console.error("\ni18n check failed — every locale file must have the same key set.");
  process.exit(1);
} else {
  console.log(
    `i18n check passed — ${allKeys.size} keys x ${LOCALES.length} locales ` +
    `(${LOCALES.join(", ")}), all in sync.`,
  );
}
