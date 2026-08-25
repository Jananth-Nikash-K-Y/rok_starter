/**
 * Which State or UT police force gets this complaint.
 *
 * NCRP routes a complaint to the State/UT the complainant selects, which
 * makes it a mandatory field and makes the citizen responsible for their
 * own jurisdictional routing while they are panicking. Rok removes the
 * choice where it can and reduces it to one confirmation where it cannot.
 *
 * A browser cannot infer this on its own: `Asia/Kolkata` is the only Indian
 * timezone and covers all 36 jurisdictions, so timezone tells us nothing.
 * The one honest signal is the device's own location, which the user grants
 * explicitly. Everything here is a suggestion; the interface always
 * confirms it, and never files a guess.
 */

/**
 * Approximate geographic centres, plus tight bounds for the small
 * jurisdictions that sit inside larger ones.
 *
 * Nearest-centre alone is not good enough: Chennai is closer to the centre
 * of Puducherry than to the centre of Tamil Nadu, so a naive nearest-centre
 * lookup routes a Chennai complaint to the wrong police force. The enclaves
 * therefore carry `bounds` and are matched only when the point is actually
 * inside them; everything else falls through to nearest centre.
 *
 * This is still coarse — it resolves neither exact boundaries nor the
 * non-contiguous parts of some UTs — which is exactly why the answer is
 * always shown to the user for confirmation and never filed silently.
 */
export const STATES_UT = [
  { name: "Andhra Pradesh", lat: 15.9, lon: 79.7 },
  { name: "Arunachal Pradesh", lat: 28.2, lon: 94.7 },
  { name: "Assam", lat: 26.2, lon: 92.9 },
  { name: "Bihar", lat: 25.6, lon: 85.1 },
  { name: "Chhattisgarh", lat: 21.3, lon: 81.9 },
  { name: "Goa", lat: 15.3, lon: 74.1 },
  { name: "Gujarat", lat: 22.6, lon: 71.6 },
  { name: "Haryana", lat: 29.2, lon: 76.4 },
  { name: "Himachal Pradesh", lat: 31.9, lon: 77.2 },
  { name: "Jharkhand", lat: 23.6, lon: 85.3 },
  { name: "Karnataka", lat: 14.7, lon: 76.0 },
  { name: "Kerala", lat: 10.5, lon: 76.3 },
  { name: "Madhya Pradesh", lat: 23.5, lon: 78.4 },
  { name: "Maharashtra", lat: 19.5, lon: 75.9 },
  { name: "Manipur", lat: 24.7, lon: 93.9 },
  { name: "Meghalaya", lat: 25.5, lon: 91.4 },
  { name: "Mizoram", lat: 23.3, lon: 92.8 },
  { name: "Nagaland", lat: 26.1, lon: 94.4 },
  { name: "Odisha", lat: 20.5, lon: 84.5 },
  { name: "Punjab", lat: 31.1, lon: 75.4 },
  { name: "Rajasthan", lat: 26.6, lon: 73.8 },
  { name: "Sikkim", lat: 27.5, lon: 88.5 },
  { name: "Tamil Nadu", lat: 11.1, lon: 78.6 },
  { name: "Telangana", lat: 17.9, lon: 79.1 },
  { name: "Tripura", lat: 23.8, lon: 91.7 },
  { name: "Uttar Pradesh", lat: 26.9, lon: 80.9 },
  { name: "Uttarakhand", lat: 30.1, lon: 79.2 },
  { name: "West Bengal", lat: 23.0, lon: 87.9 },
  { name: "Andaman and Nicobar Islands", lat: 11.7, lon: 92.7 },
  { name: "Chandigarh", lat: 30.75, lon: 76.78, bounds: [30.66, 76.66, 30.81, 76.86] },
  {
    name: "Dadra and Nagar Haveli and Daman and Diu",
    lat: 20.3, lon: 73.0, bounds: [20.0, 72.8, 20.5, 73.22],
  },
  { name: "Delhi", lat: 28.65, lon: 77.1, bounds: [28.40, 76.83, 28.89, 77.35] },
  { name: "Jammu and Kashmir", lat: 33.6, lon: 75.0 },
  { name: "Ladakh", lat: 34.5, lon: 77.6 },
  { name: "Lakshadweep", lat: 10.6, lon: 72.6 },
  { name: "Puducherry", lat: 11.94, lon: 79.83, bounds: [11.71, 79.70, 12.06, 79.91] },
];

const EARTH_RADIUS_KM = 6371;
const toRadians = (degrees) => (degrees * Math.PI) / 180;

function distanceKm(aLat, aLon, bLat, bLon) {
  const dLat = toRadians(bLat - aLat);
  const dLon = toRadians(bLon - aLon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(aLat)) * Math.cos(toRadians(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * The most likely State/UT for a coordinate, best first.
 *
 * This returns a shortlist rather than an answer on purpose. A single
 * centre per state cannot represent a large irregular one — Bengaluru sits
 * nearer the centre of Tamil Nadu than the centre of Karnataka — so any
 * "nearest centre" claim is confidently wrong often enough to misroute a
 * complaint. What the geometry can do reliably is cut 36 options down to
 * three, which turns a long list into one tap without ever asserting
 * something the browser does not know.
 *
 * An enclave the point actually falls inside is returned alone, because
 * that one IS reliable.
 *
 * @returns {Array<{ name: string, distanceKm: number }>}
 */
export function likelyStateUts(latitude, longitude, count = 3) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];

  const enclave = STATES_UT.find(({ bounds }) => bounds
    && latitude >= bounds[0] && latitude <= bounds[2]
    && longitude >= bounds[1] && longitude <= bounds[3]);
  if (enclave) return [{ name: enclave.name, distanceKm: 0 }];

  return STATES_UT
    .filter((entry) => !entry.bounds)
    .map((entry) => ({
      name: entry.name,
      distanceKm: distanceKm(latitude, longitude, entry.lat, entry.lon),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, count);
}

/**
 * The single closest candidate, or null. Use `likelyStateUts` in the
 * interface — this exists for callers that genuinely want one value.
 * @returns {{ name: string, distanceKm: number } | null}
 */
export function nearestStateUt(latitude, longitude) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  /* An enclave wins outright when the point is inside it. */
  const enclave = STATES_UT.find(({ bounds }) => bounds
    && latitude >= bounds[0] && latitude <= bounds[2]
    && longitude >= bounds[1] && longitude <= bounds[3]);
  if (enclave) return { name: enclave.name, distanceKm: 0 };

  /* Otherwise nearest centre, ignoring the enclaves — being near one is
     not the same as being in it, and that mistake sends the complaint to
     the wrong police force. */
  let best = null;
  for (const entry of STATES_UT) {
    if (entry.bounds) continue;
    const km = distanceKm(latitude, longitude, entry.lat, entry.lon);
    if (!best || km < best.distanceKm) best = { name: entry.name, distanceKm: km };
  }
  return best;
}

/**
 * Asks the browser for a location and maps it to a State/UT.
 *
 * Never blocks the flow: if the user declines, the device has no fix, or it
 * takes too long, this resolves to null and the interface falls back to a
 * list. A fraud report must never wait on a permission dialog.
 *
 * @returns {Promise<Array<{ name: string, distanceKm: number }>>}
 */
export function detectStateUt({ timeoutMs = 6000 } = {}) {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve([]);
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const timer = setTimeout(() => finish([]), timeoutMs);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        clearTimeout(timer);
        finish(likelyStateUts(coords.latitude, coords.longitude));
      },
      () => {
        clearTimeout(timer);
        finish([]);
      },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 600000 },
    );
  });
}
