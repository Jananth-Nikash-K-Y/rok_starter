import { useEffect } from "react";
import Icon from "./Icon.jsx";
import ListenButton from "./ListenButton.jsx";
import { announce, replayLastAnnouncement } from "../engines/a11yBus.js";

/**
 * The frame every question screen shares.
 *
 * Consistency is an accessibility feature here, not a style preference: the
 * question, the Listen button and the step count sit in the same place on
 * every screen, so a user who cannot read learns one layout instead of
 * seven. It also announces on mount centrally, so no screen can forget to.
 */
export default function Screen({
  question,
  spoken,
  step,
  totalSteps = 4,
  why,
  tone = "neutral",
  split = true,
  t,
  locale,
  children,
  footer,
}) {
  const announcement = spoken ?? question;

  useEffect(() => {
    announce(announcement, { locale });
  }, [announcement, locale]);

  return (
    <section
      className={[
        "rok-container",
        "screen",
        `screen--${tone}`,
        /* Above 1024px the question sits beside its answers instead of
           above them, so the eye travels once instead of scrolling. */
        split ? "screen--split" : "",
      ].filter(Boolean).join(" ")}
    >
      <header className="screen__head">
        {step !== undefined && (
          <p className="screen__step">
            <span className="screen__step-count">{step}</span>
            <span className="screen__step-of">/ {totalSteps}</span>
          </p>
        )}

        <h1 className="screen__question" lang={locale}>{question}</h1>

        <ListenButton
          t={t}
          locale={locale}
          onListen={() => replayLastAnnouncement()}
        />
      </header>

      <div className="screen__body">{children}</div>

      {why && (
        <p className="screen__why" lang={locale}>
          <Icon name="shield" size={18} />
          <span>{why}</span>
        </p>
      )}

      {footer}
    </section>
  );
}
