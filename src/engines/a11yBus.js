/**
 * Central announce() used by every screen on mount, so no screen can
 * silently forget to speak or announce its own prompt.
 * Full spec: docs/BUILD_BRIEF.md, section 6.
 *
 * Two subscribers:
 *  1. the aria-live region rendered once at the app root
 *  2. speechSynthesis, gated by the app-level speech setting
 */

import { speak, speakKey, stopSpeaking } from "./speech.js";

let speechEnabled = false;
/** The last thing announced, so a screen's Listen button can repeat it. */
let lastAnnouncement = { text: "", locale: "en", key: null };

export function setSpeechEnabled(enabled) {
  speechEnabled = Boolean(enabled);
  if (!speechEnabled) stopSpeaking();
}

export function isSpeechEnabled() {
  return speechEnabled;
}

/**
 * Speak whatever the current screen last announced.
 *
 * This is what the Listen button calls. It works whether or not speech is
 * globally on, because pressing it *is* the user asking for audio.
 */
export function replayLastAnnouncement(options = {}) {
  if (!lastAnnouncement.text) return false;
  const { key, text, locale } = lastAnnouncement;
  return key
    ? speakKey(key, text, locale, options)
    : speak(text, locale, options);
}

/**
 * @param {string} text
 * @param {{ locale?: string, speak?: boolean, key?: string, onEnd?: () => void }} [options]
 *   `key` names the i18n string, so a human recording can be used in place
 *   of synthesis when one exists — see src/i18n/recordings.js.
 */
export function announce(text, options = {}) {
  if (!text) return;

  const locale = options.locale ?? "en";
  lastAnnouncement = { text, locale, key: options.key ?? null };

  const region = typeof document !== "undefined"
    ? document.getElementById("a11y-live-region")
    : null;

  if (region) {
    /* Clear then set, so assistive tech re-reads even identical text. */
    region.textContent = "";
    setTimeout(() => { region.textContent = text; }, 50);
  }

  const shouldSpeak = options.speak ?? speechEnabled;
  if (!shouldSpeak) return;

  if (options.key) speakKey(options.key, text, locale, options);
  else speak(text, locale, options);
}
