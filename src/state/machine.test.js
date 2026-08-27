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
    state = send(state, {
      type: "CONFIRM_TRANSACTIONS",
      transactions: [{ raw: "masked demo message", bank: "Demo Bank" }],
    });
    state = send(state, { type: "SELECT_CHANNEL", channel: "call" });
    state = send(state, { type: "CONFIRM_JURISDICTION", stateUt: "Tamil Nadu" });
    state = send(state, { type: "CONFIRM_SENTENCE", index: 0, confirmed: true });
    state = send(state, { type: "CONFIRM_SENTENCE", index: 1, confirmed: true });
    state = send(state, { type: "CONFIRM_SENTENCE", index: 2, confirmed: true });

    expect(state.value).toBe(ROK_STATES.CASE_COMPLETE);
    expect(state.case.stateUt).toBe("Tamil Nadu");
    expect(state.case.openedAt).toBe("2026-08-24T00:00:00.000Z");
    expect(state.case.transactions).toHaveLength(1);
    expect(state.case.channel).toBe("call");
  });

  /* The Message Wall now collects every wrong payment in one pass instead
     of looping through a separate "were there more?" screen. */
  it("accepts several transactions confirmed together", () => {
    let state = createInitialMachineState();
    state = send(state, { type: "OPEN_CASE" });
    state = send(state, { type: "STILL_ON_CALL_NO" });
    state = send(state, {
      type: "CONFIRM_TRANSACTIONS",
      transactions: [
        { raw: "first", bank: "SBI", amount: 45000 },
        { raw: "second", bank: "HDFC Bank", amount: 12500 },
      ],
    });

    expect(state.value).toBe(ROK_STATES.REACHED_VIA);
    expect(state.case.transactions).toHaveLength(2);
    expect(state.case.transactions[1].bank).toBe("HDFC Bank");
  });

  it("refuses to confirm an empty set", () => {
    let state = createInitialMachineState();
    state = send(state, { type: "OPEN_CASE" });
    state = send(state, { type: "STILL_ON_CALL_NO" });
    const result = send(state, { type: "CONFIRM_TRANSACTIONS", transactions: [] });

    expect(result.value).toBe(ROK_STATES.MESSAGE_WALL);
    expect(result.case.transactions).toHaveLength(0);
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
    const result = send(state, { type: "RESTORE_CASE", snapshot: { value: "MESSAGE_WALL", case: {} } });
    expect(result.value).toBe(ROK_STATES.IDLE);
  });
});

