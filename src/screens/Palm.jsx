import { useEffect, useState } from "react";
import Icon from "../components/Icon.jsx";
import { announce, replayLastAnnouncement } from "../engines/a11yBus.js";
import { canSpeak, whenVoicesReady } from "../engines/speech.js";
import "./Palm.css";

/**
 * Screen 1 — the Palm.
 *
 * One target, comprehensible without reading. Tapping it opens and
 * timestamps the case before a single question is asked (mechanic M1).
 *
 * The Listen control sits beside it rather than in a menu, because this is
 * where a user who cannot read the screen has to be able to turn audio on.
 * Nothing speaks until they press it — which satisfies GIGW's no-autoplay
 * rule and the accessibility need with the same control.
 */
export default function Palm({ send, t, locale, speechOn, onEnableSpeech }) {
  const [voiceAvailable, setVoiceAvailable] = useState(true);

  useEffect(() => {
    announce(t("palm.spoken"), { locale });
  }, [t, locale]);

  useEffect(() => {
    let active = true;
    whenVoicesReady().then(() => {
      if (active) setVoiceAvailable(canSpeak(locale));
    });
    return () => { active = false; };
  }, [locale]);

  const listen = () => {
    if (!speechOn) onEnableSpeech();
    replayLastAnnouncement();
  };

  return (
    <section className="rok-container palm">
      <div className="palm__mark" aria-hidden="true">
        <Icon name="palm" size={64} />
      </div>

      <h1 className="palm__title" lang={locale}>{t("palm.caption")}</h1>

      <button
        className="palm__button"
        type="button"
        onClick={() => send({ type: "OPEN_CASE" })}
      >
        <span className="palm__button-label" lang={locale}>{t("palm.action")}</span>
        <span className="palm__button-hint" lang={locale}>{t("palm.action_hint")}</span>
      </button>

      <button className="palm__listen" type="button" onClick={listen} lang={locale}>
        <span className="palm__listen-icon"><Icon name="speaker" size={26} /></span>
        <span>{t("palm.listen")}</span>
      </button>

      {!voiceAvailable && (
        <p className="palm__no-voice" lang={locale} role="status">
          {t("palm.no_voice")}
        </p>
      )}

      <ul className="palm__promises">
        <li>
          <Icon name="clock" size={20} />
          <span lang={locale}>{t("palm.promise_time")}</span>
        </li>
        <li>
          <Icon name="shield" size={20} />
          <span lang={locale}>{t("palm.promise_otp")}</span>
        </li>
        <li>
          <Icon name="document" size={20} />
          <span lang={locale}>{t("palm.promise_typing")}</span>
        </li>
      </ul>
    </section>
  );
}
