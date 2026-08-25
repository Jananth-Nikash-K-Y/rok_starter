import { describe, expect, it } from "vitest";
import { likelyStateUts, nearestStateUt, STATES_UT } from "./jurisdiction.js";

describe("nearestStateUt", () => {
  /* The contract is a shortlist, not an answer: a single centre per state
     cannot represent a large irregular one, so what must hold is that the
     right jurisdiction is always among the three offered. */
  const shortlist = (lat, lon) => likelyStateUts(lat, lon).map((entry) => entry.name);

  it("puts the correct State in the shortlist for major cities", () => {
    expect(shortlist(13.08, 80.27)).toContain("Tamil Nadu");     /* Chennai */
    expect(shortlist(12.97, 77.59)).toContain("Karnataka");      /* Bengaluru */
    expect(shortlist(22.57, 88.36)).toContain("West Bengal");    /* Kolkata */
    expect(shortlist(26.91, 75.79)).toContain("Rajasthan");      /* Jaipur */
    expect(shortlist(17.39, 78.49)).toContain("Telangana");      /* Hyderabad */
    expect(shortlist(19.08, 72.88)).toContain("Maharashtra");    /* Mumbai */
    expect(shortlist(9.93, 76.27)).toContain("Kerala");          /* Kochi */
    expect(shortlist(26.85, 80.95)).toContain("Uttar Pradesh");  /* Lucknow */
  });

  it("offers three candidates, closest first", () => {
    const list = likelyStateUts(12.97, 77.59);
    expect(list).toHaveLength(3);
    expect(list[0].distanceKm).toBeLessThanOrEqual(list[1].distanceKm);
  });

  /* A point genuinely inside an enclave is the one case geometry can be
     sure about, so it is offered alone rather than in a shortlist. */
  it("returns an enclave alone when the point is inside it", () => {
    expect(shortlist(28.61, 77.21)).toEqual(["Delhi"]);
    expect(shortlist(30.73, 76.78)).toEqual(["Chandigarh"]);
    expect(shortlist(11.93, 79.83)).toEqual(["Puducherry"]);
  });

  /* Chennai sits nearer the centre of Puducherry than the centre of Tamil
     Nadu. Without the enclave rule it was routed to the wrong force. */
  it("does not put a border city in the enclave it happens to be near", () => {
    expect(shortlist(13.08, 80.27)).not.toContain("Puducherry");
    expect(shortlist(30.90, 75.85)).toContain("Punjab");
  });

  it("covers every State and UT", () => {
    expect(STATES_UT).toHaveLength(36);
    const names = new Set(STATES_UT.map((entry) => entry.name));
    expect(names.size).toBe(36);
  });

  it("returns nothing rather than guessing from a bad coordinate", () => {
    expect(likelyStateUts(NaN, 80)).toEqual([]);
    expect(likelyStateUts(undefined, undefined)).toEqual([]);
    expect(nearestStateUt(NaN, 80)).toBeNull();
  });

  /* The result is a suggestion, not a finding: it is always confirmed by
     the user, so a point near a border landing on the wrong side is a
     recoverable inconvenience rather than a misrouted complaint. */
  it("reports how far each guess was, so the interface can hedge", () => {
    expect(likelyStateUts(13.08, 80.27)[0].distanceKm).toBeGreaterThan(0);
  });
});
