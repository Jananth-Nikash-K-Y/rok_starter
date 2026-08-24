/** Rok's explicit, auditable finite state machine. */
export const ROK_STATES = Object.freeze({
  IDLE: "IDLE",
  SAFETY_TRIAGE: "SAFETY_TRIAGE",
  SAFETY_HANGUP_SCRIPT: "SAFETY_HANGUP_SCRIPT",
  MESSAGE_WALL: "MESSAGE_WALL",
  SCOPE: "SCOPE",
  REACHED_VIA: "REACHED_VIA",
  READ_BACK: "READ_BACK",
  CASE_COMPLETE: "CASE_COMPLETE",
  CALM_MODE: "CALM_MODE",
});

function createCaseId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `rok-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Creates the case shape consumed by the later engines and adapters. */
export function createInitialCase() {
  return {
    id: createCaseId(),
    openedAt: null,
    stillOnCall: null,
    transactions: [],
    channel: null,
    ncrpCategory: null,
    ncrpSubCategory: null,
    stateUt: null,
    narrative: null,
    sentenceConfirmations: [false, false, false],
    idAttachment: null,
  };
}

export function createInitialMachineState() {
  return { value: ROK_STATES.IDLE, case: createInitialCase() };
}

function createTransaction(message = {}) {
  return {
    raw: message.raw ?? "",
    bank: message.bank ?? "Unknown",
    amount: message.amount ?? 0,
    currency: "INR",
    timestamp: message.timestamp ?? null,
    accountTail: message.accountTail ?? null,
    utr: message.utr ?? null,
    beneficiaryVpa: message.beneficiaryVpa ?? null,
    confidence: message.confidence ?? "low",
  };
}

function updateCase(state, updates, value = state.value) {
  return { ...state, value, case: { ...state.case, ...updates } };
}

/** Invalid events are ignored so a screen cannot skip a required step. */
export function rokReducer(state, event) {
  switch (event.type) {
    case "OPEN_CASE":
      if (state.value !== ROK_STATES.IDLE) return state;
      return updateCase(state, { openedAt: event.openedAt ?? new Date().toISOString() }, ROK_STATES.SAFETY_TRIAGE);
    case "STILL_ON_CALL_YES":
      if (state.value !== ROK_STATES.SAFETY_TRIAGE) return state;
      return updateCase(state, { stillOnCall: true }, ROK_STATES.SAFETY_HANGUP_SCRIPT);
    case "STILL_ON_CALL_NO":
      if (state.value !== ROK_STATES.SAFETY_TRIAGE) return state;
      return updateCase(state, { stillOnCall: false }, ROK_STATES.MESSAGE_WALL);
    case "SELECT_MESSAGE":
      if (state.value !== ROK_STATES.MESSAGE_WALL) return state;
      return updateCase(state, { transactions: [...state.case.transactions, createTransaction(event.message)] }, ROK_STATES.SCOPE);
    case "SCOPE_ONLY_THIS":
      return state.value === ROK_STATES.SCOPE ? { ...state, value: ROK_STATES.REACHED_VIA } : state;
    case "SCOPE_MORE":
      return state.value === ROK_STATES.SCOPE ? { ...state, value: ROK_STATES.MESSAGE_WALL } : state;
    case "SELECT_CHANNEL":
      if (state.value !== ROK_STATES.REACHED_VIA) return state;
      return updateCase(state, { channel: event.channel }, ROK_STATES.READ_BACK);
    case "CONFIRM_SENTENCE": {
      if (state.value !== ROK_STATES.READ_BACK || !Number.isInteger(event.index) || event.index < 0 || event.index > 2) return state;
      const confirmations = [...state.case.sentenceConfirmations];
      confirmations[event.index] = Boolean(event.confirmed);
      return updateCase(state, { sentenceConfirmations: confirmations }, confirmations.every(Boolean) ? ROK_STATES.CASE_COMPLETE : ROK_STATES.READ_BACK);
    }
    case "ENTER_CALM_MODE":
      return state.value === ROK_STATES.CASE_COMPLETE ? { ...state, value: ROK_STATES.CALM_MODE } : state;
    case "GENERATE_HANDOFF_CODE":
    default:
      return state;
  }
}
