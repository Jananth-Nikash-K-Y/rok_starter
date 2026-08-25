import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import Choice from "../components/Choice.jsx";
import Icon from "../components/Icon.jsx";
import Screen from "../components/Screen.jsx";
import { announce, replayLastAnnouncement } from "../engines/a11yBus.js";
import ListenButton from "../components/ListenButton.jsx";
import "./SafetyTriage.css";

/**
 * Screen 2 — Safety Triage (mechanic M5).
 *
 * Asked before anything about money, because a victim still on the call is
 * still being robbed. Two answers, each a large icon with a one-word label.
 */
export default function SafetyTriage({ send, t, locale, isHangupScript = false }) {
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (isHangupScript) announce(t("safetyTriage.hangup_spoken"), { locale });
  }, [t, locale, isHangupScript]);

  const alertContact = async () => {
    const message = t("safetyTriage.share_text");
    try {
      if (navigator.share) {
        await navigator.share({ title: t("safetyTriage.alert_contact"), text: message });
        return;
      }
      await navigator.clipboard.writeText(message);
      setShared(true);
    } catch {
      setShared(true);
    }
  };

  if (isHangupScript) {
    return (
      <section className="rok-container screen triage">
        <div className="triage__alarm" aria-hidden="true">
          <Icon name="phoneOff" size={44} />
        </div>

        <h1 className="triage__shout" lang={locale}>{t("safetyTriage.hangup_instruction")}</h1>

        <ListenButton t={t} locale={locale} onListen={() => replayLastAnnouncement()} />

        <ol className="triage__script">
          <li lang={locale}>
            <Icon name="phoneOff" size={26} />
            <span>{t("safetyTriage.step_hangup")}</span>
          </li>
          <li lang={locale}>
            <Icon name="shield" size={26} />
            <span>{t("safetyTriage.step_silence")}</span>
          </li>
          <li lang={locale}>
            <Icon name="cross" size={26} />
            <span>{t("safetyTriage.step_nothing")}</span>
          </li>
        </ol>

        <div className="triage__actions">
          <Button variant="quiet" icon="people" block onClick={alertContact}>
            {t("safetyTriage.alert_contact")}
          </Button>
          <Button variant="primary" iconAfter="arrowRight" block onClick={() => send({ type: "HANGUP_DONE" })}>
            {t("safetyTriage.continue_after_hangup")}
          </Button>
        </div>

        {shared && (
          <p className="triage__share-fallback" lang={locale} role="status">
            {t("safetyTriage.share_fallback")}
          </p>
        )}
      </section>
    );
  }

  return (
    <Screen
      step={1}
      tone="neutral"
      t={t}
      locale={locale}
      question={t("safetyTriage.question")}
      why={t("safetyTriage.why")}
    >
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
    </Screen>
  );
}
