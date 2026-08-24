import { describe, expect, it } from "vitest";
import { createInitialMachineState, rokReducer, ROK_STATES } from "./machine.js";

function send(state, event) {
  return rokReducer(state, event);
}

describe("rokReducer", () => {
  it("moves through the complete single-transaction intake flow", () => {
    let state = createInitialMachineState();
    state = send(state, { type: "OPEN_CASE", openedAt: "2026-08-24T00:00:00.000Z" });
    state = send(state, { type: "STILL_ON_CALL_NO" });
    state = send(state, { type: "SELECT_MESSAGE", message: { raw: "masked demo message", bank: "Demo Bank" } });
    state = send(state, { type: "SCOPE_ONLY_THIS" });
    state = send(state, { type: "SELECT_CHANNEL", channel: "call" });
    state = send(state, { type: "CONFIRM_SENTENCE", index: 0, confirmed: true });
    state = send(state, { type: "CONFIRM_SENTENCE", index: 1, confirmed: true });
    state = send(state, { type: "CONFIRM_SENTENCE", index: 2, confirmed: true });

    expect(state.value).toBe(ROK_STATES.CASE_COMPLETE);
    expect(state.case.openedAt).toBe("2026-08-24T00:00:00.000Z");
    expect(state.case.transactions).toHaveLength(1);
    expect(state.case.channel).toBe("call");
  });

  it("returns to the message wall to collect another transaction", () => {
    let state = createInitialMachineState();
    state = send(state, { type: "OPEN_CASE" });
    state = send(state, { type: "STILL_ON_CALL_NO" });
    state = send(state, { type: "SELECT_MESSAGE", message: { raw: "masked demo message" } });
    state = send(state, { type: "SCOPE_MORE" });

    expect(state.value).toBe(ROK_STATES.MESSAGE_WALL);
    expect(state.case.transactions).toHaveLength(1);
  });
});

describe("case survival", () => {
  /* Mechanic M1: once a case is open, nothing the user does destroys it —
     which only holds if a reload can restore it. */
  it("restores an in-progress case from a snapshot", () => {
    let state = createInitialMachineState();
    state = send(state, { type: "OPEN_CASE", openedAt: "2026-08-24T00:00:00.000Z" });
    state = send(state, { type: "STILL_ON_CALL_NO" });
    const snapshot = JSON.parse(JSON.stringify({ value: state.value, case: state.case }));

    const restored = send(createInitialMachineState(), { type: "RESTORE_CASE", snapshot });
    expect(restored.value).toBe(ROK_STATES.MESSAGE_WALL);
    expect(restored.case.openedAt).toBe("2026-08-24T00:00:00.000Z");
  });

  it("ignores a snapshot for a case that was never opened", () => {
    const state = createInitialMachineState();
    const result = send(state, { type: "RESTORE_CASE", snapshot: { value: "SCOPE", case: {} } });
    expect(result.value).toBe(ROK_STATES.IDLE);
  });
});

describe("calm mode", () => {
  function completedCase() {
    let state = createInitialMachineState();
    state = send(state, { type: "OPEN_CASE" });
    state = send(state, { type: "STILL_ON_CALL_NO" });
    state = send(state, { type: "SELECT_MESSAGE", message: { amount: 45000 } });
    state = send(state, { type: "SCOPE_ONLY_THIS" });
    state = send(state, { type: "SELECT_CHANNEL", channel: "call" });
    [0, 1, 2].forEach((index) => {
      state = send(state, { type: "CONFIRM_SENTENCE", index, confirmed: true });
    });
    return state;
  }

  /* The defect this replaced: ENTER_CALM_MODE transitioned to a state the
     app had no screen for, stranding the user on a blank page. */
  it("can be entered and left again", () => {
    let state = completedCase();
    state = send(state, { type: "ENTER_CALM_MODE" });
    expect(state.value).toBe(ROK_STATES.CALM_MODE);
    state = send(state, { type: "EXIT_CALM_MODE" });
    expect(state.value).toBe(ROK_STATES.CASE_COMPLETE);
  });

  it("stores deferred details without disturbing the evidence", () => {
    let state = send(completedCase(), { type: "ENTER_CALM_MODE" });
    state = send(state, { type: "SAVE_CALM_DETAILS", address: "12 Main Street, Chennai" });
    expect(state.case.address).toBe("12 Main Street, Chennai");
    expect(state.case.transactions).toHaveLength(1);
  });

  it("cannot be entered before the case is complete", () => {
    let state = createInitialMachineState();
    state = send(state, { type: "OPEN_CASE" });
    expect(send(state, { type: "ENTER_CALM_MODE" }).value).toBe(ROK_STATES.SAFETY_TRIAGE);
  });
});

