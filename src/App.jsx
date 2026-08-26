import { useCallback, useEffect, useMemo, useState } from "react";
import { useT } from "./i18n/useT.js";
import {
  caseReferenceFrom,
  createInitialMachineState,
  isCaseComplete,
  rokReducer,
  ROK_STATES,
} from "./state/machine.js";
import { announce, setSpeechEnabled } from "./engines/a11yBus.js";
import { detectLocale, rememberLocale } from "./i18n/detect.js";
import { localeMeta } from "./i18n/locales.js";
import AccessibilityMenu from "./components/AccessibilityMenu.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import GoldenHourClock from "./components/GoldenHourClock.jsx";
import Icon from "./components/Icon.jsx";
import LanguagePicker from "./components/LanguagePicker.jsx";
import Logo from "./components/Logo.jsx";
import ProgressRail from "./components/ProgressRail.jsx";
import CalmMode from "./screens/CalmMode.jsx";
import CaseComplete from "./screens/CaseComplete.jsx";
import EvaluatorGate from "./screens/EvaluatorGate.jsx";
import GuardianHandoff from "./screens/GuardianHandoff.jsx";
import Jurisdiction from "./screens/Jurisdiction.jsx";
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
/* Session, not local: an evaluator signs in once per visit, and a fresh
   visitor always sees the contrast the gate is there to make. */
const UNLOCK_KEY = "rok:evaluator";

