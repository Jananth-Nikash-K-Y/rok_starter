/**
 * Pre-recorded human audio.
 *
 * Synthetic speech is the fallback here, not the goal. A frightened person
 * hearing a flat machine voice read their loss back to them is a worse
 * experience than hearing a person, and Web Speech quality for Indian
 * languages ranges from decent to unusable depending on the browser. The
 * concept document plans for exactly this (section 11): pre-recorded audio
 * for the fixed strings, with TTS treated as an enhancement.
 *
 * To use real voice for a string: record it, save it as
 *   public/audio/<locale>/<key with dots replaced by dashes>.mp3
 * and add the key to the locale's list below. Anything not listed falls
 * through to speech synthesis automatically — so this can be filled in one
 * string at a time, and a half-finished recording session never breaks the
 * app.
 *
 * The ~30 strings worth recording first are the spoken prompts: every
 * `*.question`, `palm.spoken`, `safetyTriage.hangup_spoken` and
 * `caseComplete.spoken`.
 */
export const RECORDED = {
  en: [],
  hi: [],
  ta: [],
  te: [],
};

/** @returns {string | null} a URL to play, or null to fall back to TTS. */
export function recordingFor(key, locale) {
  if (!RECORDED[locale]?.includes(key)) return null;
  return `/audio/${locale}/${key.replace(/\./g, "-")}.mp3`;
}

export function hasRecording(key, locale) {
  return Boolean(RECORDED[locale]?.includes(key));
}
