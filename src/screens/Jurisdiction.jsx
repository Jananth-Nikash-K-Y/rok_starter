import { useEffect, useState } from "react";
import Choice from "../components/Choice.jsx";
import Screen from "../components/Screen.jsx";
import { detectStateUt, STATES_UT } from "../engines/jurisdiction.js";
import "./Jurisdiction.css";

/**
 * Step 3, second half — which police force gets this.
 *
 * NCRP makes the complainant responsible for their own jurisdictional
 * routing, from a list of 36, while they are panicking. Rok cannot remove
 * the field — it is mandatory and it decides who investigates — but it can
 * turn a search through 36 options into one tap, using the device's own
 * location to shortlist the likely ones.
 *
 * Location is asked for, never required: declining, or having no fix, drops
 * straight to the full list. Nothing waits on a permission dialog.
 */
export default function Jurisdiction({ send, t, locale }) {
  const [candidates, setCandidates] = useState([]);
  const [locating, setLocating] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    /* Only offered if the browser has geolocation at all. */
    if (typeof navigator === "undefined" || !navigator.geolocation) setShowAll(true);
  }, []);

  const locate = async () => {
    setLocating(true);
    const found = await detectStateUt();
    setLocating(false);
    if (found.length === 0) setShowAll(true);
    else setCandidates(found);
  };

  const confirm = (stateUt) => send({ type: "CONFIRM_JURISDICTION", stateUt });

  return (
    <Screen
      t={t}
      locale={locale}
      question={t("jurisdiction.question")}
      spokenKey="jurisdiction.question"
      why={t("jurisdiction.why")}
    >
      {candidates.length > 0 && (
        <div className="rok-choice-grid">
          {candidates.map((candidate) => (
            <Choice
              key={candidate.name}
              icon="location"
              tone="affirm"
              label={candidate.name}
              onClick={() => confirm(candidate.name)}
            />
          ))}
        </div>
      )}

      {candidates.length === 0 && !showAll && (
        <div className="jurisdiction__locate">
          <button
            className="rok-btn rok-btn--primary rok-btn--block rok-btn--lg"
            type="button"
            disabled={locating}
            onClick={locate}
            lang={locale}
          >
            {locating ? t("jurisdiction.locating") : t("jurisdiction.use_location")}
          </button>
          <p className="jurisdiction__privacy" lang={locale}>{t("jurisdiction.privacy")}</p>
        </div>
      )}

      <button
        className="jurisdiction__toggle"
        type="button"
        lang={locale}
        onClick={() => setShowAll((value) => !value)}
      >
        {showAll ? t("jurisdiction.hide_list") : t("jurisdiction.show_list")}
      </button>

      {showAll && (
        <ul className="jurisdiction__list">
          {STATES_UT.map((entry) => (
            <li key={entry.name}>
              <button type="button" onClick={() => confirm(entry.name)}>
                {entry.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Screen>
  );
}
