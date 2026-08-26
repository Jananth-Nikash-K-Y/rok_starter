import { useEffect, useRef, useState } from "react";
import Icon from "../components/Icon.jsx";
import { DEMO_ACCESS, checkDemoAccess } from "../config/demoAccess.js";
import "./EvaluatorGate.css";

/**
 * The evaluator's door. A citizen never arrives here.
 *
 * This used to gate the product, which quietly contradicted the whole
 * argument: a victim was asked to sign in before they could report a
 * theft. Now the citizen experience is the landing page and this screen is
 * optional, reached from a small link in the footer.
 *
 * The credentials therefore *grant* something instead of *blocking*
 * something — they turn on the reviewer tools: the inferred NCRP taxonomy
 * ribbon and the side-by-side Race. Evaluators still experience the
 * platform using the supplied credentials, which is what the submission
 * asks for, and nobody in a crisis meets a login.
 *
 * Not authentication — see src/config/demoAccess.js.
 */
export default function EvaluatorGate({ onUnlock, onSkip, t, locale }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [failed, setFailed] = useState(false);
  const heading = useRef(null);

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, []);

  const submit = (event) => {
    event.preventDefault();
    if (checkDemoAccess(username, password)) {
      onUnlock();
      return;
    }
    setFailed(true);
  };

  return (
    <section className="rok-container gate">
      <div className="gate__mark" aria-hidden="true">
        <Icon name="shield" size={40} />
      </div>

      <h1 className="gate__title" ref={heading} tabIndex={-1} lang={locale}>
        {t("gate.title")}
      </h1>
      <p className="gate__badge">{t("gate.badge")}</p>
      <p className="gate__lede" lang={locale}>{t("gate.lede")}</p>

      <form className="gate__form" onSubmit={submit}>
        <label className="gate__field">
          <span>{t("gate.username")}</span>
          <input
            name="username"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck="false"
            value={username}
            onChange={(event) => { setUsername(event.target.value); setFailed(false); }}
          />
        </label>

        <label className="gate__field">
          <span>{t("gate.password")}</span>
          <input
            name="password"
            type="password"
            autoComplete="off"
            value={password}
            onChange={(event) => { setPassword(event.target.value); setFailed(false); }}
          />
        </label>

        {failed && (
          <p className="gate__error" role="alert" lang={locale}>
            <Icon name="alert" size={18} />
            {t("gate.wrong")}
          </p>
        )}

        <button className="rok-btn rok-btn--primary rok-btn--block rok-btn--lg" type="submit">
          {t("gate.enter")}
        </button>

        {/* Nobody is trapped here. */}
        <button className="rok-btn rok-btn--ghost rok-btn--block" type="button" onClick={onSkip}>
          {t("gate.skip")}
        </button>
      </form>

      {/* The credentials are printed here on purpose: this is a public demo
          and an evaluator should never have to hunt for them. */}
      <p className="gate__creds">
        <Icon name="document" size={16} />
        <span>
          {t("gate.credentials")}
          <code>{DEMO_ACCESS.username}</code>
          <code>{DEMO_ACCESS.password}</code>
        </span>
      </p>

      <div className="gate__contrast">
        <div className="gate__column gate__column--ncrp">
          <h2>{t("gate.ncrp_asks")}</h2>
          <ul>
            <li><Icon name="cross" size={16} />{t("gate.ncrp_1")}</li>
            <li><Icon name="cross" size={16} />{t("gate.ncrp_2")}</li>
            <li><Icon name="cross" size={16} />{t("gate.ncrp_3")}</li>
            <li><Icon name="cross" size={16} />{t("gate.ncrp_4")}</li>
          </ul>
        </div>

        <div className="gate__column gate__column--rok">
          <h2>{t("gate.rok_asks")}</h2>
          <p className="gate__nothing">{t("gate.nothing")}</p>
          <p className="gate__nothing-note">{t("gate.nothing_note")}</p>
        </div>
      </div>

      <p className="gate__disclaimer" lang={locale}>{t("gate.disclaimer")}</p>
    </section>
  );
}
