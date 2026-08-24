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
