import Icon from "./Icon.jsx";

/**
 * The only button in the app. Variants carry meaning:
 * danger = the money, primary = the trusted next step, quiet = an
 * alternative, ghost = a way back.
 */
export default function Button({
  variant = "primary",
  size,
  block = false,
  icon,
  iconAfter,
  children,
  className = "",
  ...rest
}) {
  const classes = [
    "rok-btn",
    `rok-btn--${variant}`,
    size === "lg" ? "rok-btn--lg" : "",
    block ? "rok-btn--block" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <button className={classes} type="button" {...rest}>
      {icon && <Icon name={icon} />}
      <span>{children}</span>
      {iconAfter && <Icon name={iconAfter} />}
    </button>
  );
}
