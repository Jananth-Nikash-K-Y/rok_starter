import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import Icon from "../components/Icon.jsx";
import { announce } from "../engines/a11yBus.js";
import { buildGuardianHandoffCode, retrieveHandoffCase } from "../engines/outputs.js";
import "./GuardianHandoff.css";

/**
 * Screen 8 — Guardian handoff (mechanic M6).
 *
 * The portal silently assumes the person typing is the person robbed. Here
 * a helper is the normal case, not an edge case — and the victim stays the
 * owner of the case throughout.
 *
 * Scope note, stated on screen as well as here: this build stores the case
 * under a code in localStorage, so it continues on THIS device and browser
 * only. Real cross-device handoff needs a relay, and AGENTS.md records the
 * deliberate decision not to build a backend for this submission. The copy
 * must never imply otherwise.
 */
export default function GuardianHandoff({ send, t, locale, caseData }) {
  const [code, setCode] = useState(null);
  const [entered, setEntered] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    announce(t("guardianHandoff.title"), { locale });
  }, [t, locale]);

  const generate = () => {
    setCode(buildGuardianHandoffCode(caseData));
  };

  const join = (event) => {
    event.preventDefault();
    const found = retrieveHandoffCase(entered.trim());
    if (!found) {
      setError(true);
      return;
    }
    setError(false);
    send({ type: "RESTORE_CASE", snapshot: { value: "CASE_COMPLETE", case: found } });
  };

  return (
    <section className="rok-container rok-screen guardian">

      <h1 className="rok-question" lang={locale}>{t("guardianHandoff.title")}</h1>
      <p className="rok-support" lang={locale}>{t("guardianHandoff.support")}</p>

      <div className="guardian__panel">
        <h2 className="rok-card__title">{t("guardianHandoff.your_code")}</h2>
        {code ? (
          <>
            <p className="guardian__code">{code}</p>
            <p className="guardian__instruction" lang={locale}>
              {t("guardianHandoff.instruction")}
            </p>
          </>
        ) : (
          <Button variant="primary" icon="people" block onClick={generate}>
            {t("guardianHandoff.generate_button")}
          </Button>
        )}
      </div>

      <form className="guardian__panel" onSubmit={join}>
        <h2 className="rok-card__title">{t("guardianHandoff.enter_code")}</h2>
        <label className="guardian__field">
          <span className="rok-sr-only">{t("guardianHandoff.code_label")}</span>
          <input
            value={entered}
            onChange={(event) => { setEntered(event.target.value.toUpperCase()); setError(false); }}
            placeholder="ABC123"
            autoComplete="off"
            spellCheck="false"
          />
        </label>
        <Button variant="quiet" icon="arrowRight" type="submit" block>
          {t("guardianHandoff.join_button")}
        </Button>
        {error && (
          <p className="guardian__error" role="alert" lang={locale}>
            <Icon name="alert" size={16} />
            {t("guardianHandoff.not_found")}
          </p>
        )}
      </form>

      <div className="rok-why">
        <Icon name="shield" size={18} />
        <span lang={locale}>{t("guardianHandoff.scope_note")}</span>
      </div>

      <Button variant="ghost" icon="arrowLeft" onClick={() => send({ type: "CLOSE_GUARDIAN_HANDOFF" })}>
        {t("guardianHandoff.back")}
      </Button>
    </section>
  );
}
