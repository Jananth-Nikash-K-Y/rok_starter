import { describe, expect, it } from "vitest";
import { GOLDEN_HOUR_MILLISECONDS, goldenHourStatus, mayAsk } from "./goldenHour.js";

const OPENED = "2026-08-24T18:00:00.000Z";
const at = (minutes) => new Date(OPENED).getTime() + minutes * 60 * 1000;

describe("goldenHourStatus", () => {
  it("is idle before a case is opened", () => {
    const status = goldenHourStatus(null);
    expect(status.phase).toBe("idle");
    expect(status.remaining).toBe(GOLDEN_HOUR_MILLISECONDS);
  });

  it("moves through calm, urgent and critical as the hour burns", () => {
    expect(goldenHourStatus(OPENED, at(5)).phase).toBe("calm");
    expect(goldenHourStatus(OPENED, at(35)).phase).toBe("urgent");
    expect(goldenHourStatus(OPENED, at(50)).phase).toBe("critical");
  });

  it("expires exactly at the hour and never reports negative time", () => {
    const status = goldenHourStatus(OPENED, at(75));
    expect(status.phase).toBe("elapsed");
    expect(status.expired).toBe(true);
    expect(status.remaining).toBe(0);
    expect(status.fraction).toBe(1);
  });

  it("clamps a clock that has gone backwards", () => {
    expect(goldenHourStatus(OPENED, at(-10)).elapsed).toBe(0);
  });
});

describe("mayAsk", () => {
  it("always permits a question that changes whether money is frozen", () => {
    expect(mayAsk("freeze", false)).toBe(true);
  });

  it("defers paperwork until the case exists", () => {
    expect(mayAsk("paperwork", false)).toBe(false);
    expect(mayAsk("paperwork", true)).toBe(true);
  });
});
