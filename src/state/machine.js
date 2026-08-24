/* eslint-disable no-unused-vars -- stub, remove this line once implemented */
/**
 * Rok's finite state machine.
 *
 * Full spec: docs/BUILD_BRIEF.md, section 1.
 * This file is a stub — Phase 0 implements createInitialCase, the
 * reducer, and the event creators below. Keep every transition named
 * and explicit; do not introduce implicit/derived states.
 *
 * States: IDLE, SAFETY_TRIAGE, SAFETY_HANGUP_SCRIPT, MESSAGE_WALL, SCOPE,
 *         REACHED_VIA, READ_BACK, CASE_COMPLETE, CALM_MODE
 */

// TODO(codex, phase 0): implement.
export function createInitialCase() {
  throw new Error("not implemented — see docs/BUILD_BRIEF.md section 1");
}

// TODO(codex, phase 0): implement as a pure (state, event) => state reducer.
export function rokReducer(state, event) {
  throw new Error("not implemented — see docs/BUILD_BRIEF.md section 1");
}
