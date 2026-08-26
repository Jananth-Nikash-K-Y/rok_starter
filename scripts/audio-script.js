#!/usr/bin/env node
/**
 * Prints the recording script for Rok's spoken prompts.
 *
 * Run: npm run audio:script
 *
 * Only strings with no {placeholders} are listed. A sentence carrying a
 * live amount or reference number cannot be pre-recorded, and splicing a
 * synthetic number into a recorded sentence sounds worse than either on its
 * own — so those stay with speech synthesis by design.
 *
 * Save each clip as public/audio/<locale>/<key with dots as dashes>.mp3,
 * then add the key to that locale's list in src/i18n/recordings.js.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const i18nDir = path.join(__dirname, "..", "src", "i18n");

const localesSource = readFileSync(path.join(i18nDir, "locales.js"), "utf-8");
const LOCALES = [...localesSource.matchAll(/\{\s*code:\s*"([a-z-]+)"/g)].map((m) => m[1]);

/* The prompts a user actually hears, in the order they hear them. */
const SPOKEN_KEYS = [
  "palm.spoken",
  "palm.listen",
  "safetyTriage.question",
  "safetyTriage.hangup_spoken",
  "safetyTriage.step_hangup",
  "safetyTriage.step_silence",
  "safetyTriage.step_nothing",
  "messageWall.title",
  "messageWall.why",
  "messageWall.receipt_title",
  "scope.question",
  "scope.why",
  "reachedVia.question",
  "reachedVia.why",
  "jurisdiction.question",
  "jurisdiction.why",
  "readBack.question",
  "readBack.why",
  "readBack.confirm_yes",
  "readBack.confirm_no",
  "caseComplete.heading",
  "caseComplete.four_lines",
  "caseComplete.route_call",
  "caseComplete.route_write",
  "caseComplete.route_helper",
  "calmMode.heading",
  "calmMode.support",
  "guardianHandoff.title",
  "app.listen",
  "neverAsk.otp_banner",
];

const lines = [];
const say = (text = "") => lines.push(text);

say("# Rok — recording script");
say("");
say("Read each line naturally, at an unhurried pace, as if speaking to");
say("someone frightened. Leave half a second of silence at the start and end");
say("of every clip. A quiet room and a phone microphone are enough.");
say("");
say("Save as: `public/audio/<locale>/<file>.mp3`");
say("Then add the key to that locale's array in `src/i18n/recordings.js`.");
say("");
say("Anything not recorded falls back to speech synthesis automatically, so");
say("this can be done a few lines at a time.");
say("");

let total = 0;
for (const locale of LOCALES) {
  const strings = JSON.parse(readFileSync(path.join(i18nDir, `${locale}.json`), "utf-8"));
  const recordable = SPOKEN_KEYS.filter((key) => strings[key] && !/\{\w+\}/.test(strings[key]));

  say(`## ${locale} — ${recordable.length} clips`);
  say("");
  say("| # | File | Say this |");
  say("| --- | --- | --- |");
  recordable.forEach((key, index) => {
    const file = `${key.replace(/\./g, "-")}.mp3`;
    const text = strings[key].replace(/\|/g, "\\|");
    say(`| ${index + 1} | \`${file}\` | ${text} |`);
  });
  say("");
  total += recordable.length;

  const skipped = SPOKEN_KEYS.filter((key) => strings[key] && /\{\w+\}/.test(strings[key]));
  if (skipped.length) {
    say(`_Not recordable (carries live data, stays synthetic): ${skipped.join(", ")}_`);
    say("");
  }
}

say("---");
say("");
say(`**Total: ${total} clips across ${LOCALES.length} languages.**`);
say("");
say("Record with a native speaker of each language — the same person who");
say("reviews that locale's copy. Reviewing and recording are one sitting.");

const out = path.join(__dirname, "..", "docs", "RECORDING_SCRIPT.md");
writeFileSync(out, `${lines.join("\n")}\n`);

/* Machine-readable twin of the same list, for the Colab generator. */
const clips = [];
for (const locale of LOCALES) {
  const strings = JSON.parse(readFileSync(path.join(i18nDir, `${locale}.json`), "utf-8"));
  SPOKEN_KEYS
    .filter((key) => strings[key] && !/\{\w+\}/.test(strings[key]))
    .forEach((key) => clips.push({
      locale,
      key,
      file: `${key.replace(/\./g, "-")}.mp3`,
      text: strings[key],
    }));
}
const manifest = path.join(__dirname, "..", "docs", "audio-manifest.json");
writeFileSync(manifest, `${JSON.stringify({ locales: LOCALES, clips }, null, 2)}\n`);

console.log(lines.join("\n"));
console.error(`\nWritten to docs/RECORDING_SCRIPT.md and docs/audio-manifest.json (${clips.length} clips)`);
