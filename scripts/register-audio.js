#!/usr/bin/env node
/**
 * Rewrites src/i18n/recordings.js from whatever MP3s are actually present
 * in public/audio/. Run after dropping generated clips in.
 *
 * Run: npm run audio:register
 *
 * Registering from the filesystem rather than by hand means the list can
 * never claim a recording that is not there — a missing file would leave a
 * screen silent, which is worse than the synthetic voice it replaced.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const audioDir = path.join(root, "public", "audio");
const i18nDir = path.join(root, "src", "i18n");

const localesSource = readFileSync(path.join(i18nDir, "locales.js"), "utf-8");
const LOCALES = [...localesSource.matchAll(/\{\s*code:\s*"([a-z-]+)"/g)].map((m) => m[1]);

const found = {};
let total = 0;

for (const locale of LOCALES) {
  const dir = path.join(audioDir, locale);
  if (!existsSync(dir)) { found[locale] = []; continue; }

  const strings = JSON.parse(readFileSync(path.join(i18nDir, `${locale}.json`), "utf-8"));
  const keys = readdirSync(dir)
    .filter((name) => name.endsWith(".mp3"))
    .map((name) => name.replace(/\.mp3$/, "").replace(/-/g, "."))
    /* Only register a file that maps to a real string. A stray or misnamed
       MP3 is skipped loudly rather than silently registered. */
    .filter((key) => {
      if (strings[key]) return true;
      console.warn(`  ! ${locale}: no such key "${key}" — file ignored`);
      return false;
    })
    .sort();

  found[locale] = keys;
  total += keys.length;
  console.log(`  ${locale}: ${keys.length} clip(s)`);
}

const body = LOCALES.map((locale) => {
  const keys = found[locale];
  if (keys.length === 0) return `  ${locale}: [],`;
  return `  ${locale}: [\n${keys.map((k) => `    "${k}",`).join("\n")}\n  ],`;
}).join("\n");

const target = path.join(i18nDir, "recordings.js");
const source = readFileSync(target, "utf-8");
const updated = source.replace(
  /export const RECORDED = \{[\s\S]*?\n\};/,
  `export const RECORDED = {\n${body}\n};`,
);

writeFileSync(target, updated);
console.log(`\nRegistered ${total} clip(s) in src/i18n/recordings.js`);
if (total === 0) console.log("Nothing found — every prompt will use speech synthesis.");
