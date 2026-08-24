/* eslint-disable no-unused-vars -- stub, remove this line once implemented */
/**
 * Minimal i18n hook — flat key lookup against src/i18n/<locale>.json.
 * Full spec: docs/BUILD_BRIEF.md, section 7.
 * Deliberately not using a library (react-i18next etc.) for a
 * two-language POC — keep this small.
 */

// TODO(codex, phase 3): implement, backed by en.json and ta.json,
// with locale sourced from app-level context/state.
export function useT() {
  throw new Error("not implemented — see docs/BUILD_BRIEF.md section 7");
}
