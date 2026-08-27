import { useEffect, useRef, useState } from "react";
import Button from "../components/Button.jsx";
import Icon from "../components/Icon.jsx";
import { formatDuration } from "../i18n/format.js";
import "./RaceView.css";

/**
 * Screen 10 — the Race.
 *
 * The pitch screen: the same complaint, filed both ways, against one clock.
 *
 * It runs in real time and is not accelerated. That matters — an
 * accelerated race would make the point faster and would also be a claim
 * nobody could check. At true speed Rok finishes at 0:50 while the portal
 * is still on step 4 of 21, which is the entire argument, and it lands
 * inside the first minute of a demo.
 *
 * NCRP's step list and its ~21-step count come from cybercrime.gov.in's
 * own published citizen filing procedure. The per-step timings are an
 * illustration of a competent user working steadily, and the screen says
 * so rather than implying they were measured.
 */

/** Rok's beats, in seconds, from the journey in the concept document. */
const ROK_STEPS = [
  { at: 0, key: "Case opened, timestamped" },
  { at: 4, key: "Are they still on the phone?" },
  { at: 10, key: "Which one is wrong?" },
  { at: 22, key: "Only this one?" },
  { at: 30, key: "How did they reach you?" },
  { at: 38, key: "Where are you?" },
  { at: 45, key: "Is this true? (x3)" },
  { at: 50, key: "Case reference issued" },
];

/** The portal's four-part form, roughly 21 steps. */
const NCRP_STEPS = [
  { at: 0, key: "Open cybercrime.gov.in" },
  { at: 18, key: "Choose report type" },
  { at: 40, key: "Register: name, mobile" },
  { at: 75, key: "Wait for OTP, enter it" },
  { at: 110, key: "Set a password" },
  { at: 135, key: "Category of complaint" },
  { at: 160, key: "Sub-category of complaint" },
  { at: 185, key: "Select State / UT" },
  { at: 205, key: "Incident date and time" },
  { at: 230, key: "Find the bank SMS" },
  { at: 275, key: "Type the 12-digit UTR" },
  { at: 305, key: "Fraud amount" },
  { at: 325, key: "Bank / wallet name" },
  { at: 350, key: "Victim account number" },
  { at: 380, key: "Suspect details" },
  { at: 410, key: "Write 200+ characters" },
  { at: 470, key: "Remove special characters" },
  { at: 490, key: "Scan a photo ID" },
  { at: 525, key: "Upload it, under 5 MB" },
  { at: 545, key: "Preview" },
  { at: 560, key: "Submit" },
];

const ROK_TOTAL = ROK_STEPS[ROK_STEPS.length - 1].at;
const NCRP_TOTAL = NCRP_STEPS[NCRP_STEPS.length - 1].at;

function completedCount(steps, seconds) {
  return steps.filter((step) => seconds >= step.at).length;
}

export default function RaceView({ t, onBack }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const startedAt = useRef(null);

  useEffect(() => {
    if (!running) return undefined;
    startedAt.current = Date.now() - elapsed * 1000;
    const timer = setInterval(() => {
      const next = (Date.now() - startedAt.current) / 1000;
      setElapsed(next);
      if (next >= NCRP_TOTAL) setRunning(false);
    }, 100);
    return () => clearInterval(timer);
    /* elapsed is intentionally not a dependency: including it would restart
       the interval every tick. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const rokDone = completedCount(ROK_STEPS, elapsed);
  const ncrpDone = completedCount(NCRP_STEPS, elapsed);
  const rokFinished = elapsed >= ROK_TOTAL;

  const reset = () => {
    setRunning(false);
    setElapsed(0);
  };

  return (
    <section className="rok-container screen race">
      <Button variant="ghost" icon="arrowLeft" onClick={onBack}>{t("raceView.back")}</Button>

      <header className="race__header">
        <h1 className="race__title">{t("raceView.title")}</h1>
        <p className="rok-support">{t("raceView.subtitle")}</p>
      </header>

      <div className="race__controls">
        <span className={`race__clock ${rokFinished ? "race__clock--done" : ""}`}>
          <Icon name="clock" size={22} />
          <span>{formatDuration(elapsed * 1000)}</span>
        </span>

        {!running && elapsed === 0 && (
          <Button variant="danger" onClick={() => setRunning(true)}>{t("raceView.start")}</Button>
        )}
        {running && (
          <Button variant="quiet" onClick={() => setRunning(false)}>{t("raceView.pause")}</Button>
        )}
        {!running && elapsed > 0 && (
          <>
            <Button variant="primary" onClick={() => setRunning(true)}>{t("raceView.resume")}</Button>
            <Button variant="ghost" onClick={reset}>{t("raceView.reset")}</Button>
          </>
        )}
      </div>

      {rokFinished && (
        <p className="race__verdict" role="status">
          <Icon name="check" size={20} />
          {t("raceView.verdict", {
            done: String(ncrpDone),
            total: String(NCRP_STEPS.length),
          })}
        </p>
      )}

      <div className="race__lanes">
        <Lane
          title={t("raceView.ncrp_column")}
          tone="ncrp"
          steps={NCRP_STEPS}
          done={ncrpDone}
          total={NCRP_TOTAL}
          elapsed={elapsed}
          t={t}
        />
        <Lane
          title={t("raceView.rok_column")}
          tone="rok"
          steps={ROK_STEPS}
          done={rokDone}
          total={ROK_TOTAL}
          elapsed={elapsed}
          t={t}
        />
      </div>

      <p className="race__source">{t("raceView.race_note")}</p>
    </section>
  );
}

function Lane({ title, tone, steps, done, total, elapsed, t }) {
  const finished = elapsed >= total;
  const current = steps[Math.min(done, steps.length - 1)];

  return (
    <div className={`lane lane--${tone}`}>
      <header className="lane__head">
        <h2>{title}</h2>
        <p className="lane__count">
          {finished
            ? t("raceView.lane_done", { seconds: String(total) })
            : t("raceView.lane_progress", { done: String(done), total: String(steps.length) })}
        </p>
      </header>

      <div
        className="lane__bar"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={steps.length}
        aria-valuenow={done}
        aria-label={title}
      >
        <span style={{ width: `${Math.min(100, (done / steps.length) * 100)}%` }} />
      </div>

      <p className="lane__current">
        {finished ? <Icon name="check" size={18} /> : <Icon name="clock" size={18} />}
        <span>{finished ? t("raceView.lane_complete") : current.key}</span>
      </p>

      <ol className="lane__steps">
        {steps.map((step, index) => (
          <li
            key={step.key}
            className={index < done ? "lane__step--done" : index === done ? "lane__step--current" : ""}
          >
            <span className="lane__step-time">{formatDuration(step.at * 1000)}</span>
            <span>{step.key}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
