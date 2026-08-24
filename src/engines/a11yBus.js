/* eslint-disable no-unused-vars -- stub, remove this line once implemented */
/**
 * Central announce() used by every screen on mount, so no screen can
 * silently forget to speak/announce its own prompt.
 * Full spec: docs/BUILD_BRIEF.md, section 6.
 *
 * Two subscribers to wire up:
 *  1. the aria-live region rendered once at the app root (id="a11y-live-region"
 *     already exists in index.html)
 *  2. speechSynthesis.speak(), gated by an app-level `speechEnabled` setting
 */

/**
 * @param {string} text
 * @param {{ locale?: string, speak?: boolean }} [options]
 */
// TODO(codex, phase 3): implement.
export function announce(text, options) {
  throw new Error("not implemented — see docs/BUILD_BRIEF.md section 6");
}
