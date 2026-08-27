import { describe, expect, it } from "vitest";
import { composeNarrative, composeReadBackSentences } from "./narrative.js";

const sampleCase = {
  id: "test-case-001",
  openedAt: "2026-08-24T18:00:00.000Z",
  stillOnCall: false,
  transactions: [{
    raw: "test raw text",
    bank: "SBI",
    amount: 45000,
    currency: "INR",
    timestamp: "2026-08-24T18:17:12.000Z",
    accountTail: "4521",
    utr: "412583947261",
    beneficiaryVpa: "scammer123@okhdfcbank",
    confidence: "high",
  }],
  channel: "call",
  ncrpCategory: null,
  ncrpSubCategory: null,
  stateUt: null,
  narrative: null,
  sentenceConfirmations: [false, false, false],
  idAttachment: null,
};

describe("composeNarrative", () => {
  it("produces a string of at least 200 characters", () => {
    const result = composeNarrative(sampleCase);
    expect(result.length).toBeGreaterThanOrEqual(200);
  });

  it("matches the safe NCRP character set", () => {
    const result = composeNarrative(sampleCase);
    expect(result).toMatch(/^[A-Za-z0-9 ,.\-]+$/); // eslint-disable-line no-useless-escape
  });

  it("includes key case fields in the output", () => {
    const result = composeNarrative(sampleCase);
    expect(result).toContain("45,000");
    expect(result).toContain("4521");
    expect(result).toContain("412583947261");
  });
});

describe("composeReadBackSentences", () => {
  it("returns exactly three sentences", () => {
    const result = composeReadBackSentences(sampleCase, "en");
    expect(result).toHaveLength(3);
  });

  it("returns strings in all three positions", () => {
    const result = composeReadBackSentences(sampleCase, "en");
    result.forEach((sentence) => {
      expect(typeof sentence).toBe("string");
      expect(sentence.length).toBeGreaterThan(10);
    });
  });
});

describe("narrative honesty", () => {
  const baseCase = {
    id: "case-1",
    openedAt: "2026-08-24T18:00:00.000Z",
    stillOnCall: false,
    channel: "call",
    sentenceConfirmations: [true, true, true],
    transactions: [{
      bank: "State Bank of India", bankKnown: true, amount: 45000,
      timestamp: "2026-08-24T18:17:12.000Z", timeKnown: true,
      accountTail: "4521", utr: "412583947261",
      beneficiaryVpa: "scammer123@okhdfcbank", confidence: "high",
    }],
  };

  it("meets the portal's floor and character rules", () => {
    const narrative = composeNarrative(baseCase);
    expect(narrative.length).toBeGreaterThanOrEqual(200);
    expect(narrative).toMatch(/^[A-Za-z0-9 ,.-]+$/);
  });

  /* A complaint must not assert a clock time the bank alert never carried. */
  it("does not state a time when the message had none", () => {
    const dateOnly = {
      ...baseCase,
      transactions: [{ ...baseCase.transactions[0], timeKnown: false }],
    };
    const narrative = composeNarrative(dateOnly);
    expect(narrative).toContain("at a time not recorded in the bank alert");
    expect(narrative).not.toContain("23.47");
  });

  it("states the time when the evidence does carry one", () => {
    expect(composeNarrative(baseCase)).toContain("on 24-08-2026 at approximately 23.47 hours IST");
  });

  it("says an amount is unconfirmed rather than reporting zero", () => {
    const noAmount = {
      ...baseCase,
      transactions: [{ ...baseCase.transactions[0], amount: null }],
    };
    const narrative = composeNarrative(noAmount);
    expect(narrative).toContain("unable to confirm");
    expect(narrative).not.toMatch(/Rs\.0\b/);
  });

  it("still produces a valid complaint with no evidence attached", () => {
    const empty = { ...baseCase, transactions: [], channel: null };
    const narrative = composeNarrative(empty);
    expect(narrative.length).toBeGreaterThanOrEqual(200);
    expect(narrative).toMatch(/^[A-Za-z0-9 ,.-]+$/);
  });

  it("strips the rupee sign and every other non-portal character", () => {
    const narrative = composeNarrative(baseCase);
    expect(narrative).not.toContain("₹");
    expect(narrative).not.toContain("@");
  });
});

describe("identifier integrity", () => {
  const withVpa = {
    id: "case-2", openedAt: "2026-08-24T18:00:00.000Z", stillOnCall: false,
    channel: "call", sentenceConfirmations: [true, true, true],
    transactions: [{
      bank: "HDFC Bank", bankKnown: true, amount: 12500,
      timestamp: "2026-08-24T18:17:12.000Z", timeKnown: true,
      accountTail: "4521", utr: "512348820193",
      beneficiaryVpa: "fraudster@ybl", confidence: "high",
    }],
  };

  /* Sanitising the @ away would silently corrupt the identifier the bank
     needs to trace the beneficiary. */
  it("spells out a UPI handle instead of losing its separator", () => {
    const narrative = composeNarrative(withVpa);
    expect(narrative).toContain("fraudster at ybl");
    expect(narrative).not.toContain("fraudsterybl");
  });

  it("keeps the reference number intact", () => {
    expect(composeNarrative(withVpa)).toContain("512348820193");
  });

  it("starts as a sentence", () => {
    expect(composeNarrative(withVpa)[0]).toMatch(/[A-Z]/);
  });
});