describe("guardian handoff", () => {
  it("returns the helper to exactly where they were", () => {
    let state = createInitialMachineState();
    state = send(state, { type: "OPEN_CASE" });
    state = send(state, { type: "STILL_ON_CALL_NO" });
    state = send(state, { type: "OPEN_GUARDIAN_HANDOFF" });
    expect(state.value).toBe(ROK_STATES.GUARDIAN_HANDOFF);
    state = send(state, { type: "CLOSE_GUARDIAN_HANDOFF" });
    expect(state.value).toBe(ROK_STATES.MESSAGE_WALL);
  });

  it("is unreachable until a case exists", () => {
    const state = send(createInitialMachineState(), { type: "OPEN_GUARDIAN_HANDOFF" });
    expect(state.value).toBe(ROK_STATES.IDLE);
  });
});

describe("evidence integrity", () => {
  function atScope() {
    let state = createInitialMachineState();
    state = send(state, { type: "OPEN_CASE" });
    state = send(state, { type: "STILL_ON_CALL_NO" });
    return send(state, { type: "SELECT_MESSAGE", message: { amount: 45000, utr: "412583947261" } });
  }

  /* Risk register: a wrong identifier could freeze an innocent account, so
     the user must always be able to correct what the parser read. */
  it("lets the user correct a parsed field and marks it as corrected", () => {
    const state = send(atScope(), { type: "CORRECT_FIELD", index: 0, field: "utr", value: "999888777666" });
    expect(state.case.transactions[0].utr).toBe("999888777666");
    expect(state.case.transactions[0].confidence).toBe("corrected");
  });

  it("refuses to write a field that is not meant to be editable", () => {
    const state = send(atScope(), { type: "CORRECT_FIELD", index: 0, field: "raw", value: "tampered" });
    expect(state.case.transactions[0].raw).not.toBe("tampered");
  });

  it("ignores an out-of-range correction", () => {
    const before = atScope();
    expect(send(before, { type: "CORRECT_FIELD", index: 9, field: "utr", value: "x" })).toEqual(before);
  });

  it("ignores events that do not belong to the current state", () => {
    const state = createInitialMachineState();
    expect(send(state, { type: "SCOPE_ONLY_THIS" }).value).toBe(ROK_STATES.IDLE);
    expect(send(state, { type: "CONFIRM_SENTENCE", index: 0, confirmed: true }).value).toBe(ROK_STATES.IDLE);
    expect(send(state, { type: "NOT_A_REAL_EVENT" })).toEqual(state);
  });

  it("sends a rejected read-back back to the evidence", () => {
    let state = atScope();
    state = send(state, { type: "SCOPE_ONLY_THIS" });
    state = send(state, { type: "SELECT_CHANNEL", channel: "call" });
    state = send(state, { type: "CONFIRM_SENTENCE", index: 0, confirmed: true });
    state = send(state, { type: "REJECT_READBACK" });
    expect(state.value).toBe(ROK_STATES.MESSAGE_WALL);
    expect(state.case.sentenceConfirmations).toEqual([false, false, false]);
  });
});
