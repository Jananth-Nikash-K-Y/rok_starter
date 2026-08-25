/**
 * Web Speech API wrapper — TTS for every screen, and the optional spoken
 * trigger on the Palm screen.
 *
 * No cloud TTS/STT dependency (see AGENTS.md). Web Speech coverage for
 * Indian languages is uneven across browsers, so this treats speech as an
 * enhancement that reports whether it actually worked, rather than assuming
 * it did. The interface must stay fully usable when it did not.
 */

import { speechTagFor } from "../i18n/locales.js";

function synth() {
  return typeof window !== "undefined" && "speechSynthesis" in window
    ? window.speechSynthesis
    : null;
}

/**
 * Best available voice for a locale.
 *
 * Prefers an exact tag (`ta-IN`), then any voice for the base language
 * (`ta`), then nothing — in which case the caller falls back to text.
 */
function voiceFor(tag) {
  const engine = synth();
  if (!engine) return null;

  const voices = engine.getVoices();
  if (!voices.length) return null;

  const base = tag.split("-")[0].toLowerCase();
  return (
    voices.find((voice) => voice.lang?.toLowerCase() === tag.toLowerCase()) ??
    voices.find((voice) => voice.lang?.toLowerCase().startsWith(base)) ??
    null
  );
}

/**
 * Whether this browser can actually speak a language, so the interface can
 * tell the truth instead of offering a button that does nothing.
 */
export function canSpeak(locale) {
  return Boolean(voiceFor(speechTagFor(locale)));
}

/**
 * @param {string} text
 * @param {string} locale - a Rok locale code, e.g. 'ta'
 * @param {{ onEnd?: () => void }} [options]
 * @returns {boolean} whether speech was actually started
 */
export function speak(text, locale, options = {}) {
  const engine = synth();
  if (!engine || typeof SpeechSynthesisUtterance === "undefined" || !text) return false;

  engine.cancel();

  const tag = speechTagFor(locale);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = tag;

  const voice = voiceFor(tag);
  if (voice) utterance.voice = voice;

  /* Slightly slower than default: the listener is frightened, and may be
     hearing an unfamiliar synthetic voice in their own language. */
  utterance.rate = 0.95;
  if (options.onEnd) {
    utterance.onend = options.onEnd;
    utterance.onerror = options.onEnd;
  }

  engine.speak(utterance);
  return true;
}

export function stopSpeaking() {
  synth()?.cancel();
}

/**
 * Voice lists load asynchronously in most browsers. Resolves once they are
 * available so a caller can ask `canSpeak` and get a truthful answer.
 */
export function whenVoicesReady() {
  const engine = synth();
  if (!engine) return Promise.resolve(false);
  if (engine.getVoices().length) return Promise.resolve(true);

  return new Promise((resolve) => {
    const done = () => resolve(engine.getVoices().length > 0);
    engine.addEventListener?.("voiceschanged", done, { once: true });
    setTimeout(done, 1200);
  });
}
