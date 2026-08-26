/**
 * How much is left.
 *
 * This was four bare numerals in a row, which told a first-time user
 * nothing: a numeral communicates "step" only to someone who already knows
 * they are in a sequence. What a frightened person actually needs to know
 * is that the end is close — so it says so in words, in their language,
 * with a bar that fills.
 *
 * "Question 2 of 4" is also the number that makes Rok's argument: the
 * portal it replaces takes twenty-one.
 */
export default function ProgressRail({ step, total = 4, label, remaining }) {
  const done = Math.min(step, total);
  const percent = (done / total) * 100;

  return (
    <div className="rok-progress">
      <div
        className="rok-progress__bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-label={label}
      >
        <span className="rok-progress__fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="rok-progress__label">{remaining}</p>
    </div>
  );
}
