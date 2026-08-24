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
