import { useEffect, useState } from "react";
import Icon from "../components/Icon.jsx";
import Logo from "../components/Logo.jsx";
import { announce, replayLastAnnouncement } from "../engines/a11yBus.js";
import { canListen, canSpeak, listenOnce, whenVoicesReady } from "../engines/speech.js";
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
export default function Palm({ send, t, locale, speechOn, onEnableSpeech, savedCase, onResume }) {
  const [voiceAvailable, setVoiceAvailable] = useState(true);
  const [listening, setListening] = useState(false);
  const [heardNothing, setHeardNothing] = useState(false);

  useEffect(() => {
    announce(t("palm.spoken"), { locale, key: "palm.spoken" });
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

  /* The spoken entry point. Anything heard opens the case — see the note
     on listenOnce for why this does not try to understand the words. */
  const speakToStart = async () => {
    setHeardNothing(false);
    setListening(true);
    try {
      await listenOnce(locale);
      send({ type: "OPEN_CASE" });
    } catch {
      setHeardNothing(true);
    } finally {
      setListening(false);
    }
  };

  return (
    <section className="rok-container palm">
      <div className="palm__mark" aria-hidden="true">
        <Logo size={88} />
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

      {/* Appears only when a case really is on this device. No code, no
          password, nothing to remember — the phone already knows. There is
          no server, so there is nothing to "log in" to and no honest way to
          offer this on a different device. */}
      {savedCase && (
        <button className="palm__resume" type="button" onClick={onResume} lang={locale}>
          <Icon name="document" size={22} />
          <span>
            <span className="palm__resume-title">{t("palm.resume")}</span>
            <span className="palm__resume-note">
              {t("palm.resume_note", { reference: savedCase })}
            </span>
          </span>
        </button>
      )}

      <button className="palm__listen" type="button" onClick={listen} lang={locale}>
        <span className="palm__listen-icon"><Icon name="speaker" size={26} /></span>
        <span>{t("palm.listen")}</span>
      </button>

      {canListen() && (
        <button
          className="palm__mic"
          type="button"
          onClick={speakToStart}
          disabled={listening}
          lang={locale}
        >
          <Icon name="mic" size={22} />
          <span>{listening ? t("palm.listening") : t("palm.speak_to_start")}</span>
        </button>
      )}

      {heardNothing && (
        <p className="palm__no-voice" role="status" lang={locale}>{t("palm.heard_nothing")}</p>
      )}

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
