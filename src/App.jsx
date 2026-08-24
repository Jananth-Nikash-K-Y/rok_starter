import { useCallback, useEffect, useMemo, useState } from "react";
import { useT } from "./i18n/useT.js";
import {
  createInitialMachineState,
  isCaseComplete,
  rokReducer,
  ROK_STATES,
} from "./state/machine.js";
import { announce, setSpeechEnabled } from "./engines/a11yBus.js";
import GoldenHourClock from "./components/GoldenHourClock.jsx";
import Icon from "./components/Icon.jsx";
import ProgressRail from "./components/ProgressRail.jsx";
import CalmMode from "./screens/CalmMode.jsx";
import CaseComplete from "./screens/CaseComplete.jsx";
import GuardianHandoff from "./screens/GuardianHandoff.jsx";
import MessageWall from "./screens/MessageWall.jsx";
import Palm from "./screens/Palm.jsx";
import RaceView from "./screens/RaceView.jsx";
import ReachedVia from "./screens/ReachedVia.jsx";
import ReadBack from "./screens/ReadBack.jsx";
import SafetyTriage from "./screens/SafetyTriage.jsx";
import Scope from "./screens/Scope.jsx";
import "./components/ui.css";
import "./App.css";

const SNAPSHOT_KEY = "rok:active-case";
const LOCALE_KEY = "rok:locale";

/** Which of the four freeze-relevant questions the user is on. */
const STEP_FOR_STATE = {
  [ROK_STATES.MESSAGE_WALL]: 0,
  [ROK_STATES.SCOPE]: 1,
  [ROK_STATES.REACHED_VIA]: 2,
  [ROK_STATES.READ_BACK]: 3,
  [ROK_STATES.CASE_COMPLETE]: 4,
  [ROK_STATES.CALM_MODE]: 4,
};

/**
 * The File object in `idAttachment` is deliberately dropped before writing:
 * a photograph of a government ID must not be serialised into localStorage.
 * Only its filename survives a reload.
 */
function serializeSnapshot(machine) {
  const persistable = { ...machine.case };
  delete persistable.idAttachment;
  return JSON.stringify({ value: machine.value, case: persistable });
}