describe("calm mode", () => {
  function completedCase() {
    let state = createInitialMachineState();
    state = send(state, { type: "OPEN_CASE" });
    state = send(state, { type: "STILL_ON_CALL_NO" });
    state = send(state, { type: "CONFIRM_TRANSACTIONS", transactions: [{ amount: 45000 }] });
    state = send(state, { type: "SELECT_CHANNEL", channel: "call" });
    state = send(state, { type: "CONFIRM_JURISDICTION", stateUt: "Delhi" });
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
  /* Risk register: a wrong identifier could freeze an innocent account, so
     the interface must let the user correct what the parser read. That
     correction now happens in the screen's own state before the set is
     confirmed — CONFIRM_TRANSACTIONS receives the corrected values
     directly, so what lands in the case is already right. */
  it("accepts a corrected value as part of the confirmed set", () => {
    let state = createInitialMachineState();
    state = send(state, { type: "OPEN_CASE" });
    state = send(state, { type: "STILL_ON_CALL_NO" });
    state = send(state, {
      type: "CONFIRM_TRANSACTIONS",
      transactions: [{ amount: 45000, utr: "999888777666", confidence: "corrected" }],
    });
    expect(state.case.transactions[0].utr).toBe("999888777666");
    expect(state.case.transactions[0].confidence).toBe("corrected");
  });

  it("ignores events that do not belong to the current state", () => {
    const state = createInitialMachineState();
    expect(send(state, { type: "SELECT_CHANNEL", channel: "call" }).value).toBe(ROK_STATES.IDLE);
    expect(send(state, { type: "CONFIRM_SENTENCE", index: 0, confirmed: true }).value).toBe(ROK_STATES.IDLE);
    expect(send(state, { type: "NOT_A_REAL_EVENT" })).toEqual(state);
  });

  it("sends a rejected read-back back to the evidence, leaving it intact", () => {
    let state = createInitialMachineState();
    state = send(state, { type: "OPEN_CASE" });
    state = send(state, { type: "STILL_ON_CALL_NO" });
    state = send(state, {
      type: "CONFIRM_TRANSACTIONS",
      transactions: [{ amount: 45000, utr: "412583947261" }],
    });
    state = send(state, { type: "SELECT_CHANNEL", channel: "call" });
    state = send(state, { type: "CONFIRM_JURISDICTION", stateUt: "Kerala" });
    state = send(state, { type: "CONFIRM_SENTENCE", index: 0, confirmed: true });
    state = send(state, { type: "REJECT_READBACK" });

    expect(state.value).toBe(ROK_STATES.MESSAGE_WALL);
    expect(state.case.sentenceConfirmations).toEqual([false, false, false]);
    expect(state.case.transactions).toHaveLength(1);
    expect(state.case.transactions[0].utr).toBe("412583947261");
  });
});

describe("jurisdiction", () => {
  function atJurisdiction() {
    let state = createInitialMachineState();
    state = send(state, { type: "OPEN_CASE" });
    state = send(state, { type: "STILL_ON_CALL_NO" });
    state = send(state, { type: "CONFIRM_TRANSACTIONS", transactions: [{ amount: 45000 }] });
    return send(state, { type: "SELECT_CHANNEL", channel: "call" });
  }

  /* NCRP routes on this field, so a packet without it is incomplete. */
  it("is asked before the read-back, and records what was confirmed", () => {
    const state = atJurisdiction();
    expect(state.value).toBe(ROK_STATES.JURISDICTION);
    const confirmed = send(state, { type: "CONFIRM_JURISDICTION", stateUt: "Karnataka" });
    expect(confirmed.value).toBe(ROK_STATES.READ_BACK);
    expect(confirmed.case.stateUt).toBe("Karnataka");
  });

  it("refuses to advance without a State/UT", () => {
    const state = atJurisdiction();
    expect(send(state, { type: "CONFIRM_JURISDICTION" }).value).toBe(ROK_STATES.JURISDICTION);
    expect(send(state, { type: "CONFIRM_JURISDICTION", stateUt: "" }).value)
      .toBe(ROK_STATES.JURISDICTION);
  });
});

describe("cancelling a report", () => {
  /* Requested explicitly, with a confirmation step owned by the interface:
     a citizen may want to abandon a report mid-flow, not only start a new
     one after finishing. RESET_CASE now covers both, guarded only by a
     case actually being open. */
  it("wipes an in-progress case from any state once one is open", () => {
    let state = createInitialMachineState();
    state = send(state, { type: "OPEN_CASE" });
    state = send(state, { type: "STILL_ON_CALL_NO" });
    state = send(state, { type: "RESET_CASE" });
    expect(state.value).toBe(ROK_STATES.IDLE);
    expect(state.case.openedAt).toBeNull();
  });

  it("does nothing before a case exists", () => {
    const state = createInitialMachineState();
    expect(send(state, { type: "RESET_CASE" })).toEqual(state);
  });

  it("still works from the completed case, to start a new report", () => {
    let state = createInitialMachineState();
    state = send(state, { type: "OPEN_CASE" });
    state = send(state, { type: "STILL_ON_CALL_NO" });
    state = send(state, { type: "CONFIRM_TRANSACTIONS", transactions: [{ amount: 1000 }] });
    state = send(state, { type: "SELECT_CHANNEL", channel: "call" });
    state = send(state, { type: "CONFIRM_JURISDICTION", stateUt: "Goa" });
    [0, 1, 2].forEach((index) => {
      state = send(state, { type: "CONFIRM_SENTENCE", index, confirmed: true });
    });
    state = send(state, { type: "RESET_CASE" });
    expect(state.value).toBe(ROK_STATES.IDLE);
  });
});
