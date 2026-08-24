import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button.jsx";
import Icon from "../components/Icon.jsx";
import { announce } from "../engines/a11yBus.js";
import { composeNarrative, composeReadBackSentences } from "../engines/narrative.js";
import "./ReadBack.css";

/**
 * Screen 6 — Read-Back (mechanic M4).
 *
 * The mandatory 200-character description is composed from confirmed facts
 * rather than written by the victim. What they get back is three short
 * sentences in their own language, one at a time, each needing only a yes
 * or a no. The same step is the audio path for a blind user, the text path
 * for a deaf user, and the confirmation path for everyone else.
 */
export default function ReadBack({ send, t, locale, caseData }) {
  const sentences = useMemo(() => composeReadBackSentences(caseData, t), [caseData, t]);
  const narrative = useMemo(() => composeNarrative(caseData), [caseData]);
  const index = caseData.sentenceConfirmations.findIndex((confirmed) => !confirmed);
  const current = index === -1 ? sentences.length - 1 : index;
  const [showNarrative, setShowNarrative] = useState(false);

  useEffect(() => {
    announce(sentences[current], { locale });
  }, [sentences, current, locale]);

  return (
    <section className="rok-container rok-screen readback">
      <p className="rok-eyebrow">
        <Icon name="speaker" size={14} />
        {t("readBack.eyebrow", { number: String(current + 1), total: String(sentences.length) })}
      </p>

      <div className="readback__dots" aria-hidden="true">
        {sentences.map((_, position) => (
          <span
            key={position}
            className={`readback__dot ${position < current ? "readback__dot--done" : ""} ${position === current ? "readback__dot--current" : ""}`}
          />
        ))}
      </div>

      <blockquote className="readback__sentence" lang={locale} key={current}>
        {sentences[current]}
      </blockquote>

      <div className="readback__actions">
        <Button
          variant="quiet"
          icon="cross"
          block
          onClick={() => send({ type: "REJECT_READBACK" })}
        >
          {t("readBack.confirm_no")}
        </Button>
        <Button
          variant="primary"
          icon="check"
          block
          onClick={() => send({
            type: "CONFIRM_SENTENCE",
            index: current,
            confirmed: true,
            narrative,
          })}
        >
          {t("readBack.confirm_yes")}
        </Button>
      </div>

      <div className="rok-why">
        <Icon name="document" size={18} />
        <span lang={locale}>{t("readBack.why")}</span>
      </div>

      {/* Available, but deliberately not in the way: the point of this
          screen is that nobody has to read 200 characters of police
          English to file a complaint. */}
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
    </section>
  );
}
