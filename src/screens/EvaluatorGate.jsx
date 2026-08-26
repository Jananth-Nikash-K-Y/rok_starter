import { useEffect, useRef, useState } from "react";
import Icon from "../components/Icon.jsx";
import { DEMO_ACCESS, checkDemoAccess } from "../config/demoAccess.js";
import "./EvaluatorGate.css";

/**
 * The one screen a citizen never sees.
 *
 * The submission asks for credentials; Rok's thesis is that asking a fraud
 * victim to register is what costs them their money. Rather than pretend
 * those two things are compatible, this screen states the tension outright
 * and uses it: an evaluator signs in once, reads what NCRP demands before a
 * complaint can even begin, and is then dropped into a flow that asks for
 * none of it. The contrast is the first beat of the pitch.
 *
 * Not authentication — see src/config/demoAccess.js.
 */
export default function EvaluatorGate({ onUnlock, t, locale }) {
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
