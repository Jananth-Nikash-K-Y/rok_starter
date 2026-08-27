/**
 * Web Speech API wrapper — TTS for every screen, and the optional spoken
 * trigger on the Palm screen.
 *
 * No cloud TTS/STT dependency — deliberately, to keep the app backend-free.
 * Web Speech coverage for
 * Indian languages is uneven across browsers, so this treats speech as an
 * enhancement that reports whether it actually worked, rather than assuming
 * it did. The interface must stay fully usable when it did not.
 */

import { speechTagFor } from "../i18n/locales.js";
import { recordingFor } from "../i18n/recordings.js";

function synth() {
  return typeof window !== "undefined" && "speechSynthesis" in window
    ? window.speechSynthesis
    : null;
}

/**
 * Voices whose names signal a modern neural engine, best first. Picking the
 * first matching voice for a language is what makes Rok sound like a 1990s
 * screen reader: browsers commonly list a small robotic fallback voice
 * (eSpeak, "Compact") ahead of the good one. Ranking by these markers is
 * the difference between a machine reading and a person speaking.
 */
const QUALITY_MARKERS = [
  /neural/i, /natural/i, /premium/i, /enhanced/i, /siri/i,
  /google/i, /microsoft/i, /wavenet/i,
];

/** Voices to avoid unless nothing else exists — these are the robotic ones. */
const POOR_MARKERS = [/espeak/i, /compact/i, /pico/i, /festival/i, /flite/i];

/**
 * Novelty voices shipped by desktop operating systems. They are listed
 * alongside real ones and are occasionally the system default, which would
 * have Rok read someone's stolen savings back to them in a joke voice.
 * Excluded outright rather than merely ranked down.
 */
const NOVELTY = new Set([
  "albert", "bad news", "bahh", "bells", "boing", "bubbles", "cellos",
  "deranged", "good news", "jester", "junior", "kathy", "organ", "princess",
  "ralph", "superstar", "trinoids", "whisper", "wobble", "zarvox", "hysterical",
  "bad_news", "good_news", "grandma", "grandpa", "rocko", "shelley", "sandy",
  "eddy", "flo", "reed",
]);

function isNovelty(voice) {
  return NOVELTY.has(String(voice.name ?? "").trim().toLowerCase());
}

function scoreVoice(voice) {
  const name = `${voice.name ?? ""} ${voice.voiceURI ?? ""}`;
  let score = 0;
  QUALITY_MARKERS.forEach((marker, index) => {
    if (marker.test(name)) score += QUALITY_MARKERS.length - index;
  });
  if (POOR_MARKERS.some((marker) => marker.test(name))) score -= 20;
  /* A non-local voice is usually the server-side neural one. */
  if (voice.localService === false) score += 2;
  if (voice.default) score += 1;
  return score;
}

/**
 * Best available voice for a locale.
 *
 * Prefers an exact tag (`ta-IN`), then any voice for the base language
 * (`ta`), and within each group prefers the highest-quality engine rather
 * than whichever the browser happened to list first.
 */
function voiceFor(tag) {
  const engine = synth();
  if (!engine) return null;

  const voices = engine.getVoices();
  if (!voices.length) return null;

  const base = tag.split("-")[0].toLowerCase();
  const usable = voices.filter((voice) => !isNovelty(voice));
  const exact = usable.filter((voice) => voice.lang?.toLowerCase() === tag.toLowerCase());
  const sameLanguage = usable.filter((voice) => voice.lang?.toLowerCase().startsWith(base));
  const pool = exact.length ? exact : sameLanguage;
  if (!pool.length) return null;

  return pool.slice().sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
}

/**
 * Splits text into speakable clauses.
 *
 * One long utterance is read in a single flat contour, which is most of
 * what makes synthetic speech sound mechanical. Speaking clause by clause
 * with a short gap restores the pauses a person would take, and gives a
 * frightened listener time to absorb each fact.
 */
function intoClauses(text) {
  return String(text)
    .split(/(?<=[.!?।])\s+|(?<=,)\s+/)
    .map((clause) => clause.trim())
    .filter(Boolean);
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
  const voice = voiceFor(tag);
  const clauses = intoClauses(text);

  clauses.forEach((clause, index) => {
    const utterance = new SpeechSynthesisUtterance(clause);
    utterance.lang = tag;
    if (voice) utterance.voice = voice;

    /* Unhurried but not sluggish, and pitched slightly low: the listener is
       frightened, and may be hearing an unfamiliar voice in their own
       language for the first time. */
    utterance.rate = 0.92;
    utterance.pitch = 0.95;
    utterance.volume = 1;

    if (index === clauses.length - 1 && options.onEnd) {
      utterance.onend = options.onEnd;
      utterance.onerror = options.onEnd;
    }

    engine.speak(utterance);
  });

  return true;
}

/**
 * Speaks a string, using a human recording when one exists for that key.
 *
 * This is the path that actually sounds human: synthesis is what happens
 * when no recording has been made yet. See src/i18n/recordings.js.
 *
 * @returns {Promise<boolean>} whether audio started
 */
export function speakKey(key, text, locale, options = {}) {
  const url = recordingFor(key, locale);
  if (!url) return Promise.resolve(speak(text, locale, options));

  return new Promise((resolve) => {
    const audio = new Audio(url);
    audio.onended = () => { options.onEnd?.(); resolve(true); };
    audio.onerror = () => {
      /* Recording missing or unplayable — never leave the user in silence. */
      resolve(speak(text, locale, options));
    };
    audio.play().catch(() => resolve(speak(text, locale, options)));
  });
}

/** Which voice is actually being used, for the display settings panel. */
export function currentVoiceName(locale) {
  return voiceFor(speechTagFor(locale))?.name ?? null;
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

/**
 * Speech recognition — the spoken entry point (Figure 1, layer 1).
 *
 * Deliberately thin. Rok has no free-text conversation anywhere, so this
 * does not interpret what was said: on the Palm screen the only available
 * action is "open my case", and hearing *anything* is enough to trigger it.
 * That keeps the spoken path as reliable as the tap — it cannot mishear an
 * instruction, because it is not taking instructions.
 *
 * Browser support is uneven and this must never become a dependency; it
 * rejects cleanly and the caller falls back to the button.
 *
 * @param {string} locale
 * @returns {Promise<string>} whatever was transcribed
 */
export function listenOnce(locale, { timeoutMs = 7000 } = {}) {
  const Recognition = typeof window !== "undefined"
    ? window.SpeechRecognition ?? window.webkitSpeechRecognition
    : undefined;

  if (!Recognition) return Promise.reject(new Error("speech recognition unavailable"));

  return new Promise((resolve, reject) => {
    const recognition = new Recognition();
    recognition.lang = speechTagFor(locale);
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let settled = false;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { recognition.stop(); } catch { /* already stopped */ }
      fn(value);
    };

    const timer = setTimeout(() => finish(reject, new Error("timed out")), timeoutMs);

    recognition.onresult = (event) => {
      finish(resolve, event.results?.[0]?.[0]?.transcript ?? "");
    };
    recognition.onerror = (event) => finish(reject, new Error(event.error ?? "failed"));
    recognition.onend = () => finish(reject, new Error("no speech"));

    try {
      recognition.start();
    } catch (error) {
      finish(reject, error);
    }
  });
}

/** Whether a spoken entry point can be offered at all. */
export function canListen() {
  return typeof window !== "undefined"
    && Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);
}
