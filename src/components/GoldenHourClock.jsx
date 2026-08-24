import { useEffect, useState } from "react";
import Icon from "./Icon.jsx";
import { goldenHourStatus } from "../engines/goldenHour.js";
import { formatDuration } from "../i18n/format.js";

/**
 * The visible Golden Hour countdown (mechanic M3).
 *
 * It ticks once a second and changes tone as the hour burns, but it never
 * blocks or hurries the user with a modal — a victim who runs out of clock
 * still has an open, timestamped case, which is the entire point of the
 * inversion. The clock informs; it does not punish.
 */
export default function GoldenHourClock({ openedAt, label }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!openedAt) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [openedAt]);

  if (!openedAt) return null;

  const status = goldenHourStatus(openedAt, now);
  const value = formatDuration(status.remaining);

  return (
    <span className={`rok-clock rok-clock--${status.phase}`}>
      <Icon name="clock" size={18} />
      <span className="rok-sr-only">{label}</span>
      <span className="rok-clock__value" aria-hidden="true">{value}</span>
      {/* Announced only once a minute, so a screen reader is not
          interrupted every second by a ticking clock. */}
      <span className="rok-sr-only" aria-live="polite">
        {status.remaining % 60000 < 1000 ? `${Math.round(status.remaining / 60000)}` : ""}
      </span>
    </span>
  );
}
