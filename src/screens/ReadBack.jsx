/* eslint-disable react/prop-types */
import { useEffect, useMemo } from "react";
import { announce } from "../engines/a11yBus.js";
import { composeReadBackSentences } from "../engines/narrative.js";
import { useT } from "../i18n/useT.js";
import "./ReadBack.css";

/** Inline SVG: thumbs up. */
function ThumbsUpIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

/** Inline SVG: thumbs down. */
function ThumbsDownIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  );
}

export default function ReadBack({ caseData, send }) {
  const t = useT();
  const index = caseData.sentenceConfirmations.findIndex((confirmed) => !confirmed);
  const sentences = useMemo(() => composeReadBackSentences(caseData, "en"), [caseData]);

  useEffect(() => {
    if (index >= 0 && index < sentences.length) {
      announce(sentences[index]);
    }
  }, [index, sentences]);

  if (index < 0 || index >= sentences.length) return null;

  return (
    <section className="read-back">
      <div className="read-back__content">
        <p className="read-back__progress">
          {t("app.readback_sentence", { number: index + 1 })}
        </p>

        <div className="read-back__sentence-container">
          <blockquote className="read-back__sentence" key={index}>
            {sentences[index]}
          </blockquote>
        </div>

        <div className="read-back__dots">
          {sentences.map((_, i) => (
            <span
              className={`read-back__dot ${i < index ? "read-back__dot--done" : ""} ${i === index ? "read-back__dot--active" : ""}`}
              key={i}
            />
          ))}
        </div>

        <div className="read-back__actions">
          <button
            className="read-back__btn read-back__btn--yes"
            onClick={() => send({ type: "CONFIRM_SENTENCE", index, confirmed: true })}
            type="button"
          >
            <ThumbsUpIcon />
            <span>{t("readBack.confirm_yes")}</span>
          </button>
          <button
            className="read-back__btn read-back__btn--no"
            onClick={() => send({ type: "CONFIRM_SENTENCE", index, confirmed: false })}
            type="button"
          >
            <ThumbsDownIcon />
            <span>{t("readBack.confirm_no")}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