/** Which of the four freeze-relevant questions the user is on. */
const STEP_FOR_STATE = {
  [ROK_STATES.MESSAGE_WALL]: 0,
  [ROK_STATES.SCOPE]: 1,
  [ROK_STATES.REACHED_VIA]: 2,
  [ROK_STATES.JURISDICTION]: 2,
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
  /* Guess the language before asking for it — a fraud victim should not
     have to find a menu in a script they cannot read. The guess is always
     visible and always changeable. */
  const [detected] = useState(detectLocale);
  const [locale, setLocale] = useState(detected.locale);
  const [speechOn, setSpeechOn] = useState(false);
  /* Reviewer tools on/off. Nothing is gated by this — it only adds the
     taxonomy ribbon and the Race for someone evaluating the project. */
  const [reviewer, setReviewer] = useState(() => {
    try {
      return sessionStorage.getItem(UNLOCK_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [showGate, setShowGate] = useState(false);
  /* Shown once when the language was guessed rather than chosen, so the
     user knows it is a guess and knows it can be corrected. */
  const [languageHintOpen, setLanguageHintOpen] = useState(
    detected.source === "browser" || detected.source === "region",
  );
  const [showRace, setShowRace] = useState(false);
  const t = useT(locale);

  const queryDebug = useMemo(
    () => new URLSearchParams(window.location.search).has("debug"),
    [],
  );
  /* Signing in is what turns these on. ?debug=1 still works for local
     development. */
  const debugMode = queryDebug || reviewer;

  const send = useCallback((event) => {
    if (event.type === "RESET_CASE") {
      try {
        localStorage.removeItem(SNAPSHOT_KEY);
      } catch {
        /* Nothing to clear, or storage is blocked. */
      }
    }
    setMachine((current) => {
      const next = rokReducer(current, event);
      if (debugMode) {
        console.info("[Rok machine]", { event: event.type, from: current.value, to: next.value });
      }
      return next;
    });
  }, [debugMode]);

  /* Mechanic M1: a case, once open, survives anything the user does —
     including closing the tab.
     It is offered rather than forced: a returning user lands on the same
     opening screen everyone else sees, with "continue" as a second button.
     Restoring silently would drop someone back into question three with no
     idea why. */
  const [savedSnapshot, setSavedSnapshot] = useState(null);

  useEffect(() => {
    const snapshot = readSnapshot();
    if (snapshot?.case?.openedAt) setSavedSnapshot(snapshot);
  }, []);

  const resumeSavedCase = () => {
    if (!savedSnapshot) return;
    send({ type: "RESTORE_CASE", snapshot: savedSnapshot });
    setSavedSnapshot(null);
  };

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
    document.documentElement.lang = locale;
  }, [locale]);

  const chooseLocale = (code) => {
    setLocale(code);
    rememberLocale(code);
    setLanguageHintOpen(false);
  };

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

  const enableSpeech = () => {
    if (!speechOn) setSpeechOn(true);
  };

  const unlock = () => {
    try {
      sessionStorage.setItem(UNLOCK_KEY, "1");
    } catch {
      /* Private browsing — reviewer tools simply reset on reload. */
    }
    setReviewer(true);
    setShowGate(false);
  };

  const screenProps = {
    send, t, locale, caseData: machine.case, speechOn, onEnableSpeech: enableSpeech,
    savedCase: savedSnapshot ? caseReferenceFrom(savedSnapshot.case.id) : null,
    onResume: resumeSavedCase,
  };

  /* Shown only when someone opens it from the footer. */
  if (showGate) {
    return (
      <div className="rok-app">
        <p className="rok-otp-banner">
          <Icon name="shield" size={16} />
          <span>{t("neverAsk.otp_banner")}</span>
        </p>

        <header className="rok-appbar">
          <span className="rok-appbar__brand">
            <Logo size={30} className="rok-appbar__logo" title="Rok" />
            <span className="rok-appbar__word">Rok</span>
            <span className="rok-appbar__native" lang="hi">रोक</span>
          </span>
          <div className="rok-appbar__tools">
            <LanguagePicker locale={locale} onChange={chooseLocale} t={t} />
            <AccessibilityMenu t={t} />
          </div>
        </header>

        <main className="rok-main" id="rok-main">
          <ErrorBoundary t={t}>
            <EvaluatorGate onUnlock={unlock} onSkip={() => setShowGate(false)} t={t} locale={locale} />
          </ErrorBoundary>
        </main>

        <footer className="rok-footer">
          <p>{t("footer.not_official")}</p>
        </footer>
      </div>
    );
  }

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
          <Logo size={30} className="rok-appbar__logo" title="Rok" />
          <span className="rok-appbar__word">Rok</span>
          <span className="rok-appbar__native" lang="hi">रोक</span>
        </span>

        <div className="rok-appbar__tools">
          {showClock && (
            <GoldenHourClock openedAt={machine.case.openedAt} label={t("app.clock_label")} />
          )}

          <LanguagePicker locale={locale} onChange={chooseLocale} t={t} />

          <AccessibilityMenu t={t} />

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
        <ProgressRail
          step={step}
          label={t("app.progress_label", { step: String(step + 1) })}
          remaining={
            step >= 4
              ? t("app.progress_done")
              : t("app.progress_label", { step: String(step + 1) })
          }
        />
      )}

      {languageHintOpen && (
        <p className="rok-lang-hint" role="status">
          <Icon name="globe" size={18} />
          <span lang={locale}>
            {t("app.language_detected", { language: localeMeta(locale).native })}
          </span>
          <button type="button" onClick={() => setLanguageHintOpen(false)}>
            {t("app.language_ok")}
          </button>
        </p>
      )}

      {debugMode && (
        <p className="rok-debug-state">{t("app.current_state", { state: machine.value })}</p>
      )}

      <main className="rok-main" id="rok-main">
        <ErrorBoundary t={t}>
          <Screen machine={machine} screenProps={screenProps} debugMode={debugMode} />
        </ErrorBoundary>
      </main>

      <footer className="rok-footer">
        {/* Reviewer entrances live down here, out of a citizen's way. */}
        {reviewer && (
          <button className="rok-btn rok-btn--ghost" type="button" onClick={() => setShowRace(true)}>
            {t("raceView.title")}
          </button>
        )}
        {!reviewer && (
          <button className="rok-btn rok-btn--ghost" type="button" onClick={() => setShowGate(true)}>
            {t("gate.footer_link")}
          </button>
        )}
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
    case ROK_STATES.JURISDICTION:
      return <Jurisdiction {...screenProps} />;
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
