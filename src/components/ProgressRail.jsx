/**
 * Four numbered steps for the four freeze-relevant questions.
 *
 * Numbers rather than a bar: a bar says how far along you are, a count says
 * how few are left — which is the reassuring fact when you are frightened
 * and the reason NCRP's twenty-one steps are worth naming at all.
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
        return (
          <span key={index} className={`rok-progress__step rok-progress__step--${state}`}>
            <span aria-hidden="true">{index + 1}</span>
          </span>
        );
      })}
    </div>
  );
}
