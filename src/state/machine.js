/**
 * Rok's explicit, auditable finite state machine.
 *
 * One reducer, named states, named events. Invalid events are ignored rather
 * than throwing, so no screen can skip a required step and no malformed
 * interaction can strand the user between states.
 */

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
  GUARDIAN_HANDOFF: "GUARDIAN_HANDOFF",
});

/** States from which the case is considered filed and outputs are available. */
const COMPLETE_STATES = new Set([
  ROK_STATES.CASE_COMPLETE,
  ROK_STATES.CALM_MODE,
]);

export function isCaseComplete(value) {
  return COMPLETE_STATES.has(value);
}

function createCaseId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `rok-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * A short, spoken-friendly reference the victim can read to a 1930 operator.
 * Avoids characters that sound alike over a phone line (0/O, 1/I, 5/S).
 */
export function caseReferenceFrom(id) {
  const alphabet = "ACDEFGHJKMNPQRTUVWXY2346789";
  let hash = 0;
  for (const character of String(id)) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }
  let reference = "";
  for (let index = 0; index < 6; index += 1) {
    reference += alphabet[hash % alphabet.length];
    hash = Math.floor(hash / alphabet.length) + (index + 1) * 7919;
  }
  return `ROK-${reference.slice(0, 3)}-${reference.slice(3)}`;
}

/** The case shape consumed by every engine and output adapter. */
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
    /* Calm mode only. The file itself is held in memory and never persisted
       or transmitted; only its name is written to localStorage. */
    idAttachment: null,
    idAttachmentName: null,
    address: null,
  };
}

export function createInitialMachineState() {
  return { value: ROK_STATES.IDLE, previous: null, case: createInitialCase() };
}

function createTransaction(message = {}) {
  return {
    raw: message.raw ?? "",
    bank: message.bank ?? null,
    bankKnown: message.bankKnown ?? false,
    amount: message.amount ?? null,
    currency: "INR",
    timestamp: message.timestamp ?? null,
    timeKnown: message.timeKnown ?? false,
    accountTail: message.accountTail ?? null,
    utr: message.utr ?? null,
    beneficiaryVpa: message.beneficiaryVpa ?? null,
    direction: message.direction ?? "unknown",
    confidence: message.confidence ?? "low",
  };
}

function updateCase(state, updates, value = state.value) {
  return { ...state, value, case: { ...state.case, ...updates } };
}

export function rokReducer(state, event) {
  switch (event.type) {
    /* Rehydrating an in-progress case after a reload. Mechanic M1 promises
       that nothing the user does can destroy a case once it is open, which
       only holds if a refresh restores it. */
    case "RESTORE_CASE": {
      if (!event.snapshot?.case?.openedAt) return state;
      return {
        value: event.snapshot.value ?? ROK_STATES.SAFETY_TRIAGE,
        previous: null,
        case: { ...createInitialCase(), ...event.snapshot.case, idAttachment: null },
      };
    }

    /* Discards the current case and returns to the Palm. Only reachable
       from a completed case, and the interface asks twice before sending
       it — the case exists nowhere else, so this is the one destructive
       action in the app. */
    case "RESET_CASE":
      if (!isCaseComplete(state.value)) return state;
      return createInitialMachineState();

    case "OPEN_CASE":
      if (state.value !== ROK_STATES.IDLE) return state;
      return updateCase(
        state,
        { openedAt: event.openedAt ?? new Date().toISOString() },
        ROK_STATES.SAFETY_TRIAGE,
      );

    case "STILL_ON_CALL_YES":
      if (state.value !== ROK_STATES.SAFETY_TRIAGE) return state;
      return updateCase(state, { stillOnCall: true }, ROK_STATES.SAFETY_HANGUP_SCRIPT);

    case "STILL_ON_CALL_NO":
      if (state.value !== ROK_STATES.SAFETY_TRIAGE) return state;
      return updateCase(state, { stillOnCall: false }, ROK_STATES.MESSAGE_WALL);

    /* After the hang-up script, the victim still needs to file. */
    case "HANGUP_DONE":
      if (state.value !== ROK_STATES.SAFETY_HANGUP_SCRIPT) return state;
      return { ...state, value: ROK_STATES.MESSAGE_WALL };

    case "SELECT_MESSAGE":
      if (state.value !== ROK_STATES.MESSAGE_WALL) return state;
      return updateCase(
        state,
        { transactions: [...state.case.transactions, createTransaction(event.message)] },
        ROK_STATES.SCOPE,
      );

    /* Manual correction of a parsed field. Required by the risk register:
       a wrong identifier could freeze an innocent account, so every
       extracted value has to remain editable by the user. */
    case "CORRECT_FIELD": {
      const { index, field, value } = event;
      if (!Number.isInteger(index) || !state.case.transactions[index]) return state;
      const editable = new Set(["amount", "utr", "accountTail", "beneficiaryVpa", "bank"]);
      if (!editable.has(field)) return state;
      const transactions = state.case.transactions.map((transaction, position) =>
        position === index
          ? { ...transaction, [field]: value, confidence: "corrected" }
          : transaction,
      );
      return updateCase(state, { transactions });
    }

    case "SCOPE_ONLY_THIS":
      return state.value === ROK_STATES.SCOPE
        ? { ...state, value: ROK_STATES.REACHED_VIA }
        : state;

    case "SCOPE_MORE":
      return state.value === ROK_STATES.SCOPE
        ? { ...state, value: ROK_STATES.MESSAGE_WALL }
        : state;

    case "SELECT_CHANNEL":
      if (state.value !== ROK_STATES.REACHED_VIA) return state;
      return updateCase(
        state,
        {
          channel: event.channel,
          ncrpCategory: event.category ?? state.case.ncrpCategory,
          ncrpSubCategory: event.subCategory ?? state.case.ncrpSubCategory,
        },
        ROK_STATES.READ_BACK,
      );

    case "CONFIRM_SENTENCE": {
      if (
        state.value !== ROK_STATES.READ_BACK ||
        !Number.isInteger(event.index) ||
        event.index < 0 ||
        event.index > 2
      ) {
        return state;
      }
      const confirmations = [...state.case.sentenceConfirmations];
      confirmations[event.index] = Boolean(event.confirmed);
      const allConfirmed = confirmations.every(Boolean);
      return updateCase(
        state,
        { sentenceConfirmations: confirmations, narrative: event.narrative ?? state.case.narrative },
        allConfirmed ? ROK_STATES.CASE_COMPLETE : ROK_STATES.READ_BACK,
      );
    }

    /* A rejected sentence sends the user back to the evidence rather than
       letting a statement they disagree with reach the complaint. */
    case "REJECT_READBACK":
      if (state.value !== ROK_STATES.READ_BACK) return state;
      return updateCase(
        state,
        { sentenceConfirmations: [false, false, false] },
        ROK_STATES.MESSAGE_WALL,
      );

    case "ENTER_CALM_MODE":
      return state.value === ROK_STATES.CASE_COMPLETE
        ? { ...state, value: ROK_STATES.CALM_MODE }
        : state;

    case "EXIT_CALM_MODE":
      return state.value === ROK_STATES.CALM_MODE
        ? { ...state, value: ROK_STATES.CASE_COMPLETE }
        : state;

    case "SAVE_CALM_DETAILS":
      if (state.value !== ROK_STATES.CALM_MODE) return state;
      return updateCase(state, {
        address: event.address ?? state.case.address,
        idAttachment: event.idAttachment ?? state.case.idAttachment,
        idAttachmentName: event.idAttachment?.name ?? state.case.idAttachmentName,
      });

    /* Guardian handoff is reachable from any state once a case exists, and
       always returns the user exactly where they were. */
    case "OPEN_GUARDIAN_HANDOFF":
      if (!state.case.openedAt || state.value === ROK_STATES.GUARDIAN_HANDOFF) return state;
      return { ...state, previous: state.value, value: ROK_STATES.GUARDIAN_HANDOFF };

    case "CLOSE_GUARDIAN_HANDOFF":
      if (state.value !== ROK_STATES.GUARDIAN_HANDOFF) return state;
      return { ...state, previous: null, value: state.previous ?? ROK_STATES.CASE_COMPLETE };

    default:
      return state;
  }
}
