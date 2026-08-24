/* eslint-disable no-unused-vars -- stub, remove this line once implemented */
/**
 * Web Speech API wrapper — TTS (speechSynthesis) and optional STT
 * (SpeechRecognition) for the spoken trigger on the Palm screen.
 *
 * Do not add a cloud TTS/STT dependency (see AGENTS.md). Include a
 * pre-recorded-audio-file fallback path for the ~30 fixed strings used
 * across screens, since Web Speech API language coverage for Indian
 * languages is uneven across browsers (see docs/Rok_NCRP_Concept.pdf,
 * section 11, "Risks and Limitations").
 */

/**
 * @param {string} text
 * @param {string} locale - BCP-47, e.g. 'ta-IN', 'en-IN'
 */
// TODO(codex, phase 3): implement, with fallback to a pre-recorded clip
// if speechSynthesis has no voice for `locale`.
export function speak(text, locale) {
  throw new Error("not implemented — see src/engines/speech.js header comment");
}

/**
 * @returns {Promise<string>} transcribed text, or rejects if unsupported
 */
// TODO(codex, phase 3): implement.
export function listenOnce() {
  throw new Error("not implemented — see src/engines/speech.js header comment");
}