function readSnapshot() {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [machine, setMachine] = useState(createInitialMachineState);
  const [locale, setLocale] = useState(() => {
    try {
      return localStorage.getItem(LOCALE_KEY) ?? "en";
    } catch {
      return "en";
    }
  });
  const [speechOn, setSpeechOn] = useState(false);
  const [showRace, setShowRace] = useState(false);
  const t = useT(locale);

  const debugMode = useMemo(
    () => new URLSearchParams(window.location.search).has("debug"),
    [],
  );

  const send = useCallback((event) => {
    setMachine((current) => {
      const next = rokReducer(current, event);
      if (debugMode) {
        console.info("[Rok machine]", { event: event.type, from: current.value, to: next.value });
      }
      return next;
    });
  }, [debugMode]);

  /* Mechanic M1: a case, once open, survives anything the user does —
     including closing the tab. Without this restore, "you cannot fail
     halfway" is only true until the page reloads. */
  useEffect(() => {
    const snapshot = readSnapshot();
    if (snapshot?.case?.openedAt) send({ type: "RESTORE_CASE", snapshot });
  }, [send]);

  useEffect(() => {
    if (!machine.case.openedAt) return;
    try {
      localStorage.setItem(SNAPSHOT_KEY, serializeSnapshot(machine));
    } catch {
      /* Storage full or blocked — the in-memory case is still intact. */
    }
  }, [machine]);

  useEffect(() => {
    setSpeechEnabled(speechOn);
  }, [speechOn]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCALE_KEY, locale);
    } catch {
      /* Locale preference is a convenience, not state worth failing over. */
    }
  }, [locale]);

  const caseOpen = Boolean(machine.case.openedAt);
  const step = STEP_FOR_STATE[machine.value];
  /* Calm mode is deliberately unhurried: no countdown, no progress rail.
     Showing a clock over the deferred paperwork would contradict the one
     thing this screen exists to demonstrate — that none of it was urgent. */
  const showClock = caseOpen && machine.value !== ROK_STATES.CALM_MODE;

  const toggleSpeech = () => {
    const next = !speechOn;
    setSpeechOn(next);
    if (next) announce(t("app.speech_on"), { locale, speak: true });
  };

  const screenProps = { send, t, locale, caseData: machine.case, speechOn };

  if (showRace) {
    return (
      <div className="rok-app">
        <RaceView t={t} onBack={() => setShowRace(false)} />
      </div>
    );
  }

  return (
    <div className="rok-app">
      <a className="rok-skip" href="#rok-main">{t("app.skip_to_content")}</a>

      <p className="rok-otp-banner">
        <Icon name="shield" size={16} />
        <span>{t("neverAsk.otp_banner")}</span>
      </p>

      <header className="rok-appbar">
        <span className="rok-appbar__brand">
          <span>Rok</span>
          <span lang="hi">रोक</span>
        </span>

        <div className="rok-appbar__tools">
          {showClock && (
            <GoldenHourClock openedAt={machine.case.openedAt} label={t("app.clock_label")} />
          )}

          <label className="rok-sr-only" htmlFor="rok-locale">{t("app.language")}</label>
          <select
            className="rok-lang"
            id="rok-locale"
            value={locale}
            onChange={(event) => setLocale(event.target.value)}
          >
            <option value="en">English</option>
            <option value="ta">தமிழ்</option>
          </select>

          <button
            className="rok-icon-btn"
            type="button"
            aria-pressed={speechOn}
            aria-label={speechOn ? t("app.speech_disable") : t("app.speech_enable")}
            onClick={toggleSpeech}
          >
            <Icon name={speechOn ? "speaker" : "speakerOff"} size={20} />
          </button>

          {caseOpen && machine.value !== ROK_STATES.GUARDIAN_HANDOFF && (
            <button
              className="rok-icon-btn"
              type="button"
              aria-label={t("guardianHandoff.title")}
              onClick={() => send({ type: "OPEN_GUARDIAN_HANDOFF" })}
            >
              <Icon name="people" size={20} />
            </button>
          )}
        </div>
      </header>

      {step !== undefined && machine.value !== ROK_STATES.CALM_MODE && (
        <ProgressRail step={step} label={t("app.progress_label", { step: step + 1 })} />
      )}

      {debugMode && (
        <p className="rok-debug-state">{t("app.current_state", { state: machine.value })}</p>
      )}

      <main className="rok-main" id="rok-main">
        <Screen machine={machine} screenProps={screenProps} debugMode={debugMode} />
      </main>

      <footer className="rok-footer">
        <button className="rok-btn rok-btn--ghost" type="button" onClick={() => setShowRace(true)}>
          {t("raceView.title")}
        </button>
        <p>{t("footer.not_official")}</p>
      </footer>
    </div>
  );
}

function Screen({ machine, screenProps, debugMode }) {
  switch (machine.value) {
    case ROK_STATES.IDLE:
      return <Palm {...screenProps} />;
    case ROK_STATES.SAFETY_TRIAGE:
      return <SafetyTriage {...screenProps} />;
    case ROK_STATES.SAFETY_HANGUP_SCRIPT:
      return <SafetyTriage {...screenProps} isHangupScript />;
    case ROK_STATES.MESSAGE_WALL:
      return <MessageWall {...screenProps} />;
    case ROK_STATES.SCOPE:
      return <Scope {...screenProps} />;
    case ROK_STATES.REACHED_VIA:
      return <ReachedVia {...screenProps} debugMode={debugMode} />;
    case ROK_STATES.READ_BACK:
      return <ReadBack {...screenProps} />;
    case ROK_STATES.CASE_COMPLETE:
      return <CaseComplete {...screenProps} />;
    case ROK_STATES.CALM_MODE:
      return <CalmMode {...screenProps} />;
    case ROK_STATES.GUARDIAN_HANDOFF:
      return <GuardianHandoff {...screenProps} />;
    default:
      /* Unreachable by construction: the reducer only ever produces the
         states above. Rendering the Palm is a safe landing rather than a
         blank page if that ever stops being true. */
      return <Palm {...screenProps} />;
  }
}

export { isCaseComplete };
