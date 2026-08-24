import { useEffect, useMemo, useState } from "react";
import { useT } from "./i18n/useT.js";
import { createInitialMachineState, rokReducer, ROK_STATES } from "./state/machine.js";
import CaseComplete from "./screens/CaseComplete.jsx";
import MessageWall from "./screens/MessageWall.jsx";
import Palm from "./screens/Palm.jsx";
import ReachedVia from "./screens/ReachedVia.jsx";
import ReadBack from "./screens/ReadBack.jsx";
import SafetyTriage from "./screens/SafetyTriage.jsx";
import Scope from "./screens/Scope.jsx";

function screenFor(machine, send) {
  switch (machine.value) {
    case ROK_STATES.IDLE: return <Palm send={send} />;
    case ROK_STATES.SAFETY_TRIAGE: return <SafetyTriage send={send} />;
    case ROK_STATES.SAFETY_HANGUP_SCRIPT: return <SafetyTriage isHangupScript send={send} />;
    case ROK_STATES.MESSAGE_WALL: return <MessageWall send={send} />;
    case ROK_STATES.SCOPE: return <Scope send={send} />;
    case ROK_STATES.REACHED_VIA: return <ReachedVia send={send} />;
    case ROK_STATES.READ_BACK: return <ReadBack caseData={machine.case} send={send} />;
    case ROK_STATES.CASE_COMPLETE: return <CaseComplete caseData={machine.case} send={send} />;
    default: return null;
  }
}

export default function App() {
  const [machine, setMachine] = useState(createInitialMachineState);
  const t = useT();
  const debugMode = useMemo(() => new URLSearchParams(window.location.search).has("debug"), []);
  const send = (event) => {
    setMachine((current) => {
      const next = rokReducer(current, event);
      console.info("[Rok machine]", { event: event.type, from: current.value, to: next.value, caseId: next.case.id });
      return next;
    });
  };

  useEffect(() => {
    if (machine.case.openedAt) localStorage.setItem(`rok:case:${machine.case.id}`, JSON.stringify(machine.case));
  }, [machine]);

  return (
    <main className="rok-app">
      <p className="rok-otp-banner">{t("neverAsk.otp_banner")}</p>
      {debugMode && <p className="rok-debug-state">{t("app.current_state", { state: machine.value })}</p>}
      {screenFor(machine, send)}
      <footer className="rok-footer"><p>{t("footer.not_official")}</p></footer>
    </main>
  );
}
