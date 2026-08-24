/**
 * Central announce() used by every screen on mount, so no screen can
 * silently forget to speak/announce its own prompt.
 * Full spec: docs/BUILD_BRIEF.md, section 6.
 *
 * Two subscribers:
 *  1. the aria-live region rendered once at the app root (id="a11y-live-region"
 *     already exists in index.html)
 *  2. speechSynthesis.speak(), gated by an app-level `speechEnabled` setting
 */

import { speak } from "./speech.js";

/** App-level speech toggle. Defaults to false (muted). */
let speechEnabled = false;

/**
 * Enable or disable TTS announcements globally.
 * @param {boolean} enabled
 */
export function setSpeechEnabled(enabled) {
  speechEnabled = Boolean(enabled);
}

/** @returns {boolean} */
export function isSpeechEnabled() {
  return speechEnabled;
}

/**
 * Announce text to assistive technology and optionally speak it aloud.
 * @param {string} text
 * @param {{ locale?: string, speak?: boolean }} [options]
 */
export function announce(text, options = {}) {
  if (!text) return;

  /* 1. Update the aria-live region so screen readers pick it up. */
  const liveRegion = typeof document !== "undefined"
    ? document.getElementById("a11y-live-region")
    : null;

  if (liveRegion) {
    /* Clear then set — forces assistive tech to re-read even if the
       same text is announced twice in a row. */
    liveRegion.textContent = "";
    /* Use a microtask gap so the DOM mutation registers as two events. */
    setTimeout(() => { liveRegion.textContent = text; }, 50);
  }

  /* 2. TTS via Web Speech API, if enabled. */
  const shouldSpeak = options.speak ?? speechEnabled;
  if (shouldSpeak) {
    speak(text, options.locale ?? "en-IN");
  }
}
