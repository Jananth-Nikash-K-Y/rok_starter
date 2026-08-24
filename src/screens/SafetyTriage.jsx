/* eslint-disable react/prop-types */
import { useCallback, useEffect } from "react";
import { announce } from "../engines/a11yBus.js";
import { useT } from "../i18n/useT.js";
import "./SafetyTriage.css";

/** Inline SVG: phone icon for "still on call". */
function PhoneIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon" fill="none" height="32" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="32">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

/** Inline SVG: check-circle for "no, they hung up". */
function CheckCircleIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon" fill="none" height="32" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="32">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

/** Inline SVG: alert-octagon for hangup urgency. */
function AlertOctagonIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon" fill="none" height="48" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="48">
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

/** Inline SVG: share icon. */
function ShareIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
      <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    </svg>
  );
}

function HangupScript({ send, t }) {
  useEffect(() => {
    announce(t("safetyTriage.hangup_instruction"));
  }, [t]);

  const handleAlertContact = useCallback(async () => {
    const shareData = {
      title: "Rok",
      text: t("safetyTriage.share_text"),
    };

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
      } else {
        /* Graceful fallback: copy text to clipboard. */
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          await navigator.clipboard.writeText(shareData.text);
        }
      }
    } catch {
      /* User cancelled share sheet — not an error. */
    }

    send({ type: "GENERATE_HANDOFF_CODE" });
  }, [send, t]);

  return (
    <section className="safety-triage safety-triage--hangup">
      <div className="safety-triage__content">
        <AlertOctagonIcon />
        <h1 className="safety-triage__hangup-text">
          {t("safetyTriage.hangup_instruction")}
        </h1>
        <button
          className="safety-triage__alert-btn"
          onClick={handleAlertContact}
          type="button"
        >
          <ShareIcon />
          <span>{t("safetyTriage.alert_contact")}</span>
        </button>
      </div>
    </section>
  );
}

export default function SafetyTriage({ isHangupScript, send }) {
  const t = useT();

  useEffect(() => {
    if (!isHangupScript) {
      announce(t("safetyTriage.question"));
    }
  }, [isHangupScript, t]);

  if (isHangupScript) {
    return <HangupScript send={send} t={t} />;
  }

  return (
    <section className="safety-triage">
      <div className="safety-triage__content">
        <h1>{t("safetyTriage.question")}</h1>
        <div className="safety-triage__choices">
          <button
            className="safety-triage__choice safety-triage__choice--danger"
            onClick={() => send({ type: "STILL_ON_CALL_YES" })}
            type="button"
          >
            <PhoneIcon />
            <span>{t("safetyTriage.yes")}</span>
          </button>
          <button
            className="safety-triage__choice safety-triage__choice--safe"
            onClick={() => send({ type: "STILL_ON_CALL_NO" })}
            type="button"
          >
            <CheckCircleIcon />
            <span>{t("safetyTriage.no")}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
