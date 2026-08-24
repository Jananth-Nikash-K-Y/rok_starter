/* eslint-disable react/prop-types -- Phase 0 keeps the placeholder props dependency-free. */
import { useEffect, useRef, useState } from "react";
import { parseTransactionImage, parseTransactionSms } from "../engines/smsParser.js";
import { speak } from "../engines/speech.js";
import { SAMPLE_INBOX } from "../fixtures/sampleSms.js";
import { formatIndianDateTime, formatMaskedIndianCurrency } from "../i18n/format.js";
import { useT } from "../i18n/useT.js";
import "./MessageWall.css";

const RECEIPT_DELAY_MS = 650;

function receiptFields(parsed, t) {
  return [
    [t("messageWall.bank"), parsed.bank],
    [t("messageWall.amount"), formatMaskedIndianCurrency(parsed.amount)],
    [t("messageWall.timestamp"), formatIndianDateTime(parsed.timestamp)],
    [t("messageWall.account_tail"), parsed.accountTail ?? t("messageWall.not_available")],
    [t("messageWall.reference"), parsed.utr ?? t("messageWall.not_available")],
    [t("messageWall.beneficiary"), parsed.beneficiaryVpa ?? t("messageWall.not_available")],
  ];
}

export default function MessageWall({ send }) {
  const [selected, setSelected] = useState(null);
  const [ocrStatus, setOcrStatus] = useState(null);
  const inputRef = useRef(null);
  const t = useT();
  const messages = SAMPLE_INBOX.map((message) => ({ ...message, parsed: parseTransactionSms(message.text) }));

  useEffect(() => {
    if (!selected) return undefined;
    const timer = window.setTimeout(() => send({ type: "SELECT_MESSAGE", message: selected }), RECEIPT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [selected, send]);

  const selectMessage = (message, parsed) => {
    if (!parsed || selected) return;
    setSelected({ raw: message.text, ...parsed });
  };

  const handleUpload = async (event) => {
    const [file] = event.target.files ?? [];
    if (!file) return;

    setOcrStatus("reading");
    const parsed = await parseTransactionImage(file);
    if (!parsed) {
      setOcrStatus("unrecognized");
      event.target.value = "";
      return;
    }

    setOcrStatus("recognized");
    selectMessage({ text: "" }, parsed);
    event.target.value = "";
  };

  return (
    <section className="message-wall" aria-busy={ocrStatus === "reading"}>
      <header className="message-wall__header">
        <p className="message-wall__eyebrow">{t("messageWall.demo_label")}</p>
        <h1>{t("messageWall.title")}</h1>
      </header>

      <div className="message-wall__cards">
        {messages.map((message) => {
          const { parsed } = message;
          if (!parsed) return null;
          return (
            <article className="message-card" key={message.id}>
              <button
                aria-label={t("messageWall.select_message", { bank: parsed.bank })}
                className="message-card__select"
                disabled={Boolean(selected)}
                onClick={() => selectMessage(message, parsed)}
                type="button"
              >
                <span className="message-card__bank">{parsed.bank}</span>
                <span className="message-card__amount">{formatMaskedIndianCurrency(parsed.amount)}</span>
                <span className="message-card__timestamp">{formatIndianDateTime(parsed.timestamp)}</span>
              </button>
              <button
                aria-label={t("messageWall.read_message", { bank: parsed.bank })}
                className="message-card__read"
                disabled={Boolean(selected)}
                onClick={() => speak(message.text, "en-IN")}
                type="button"
              >
                <span aria-hidden="true">🔊</span>
                <span className="rok-sr-only">{t("messageWall.read_aloud")}</span>
              </button>
            </article>
          );
        })}
      </div>

      <input accept="image/png,image/jpeg,image/webp" aria-label={t("messageWall.upload_screenshot")} className="rok-sr-only" onChange={handleUpload} ref={inputRef} type="file" />
      <button className="message-wall__upload" disabled={Boolean(selected) || ocrStatus === "reading"} onClick={() => inputRef.current?.click()} type="button">
        {t(ocrStatus === "reading" ? "messageWall.ocr_reading" : "messageWall.upload_screenshot")}
      </button>
      {ocrStatus === "unrecognized" && <p className="message-wall__status" role="status">{t("messageWall.ocr_unrecognized")}</p>}

      {selected && (
        <section aria-live="polite" className="message-receipt" role="status">
          <h2>{t("messageWall.receipt_title")}</h2>
          <dl>
            {receiptFields(selected, t).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
          <p>{t(`messageWall.confidence_${selected.confidence}`)}</p>
        </section>
      )}
    </section>
  );
}
