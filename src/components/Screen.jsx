import { useEffect, useRef } from "react";
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
  why,
  spokenKey,
  tone = "neutral",
  split = true,
  t,
  locale,
  children,
  footer,
}) {
  const announcement = spoken ?? question;
  const heading = useRef(null);

  useEffect(() => {
    announce(announcement, { locale, key: spokenKey });
  }, [announcement, locale, spokenKey]);

  /* Move focus to the new screen's heading on every transition.
     Without this, focus falls back to <body> each time the screen changes:
     a keyboard user has to tab past the whole header again on all eight
     steps, and a screen reader user is left with focus nowhere. Moving it
     here means the question is read, and the next Tab lands on the first
     answer. */
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [question]);

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
      {/* The numbered strip under the masthead already states the step, so
          repeating it here was two answers to the same question. */}
      <header className="screen__head">
        <h1 className="screen__question" lang={locale} ref={heading} tabIndex={-1}>
          {question}
        </h1>

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
