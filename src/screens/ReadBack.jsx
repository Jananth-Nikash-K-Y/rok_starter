import { useMemo, useState } from "react";
import Button from "../components/Button.jsx";
import Screen from "../components/Screen.jsx";
import { composeNarrative, composeReadBackSentences } from "../engines/narrative.js";
import "./ReadBack.css";

/**
 * Screen 6 — Read-Back (mechanic M4).
 *
 * The mandatory 200-character description is composed from confirmed facts
 * rather than written by the victim. One sentence at a time, each needing
 * only yes or no. The same step is the audio path for a blind user, the text
 * path for a deaf user, and the confirmation path for everyone else.
 */
export default function ReadBack({ send, t, locale, caseData }) {
  const sentences = useMemo(() => composeReadBackSentences(caseData, t), [caseData, t]);
  const narrative = useMemo(() => composeNarrative(caseData), [caseData]);
  const pending = caseData.sentenceConfirmations.findIndex((confirmed) => !confirmed);
  const current = pending === -1 ? sentences.length - 1 : pending;
  const [showNarrative, setShowNarrative] = useState(false);

  return (
    <Screen
      step={4}
      t={t}
      locale={locale}
      question={t("readBack.question")}
      spoken={sentences[current]}
      why={t("readBack.why")}
      footer={
        <details
          className="readback__narrative"
          open={showNarrative}
          onToggle={(event) => setShowNarrative(event.currentTarget.open)}
        >
          <summary>{t("readBack.show_narrative")}</summary>
          <p className="readback__narrative-body" lang="en">{narrative}</p>
          <p className="readback__narrative-meta">
            {t("readBack.narrative_meta", { count: String(narrative.length) })}
          </p>
        </details>
      }
    >
      <div className="readback__dots" aria-hidden="true">
        {sentences.map((_, position) => (
          <span
            key={position}
            className={[
              "readback__dot",
              position < current ? "readback__dot--done" : "",
              position === current ? "readback__dot--current" : "",
            ].filter(Boolean).join(" ")}
          />
        ))}
      </div>

      <blockquote className="readback__sentence" lang={locale} key={current}>
        {sentences[current]}
      </blockquote>

      <div className="readback__actions">
        <Button variant="quiet" icon="cross" block onClick={() => send({ type: "REJECT_READBACK" })}>
          {t("readBack.confirm_no")}
        </Button>
        <Button
          variant="primary"
          icon="check"
          block
          onClick={() => send({ type: "CONFIRM_SENTENCE", index: current, confirmed: true, narrative })}
        >
          {t("readBack.confirm_yes")}
        </Button>
      </div>
    </Screen>
  );
}
