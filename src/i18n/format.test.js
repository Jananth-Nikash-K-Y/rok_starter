import { describe, expect, it } from "vitest";
import {
  formatDuration,
  formatIndianCurrency,
  formatIndianDate,
  formatIndianDateTime,
  formatMaskedAccount,
} from "./format.js";

describe("formatIndianCurrency", () => {
  it("groups digits the Indian way", () => {
    expect(formatIndianCurrency(4500000)).toBe("₹45,00,000");
    expect(formatIndianCurrency(45000)).toBe("₹45,000");
    expect(formatIndianCurrency(999)).toBe("₹999");
  });

  it("keeps paise only when there are any", () => {
    expect(formatIndianCurrency(3241.1)).toBe("₹3,241.10");
    expect(formatIndianCurrency(45000.0)).toBe("₹45,000");
  });

  /* The amount is the recognition cue on the Message Wall; a missing one
     must read as missing, never as zero. */
  it("returns null rather than a fake zero when the amount is unknown", () => {
    expect(formatIndianCurrency(null)).toBeNull();
    expect(formatIndianCurrency(undefined)).toBeNull();
  });
});

describe("formatMaskedAccount", () => {
  it("shows four digits at most", () => {
    expect(formatMaskedAccount("4521")).toBe("•••• 4521");
    expect(formatMaskedAccount(null)).toBeNull();
  });
});

describe("Indian date and time", () => {
  const midnightIst = "2026-08-23T18:30:00.000Z";

  it("formats in IST regardless of the host timezone", () => {
    expect(formatIndianDate(midnightIst)).toBe("24/08/2026");
  });

  /* A date-only bank alert must not be shown as though it happened at
     midnight — see smsParser's timeKnown flag. */
  it("omits the time when the source had none", () => {
    expect(formatIndianDateTime(midnightIst, false)).toBe("24/08/2026");
    expect(formatIndianDateTime(midnightIst, true)).toBe("24/08/2026, 00:00");
  });
});

describe("formatDuration", () => {
  it("counts down in MM:SS and never goes negative", () => {
    expect(formatDuration(3600000)).toBe("60:00");
    expect(formatDuration(65000)).toBe("01:05");
    expect(formatDuration(-5000)).toBe("00:00");
  });
});
