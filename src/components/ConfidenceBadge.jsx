import Icon from "./Icon.jsx";

/**
 * How sure the parser is about what it read.
 *
 * Colour alone never carries this — each level has its own icon and its own
 * words, per GIGW 3.0 and because the people most likely to be reporting a
 * fraud are the most likely to have a colour vision deficiency.
 */
const LEVELS = {
  high: { icon: "check", key: "messageWall.confidence_high" },
  medium: { icon: "alert", key: "messageWall.confidence_medium" },
  low: { icon: "alert", key: "messageWall.confidence_low" },
  corrected: { icon: "check", key: "messageWall.confidence_corrected" },
};

export default function ConfidenceBadge({ level, t }) {
  const config = LEVELS[level] ?? LEVELS.low;
  const tone = level === "corrected" ? "high" : level;
  return (
    <span className={`rok-badge rok-badge--${tone}`}>
      <Icon name={config.icon} size={14} />
      {t(config.key)}
    </span>
  );
}
