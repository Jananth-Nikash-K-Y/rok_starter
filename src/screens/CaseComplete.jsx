/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from "react";
import { announce } from "../engines/a11yBus.js";
import { buildCasePdf, buildHelplineCard, buildNcrpPacket } from "../engines/outputs.js";
import { useT } from "../i18n/useT.js";
import "./CaseComplete.css";

/** Inline SVG: check-circle for success. */
function SuccessIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon rok-icon--lg" fill="none" height="48" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="48">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

/** Inline SVG: banknote / money icon. */
function MoneyIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
      <rect height="14" rx="2" width="20" x="2" y="5" />
      <circle cx="12" cy="12" r="3" />
      <path d="M2 9h2M20 9h2M2 15h2M20 15h2" />
    </svg>
  );
}

/** Inline SVG: phone-call icon for helpline. */
function HelplineIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
      <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94" />
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

/** Inline SVG: map-pin / location icon. */
function LocationIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/** Inline SVG: download icon. */
function DownloadIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="16">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}

export default function CaseComplete({ caseData, send }) {
  const t = useT();
  const [helplineLines, setHelplineLines] = useState([]);

  useEffect(() => {
    announce(t("caseComplete.heading"));
    setHelplineLines(buildHelplineCard(caseData));
  }, [t, caseData]);

  const handleDownloadPacket = useCallback(() => {
    const packet = buildNcrpPacket(caseData);
    const blob = new Blob([JSON.stringify(packet, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rok-case-${caseData.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [caseData]);

  const handleDownloadPdf = useCallback(() => {
    const blob = buildCasePdf(caseData);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rok-case-${caseData.id.slice(0, 8)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }, [caseData]);

  return (
    <section className="case-complete">
      <div className="case-complete__content">
        <div className="case-complete__hero">
          <SuccessIcon />
          <h1>{t("caseComplete.heading")}</h1>
          <p className="case-complete__case-id">
            {t("app.case_reference", { id: caseData.id.slice(0, 8) })}
          </p>
        </div>

        <div className="case-complete__cards">
          <article className="case-complete__card case-complete__card--money">
            <div className="case-complete__card-header">
              <MoneyIcon />
              <h2>{t("caseComplete.your_money")}</h2>
            </div>
            <p>{t("caseComplete.your_money_detail")}</p>
            <div className="case-complete__card-actions">
              <button className="case-complete__download" onClick={handleDownloadPacket} type="button">
                <DownloadIcon /> <span>NCRP Packet</span>
              </button>
              <button className="case-complete__download" onClick={handleDownloadPdf} type="button">
                <DownloadIcon /> <span>PDF Report</span>
              </button>
            </div>
          </article>

          <article className="case-complete__card case-complete__card--helpline">
            <div className="case-complete__card-header">
              <HelplineIcon />
              <h2>{t("caseComplete.your_job_now")}</h2>
            </div>
            <p>{t("caseComplete.your_job_detail")}</p>
            {helplineLines.length > 0 && (
              <div className="case-complete__helpline-card">
                {helplineLines.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}
            <a className="case-complete__tel" href="tel:1930">{t("caseComplete.helpline_number")}</a>
          </article>

          <article className="case-complete__card case-complete__card--tomorrow">
            <div className="case-complete__card-header">
              <LocationIcon />
              <h2>{t("caseComplete.by_tomorrow")}</h2>
            </div>
            <p>{t("caseComplete.by_tomorrow_detail")}</p>
          </article>
        </div>

        <button
          className="case-complete__calm-btn"
          onClick={() => send({ type: "ENTER_CALM_MODE" })}
          type="button"
        >
          {t("app.calm_mode")}
        </button>
      </div>
    </section>
  );
}
