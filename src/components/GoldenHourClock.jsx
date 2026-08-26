import { useEffect, useState } from "react";
import { goldenHourStatus } from "../engines/goldenHour.js";
import { formatDuration } from "../i18n/format.js";

/**
 * The visible Golden Hour countdown (mechanic M3), drawn as a depleting
 * ring around the remaining time.
 *
 * A ring rather than a number alone, because the shape is readable without
 * reading: how much is left is legible at a glance, in any language, by
 * someone who cannot parse "47:12". The digits stay for everyone else, and
 * the whole thing is announced once a minute rather than every second so a
 * screen reader is not interrupted by a ticking clock.
 *
 * It informs and never punishes: a victim who runs out of clock still has
 * an open, timestamped case, which is the entire point of the inversion.
 */
const RADIUS = 15;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function GoldenHourClock({ openedAt, label }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!openedAt) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [openedAt]);

  if (!openedAt) return null;

  const status = goldenHourStatus(openedAt, now);
  const remainingFraction = 1 - status.fraction;

  return (
    <span className={`rok-clock rok-clock--${status.phase}`}>
      <span className="rok-clock__ring" aria-hidden="true">
        <svg viewBox="0 0 36 36" width="34" height="34">
          <circle className="rok-clock__track" cx="18" cy="18" r={RADIUS} />
          <circle
            className="rok-clock__sweep"
            cx="18"
            cy="18"
            r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - remainingFraction)}
          />
        </svg>
      </span>

      <span className="rok-sr-only">{label}</span>
      <span className="rok-clock__value" aria-hidden="true">
        {formatDuration(status.remaining)}
      </span>

      {/* Announced once a minute, not once a second. */}
      <span className="rok-sr-only" aria-live="polite">
        {status.remaining % 60000 < 1000 ? `${Math.round(status.remaining / 60000)}` : ""}
      </span>
    </span>
  );
}
