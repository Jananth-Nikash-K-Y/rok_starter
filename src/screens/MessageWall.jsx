/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { parseTransactionImage, parseTransactionSms } from "../engines/smsParser.js";
import { speak } from "../engines/speech.js";
import { SAMPLE_INBOX } from "../fixtures/sampleSms.js";
import { formatIndianDateTime, formatMaskedIndianCurrency } from "../i18n/format.js";
import { useT } from "../i18n/useT.js";
import "./MessageWall.css";

const RECEIPT_DELAY_MS = 650;

/** Inline SVG: speaker icon — consistent with project's icon approach. */
function SpeakerIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

/** Inline SVG: upload/camera icon. */
function UploadIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}

/** Inline SVG: checkmark circle for receipt. */
function CheckIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon rok-icon--success" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

/** Inline SVG: shield icon for confidence. */
function ShieldIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

/** Inline SVG: alert-triangle for low confidence. */
function AlertIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  );
}

/** Inline SVG: loading spinner for OCR. */
function SpinnerIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon rok-icon--spin" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" viewBox="0 0 24 24" width="20">
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}

function confidenceTag(confidence, t) {
  if (confidence === "high") {
    return (
      <span className="message-receipt__confidence message-receipt__confidence--high">
        <ShieldIcon /> {t("messageWall.confidence_high")}
      </span>
    );
  }
  if (confidence === "medium") {
    return (
      <span className="message-receipt__confidence message-receipt__confidence--medium">
        <ShieldIcon /> {t("messageWall.confidence_medium")}
      </span>
    );
  }
  return (
    <span className="message-receipt__confidence message-receipt__confidence--low">
      <AlertIcon /> {t("messageWall.confidence_low")}
    </span>
  );
}

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

      <div className="message-wall__cards" role="list">
        {messages.map((message) => {
          const { parsed } = message;
          if (!parsed) return null;
          return (
            <article className="message-card" key={message.id} role="listitem">
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
                <SpeakerIcon />
                <span className="rok-sr-only">{t("messageWall.read_aloud")}</span>
              </button>
            </article>
          );
        })}
      </div>

      <input
        accept="image/png,image/jpeg,image/webp"
        aria-label={t("messageWall.upload_screenshot")}
        className="rok-sr-only"
        onChange={handleUpload}
        ref={inputRef}
        type="file"
      />
      <button
        className="message-wall__upload"
        disabled={Boolean(selected) || ocrStatus === "reading"}
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        {ocrStatus === "reading" ? <SpinnerIcon /> : <UploadIcon />}
        <span>{t(ocrStatus === "reading" ? "messageWall.ocr_reading" : "messageWall.upload_screenshot")}</span>
      </button>

      {ocrStatus === "unrecognized" && (
        <p className="message-wall__status" role="status">
          <AlertIcon /> {t("messageWall.ocr_unrecognized")}
        </p>
      )}

      {selected && (
        <section aria-live="polite" className="message-receipt" role="status">
          <div className="message-receipt__header">
            <CheckIcon />
            <h2>{t("messageWall.receipt_title")}</h2>
          </div>
          <dl>
            {receiptFields(selected, t).map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          {confidenceTag(selected.confidence, t)}
        </section>
      )}
    </section>
  );
}
