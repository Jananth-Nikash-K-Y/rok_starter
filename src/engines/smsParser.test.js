import { describe, expect, it } from "vitest";
import { SAMPLE_INBOX } from "../fixtures/sampleSms.js";
import { parseTransactionSms } from "./smsParser.js";

const expectations = [
  {
    bank: "SBI", amount: 45000, timestamp: "2026-08-24T18:17:12.000Z", accountTail: "4521",
    utr: "412583947261", beneficiaryVpa: "scammer123@okhdfcbank", confidence: "high",
  },
  {
    bank: "HDFC Bank", amount: 12500, timestamp: "2026-08-23T18:30:00.000Z", accountTail: "4521",
    utr: "512348820193", beneficiaryVpa: "fraudster@ybl", confidence: "high",
  },
  {
    bank: "ICICI Bank", amount: 8000, timestamp: "2026-08-23T18:30:00.000Z", accountTail: "9981",
    utr: "402719384756", beneficiaryVpa: null, confidence: "high",
  },
  {
    bank: "Bank of Baroda", amount: 22000, timestamp: "2026-08-24T13:02:00.000Z", accountTail: "5643",
    utr: "398271640012", beneficiaryVpa: null, confidence: "high",
  },
  {
    bank: "PNB", amount: 5000, timestamp: "2026-08-24T09:32:44.000Z", accountTail: "7734",
    utr: "908172635401", beneficiaryVpa: "abc@paytm", confidence: "high",
  },
  {
    bank: "Paytm Wallet", amount: 3499, timestamp: "2026-08-24T14:41:00.000Z", accountTail: null,
    utr: null, beneficiaryVpa: null, confidence: "low",
  },
];

describe("parseTransactionSms", () => {
  SAMPLE_INBOX.forEach((fixture, index) => {
    it(`extracts every supported field from ${fixture.bankLabel}`, () => {
      expect(parseTransactionSms(fixture.text)).toEqual(expectations[index]);
    });
  });

  it("returns null for unsupported text", () => {
    expect(parseTransactionSms("This is not a transaction message.")).toBeNull();
  });
});
