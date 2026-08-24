import { describe, expect, it } from "vitest";
import { SAMPLE_INBOX } from "../fixtures/sampleSms.js";
import { parseTransactionSms } from "./smsParser.js";

const expectations = [
  {
    bank: "State Bank of India", bankKnown: true, amount: 45000,
    timestamp: "2026-08-24T18:17:12.000Z", timeKnown: true, accountTail: "4521",
    utr: "412583947261", beneficiaryVpa: "scammer123@okhdfcbank",
    direction: "debit", confidence: "high",
  },
  {
    bank: "HDFC Bank", bankKnown: true, amount: 12500,
    timestamp: "2026-08-23T18:30:00.000Z", timeKnown: false, accountTail: "4521",
    utr: "512348820193", beneficiaryVpa: "fraudster@ybl",
    direction: "debit", confidence: "high",
  },
  {
    bank: "ICICI Bank", bankKnown: true, amount: 8000,
    timestamp: "2026-08-23T18:30:00.000Z", timeKnown: false, accountTail: "9981",
    utr: "402719384756", beneficiaryVpa: null,
    direction: "debit", confidence: "high",
  },
  {
    bank: "Bank of Baroda", bankKnown: true, amount: 22000,
    timestamp: "2026-08-24T13:02:00.000Z", timeKnown: true, accountTail: "5643",
    utr: "398271640012", beneficiaryVpa: null,
    direction: "debit", confidence: "high",
  },
  {
    bank: "Punjab National Bank", bankKnown: true, amount: 5000,
    timestamp: "2026-08-24T09:32:44.000Z", timeKnown: true, accountTail: "7734",
    utr: "908172635401", beneficiaryVpa: "abc@paytm",
    direction: "debit", confidence: "high",
  },
  {
    bank: "Paytm Wallet", bankKnown: true, amount: 3499,
    timestamp: "2026-08-24T14:41:00.000Z", timeKnown: true, accountTail: null,
    utr: "PYTM88291736452", beneficiaryVpa: null,
    direction: "debit", confidence: "high",
  },
];

describe("parseTransactionSms", () => {
  SAMPLE_INBOX.forEach((fixture, index) => {
    it(`extracts every supported field from ${fixture.bankLabel}`, () => {
      expect(parseTransactionSms(fixture.text)).toEqual(expectations[index]);
    });
  });

  it("returns null for text carrying no transaction evidence", () => {
    expect(parseTransactionSms("This is not a transaction message.")).toBeNull();
    expect(parseTransactionSms("")).toBeNull();
    expect(parseTransactionSms(null)).toBeNull();
  });

  it("never throws, whatever it is handed", () => {
    const hostile = ["@@@@", "Rs.", "debited", "0000000000000000", "₹₹₹", "a".repeat(5000)];
    hostile.forEach((input) => expect(() => parseTransactionSms(input)).not.toThrow());
  });

  /* The bug this replaced: an unlisted bank returned null outright, losing a
     perfectly extractable amount and UTR. Most Indian banks are unlisted. */
  it("still extracts evidence from a bank it does not recognise", () => {
    const parsed = parseTransactionSms(
      "Dear Customer, Rs.45000.00 debited from A/c XX4521 on 24-Aug-26 23:47:12 " +
      "to VPA scammer123@okhdfcbank (UPI Ref No 412583947261). -Suryoday Bank",
    );
    expect(parsed).not.toBeNull();
    expect(parsed.amount).toBe(45000);
    expect(parsed.utr).toBe("412583947261");
    expect(parsed.bankKnown).toBe(false);
    expect(parsed.bank).toBe("Suryoday Bank");
    /* Unrecognised institution must never claim high confidence. */
    expect(parsed.confidence).toBe("medium");
  });

  it("marks a date-only message as having no known time", () => {
    const parsed = parseTransactionSms(
      "Alert: Rs 9,000.00 debited from a/c **1234 on 12-08-26. UPI Ref 112233445566. -Axis Bank",
    );
    expect(parsed.timeKnown).toBe(false);
    expect(parsed.timestamp).toBe("2026-08-11T18:30:00.000Z");
  });

  it("keeps a real clock time when the message carries one", () => {
    const parsed = parseTransactionSms(
      "Rs.500 debited from A/c XX1111 on 01-01-2026 09:05:00. Ref No 999888777666 -Canara Bank",
    );
    expect(parsed.timeKnown).toBe(true);
  });

  it("distinguishes a credit from a debit", () => {
    const parsed = parseTransactionSms(
      "Rs.1,200.00 credited to A/c XX4521 on 24-08-26. Ref No 123456789012 -HDFC Bank",
    );
    expect(parsed.direction).toBe("credit");
  });

  it("does not mistake an email address for a UPI handle", () => {
    const parsed = parseTransactionSms(
      "Rs.700 debited from A/c XX2222 on 03-03-26. Ref No 555666777888. " +
      "Queries: care@hdfcbank.com -HDFC Bank",
    );
    expect(parsed.beneficiaryVpa).toBeNull();
  });

  it("downgrades confidence when no reference number is present", () => {
    const parsed = parseTransactionSms(
      "Rs.2,500 debited from A/c XX3333 on 04-04-26 for a purchase. -ICICI Bank",
    );
    expect(parsed.utr).toBeNull();
    expect(parsed.confidence).toBe("medium");
  });

  it("reports low confidence when the amount could not be read", () => {
    const parsed = parseTransactionSms(
      "Your account was debited. UPI Ref No 741852963000 -SBI",
    );
    expect(parsed.amount).toBeNull();
    expect(parsed.confidence).toBe("low");
  });
});
