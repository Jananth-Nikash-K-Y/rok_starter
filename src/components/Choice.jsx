import Icon from "./Icon.jsx";

/**
 * A large icon-and-label target, used everywhere the user answers by
 * recognition rather than by reading: yes/no, scope, contact channel.
 *
 * The label is always rendered as text beside the icon rather than as an
 * icon alone — meaning must never depend on interpreting a glyph.
 */
export default function Choice({ icon, label, hint, tone = "neutral", lang, ...rest }) {
  const classes = ["rok-choice", tone !== "neutral" ? `rok-choice--${tone}` : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} type="button" {...rest}>
      <span className="rok-choice__icon">
        <Icon name={icon} size={28} />
      </span>
      <span className="rok-choice__label" lang={lang}>{label}</span>
      {hint && <span className="rok-choice__hint">{hint}</span>}
    </button>
  );
}
