import { describe, expect, it } from "vitest";
import { DEMO_ACCESS, checkDemoAccess } from "./demoAccess.js";

describe("evaluator access", () => {
  it("accepts the published credentials", () => {
    expect(checkDemoAccess(DEMO_ACCESS.username, DEMO_ACCESS.password)).toBe(true);
  });

  /* Evaluators retype these from a submission form; a stray capital or a
     trailing space should not cost anyone their first impression. */
  it("forgives case and whitespace in the username", () => {
    expect(checkDemoAccess("  Evaluator ", DEMO_ACCESS.password)).toBe(true);
    expect(checkDemoAccess("EVALUATOR", DEMO_ACCESS.password)).toBe(true);
  });

  it("does not forgive the password", () => {
    expect(checkDemoAccess(DEMO_ACCESS.username, "ROK-2026")).toBe(false);
    expect(checkDemoAccess(DEMO_ACCESS.username, " rok-2026")).toBe(false);
  });

  it("rejects an empty attempt", () => {
    expect(checkDemoAccess("", "")).toBe(false);
  });

  it("never throws on odd input", () => {
    [null, undefined, 0, {}, []].forEach((value) => {
      expect(() => checkDemoAccess(value, value)).not.toThrow();
    });
  });
});
