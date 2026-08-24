/**
 * Four ticks for the four freeze-relevant questions. Deliberately not a
 * percentage: the user is told how few steps remain, not how much of a
 * form they have left.
 */
export default function ProgressRail({ step, total = 4, label }) {
  return (
    <div
      className="rok-progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={Math.min(step, total)}
      aria-label={label}
    >
      {Array.from({ length: total }, (_, index) => {
        const state = index < step ? "done" : index === step ? "current" : "todo";
        return <span key={index} className={`rok-progress__step rok-progress__step--${state}`} />;
      })}
    </div>
  );
}
