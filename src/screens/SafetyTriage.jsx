import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import Choice from "../components/Choice.jsx";
import Icon from "../components/Icon.jsx";
import { announce } from "../engines/a11yBus.js";
import "./SafetyTriage.css";

/**
 * Screen 2 — Safety Triage (mechanic M5).
 *
 * Asked before anything about money, because a victim still on the call is
 * still being robbed. Digital-arrest fraud works by keeping the person on a
 * continuous line under instructions to tell nobody; this screen is the one
 * place a government front door can interrupt that, so it comes first.
 */
export default function SafetyTriage({ send, t, locale, isHangupScript = false }) {
  const [shareFailed, setShareFailed] = useState(false);

  useEffect(() => {
    announce(t(isHangupScript ? "safetyTriage.hangup_instruction" : "safetyTriage.question"), { locale });
  }, [t, locale, isHangupScript]);

  const alertContact = async () => {
    const message = t("safetyTriage.share_text");
    try {
      if (navigator.share) {
        await navigator.share({ title: t("safetyTriage.alert_contact"), text: message });
        return;
      }
      await navigator.clipboard.writeText(message);
      setShareFailed(true);
    } catch {
      /* The user dismissed the share sheet, or neither API is available.
         Either way the message stays on screen to read out or copy. */
      setShareFailed(true);
    }
  };

  if (isHangupScript) {
    return (
      <section className="rok-container rok-screen triage">
        <div className="triage__alarm">
          <Icon name="phoneOff" size={40} />
        </div>

        <h1 className="rok-question" lang={locale}>{t("safetyTriage.hangup_instruction")}</h1>

        <ol className="triage__script">
          <li lang={locale}>{t("safetyTriage.step_hangup")}</li>
          <li lang={locale}>{t("safetyTriage.step_silence")}</li>
          <li lang={locale}>{t("safetyTriage.step_nothing")}</li>
        </ol>

        <div className="rok-why">
          <Icon name="shield" size={18} />
          <span lang={locale}>{t("safetyTriage.why_hangup")}</span>
        </div>

        <div className="triage__actions">
          <Button variant="quiet" icon="people" block onClick={alertContact}>
            {t("safetyTriage.alert_contact")}
          </Button>
          <Button variant="primary" iconAfter="arrowRight" block onClick={() => send({ type: "HANGUP_DONE" })}>
            {t("safetyTriage.continue_after_hangup")}
          </Button>
        </div>

        {shareFailed && (
          <p className="triage__share-fallback" lang={locale} role="status">
            {t("safetyTriage.share_fallback")}
          </p>
        )}
      </section>
    );
  }

  return (
    <section className="rok-container rok-screen triage">
      <p className="rok-eyebrow">
        <Icon name="shield" size={14} />
        {t("safetyTriage.eyebrow")}
      </p>

      <h1 className="rok-question" lang={locale}>{t("safetyTriage.question")}</h1>
      <p className="rok-support" lang={locale}>{t("safetyTriage.support")}</p>

      <div className="rok-choice-grid">
        <Choice
          icon="phone"
          tone="danger"
          lang={locale}
          label={t("safetyTriage.yes")}
          onClick={() => send({ type: "STILL_ON_CALL_YES" })}
        />
        <Choice
          icon="phoneOff"
          tone="affirm"
          lang={locale}
          label={t("safetyTriage.no")}
          onClick={() => send({ type: "STILL_ON_CALL_NO" })}
        />
      </div>

      <div className="rok-why">
        <Icon name="clock" size={18} />
        <span lang={locale}>{t("safetyTriage.why")}</span>
      </div>
    </section>
  );
}
