import { useEffect, useRef, useState } from "react";
import Button from "../components/Button.jsx";
import Icon from "../components/Icon.jsx";
import { announce } from "../engines/a11yBus.js";
import { buildHelplineCard, buildNcrpPacket } from "../engines/outputs.js";
import { buildCaseDocument } from "../engines/caseDocument.js";
import { caseReferenceFrom } from "../state/machine.js";
import { formatIndianCurrency } from "../i18n/format.js";
import "./CaseComplete.css";

/**
 * Screen 7 — the green screen.
 *
 * The case reference comes first and largest, because it is the one thing
 * the victim has to be able to say out loud to a 1930 operator. Everything
 * below it is ordered by what happens when: the money, then their next
 * action, then tomorrow.
 */
export default function CaseComplete({ send, t, locale, caseData, onRequestNewCase }) {
  const reference = caseReferenceFrom(caseData.id);
  const helplineLines = buildHelplineCard(caseData);
  const transaction = caseData.transactions[0] ?? {};
  const [shared, setShared] = useState(false);
  const [buildingPdf, setBuildingPdf] = useState(false);
  const [autoSave, setAutoSave] = useState("pending");
  /* Which case has already been auto-saved, so a re-mount cannot produce a
     second file in the user's downloads folder. */
  const autoSavedCaseId = useRef(null);

  useEffect(() => {
    announce(t("caseComplete.spoken", { reference }), { locale, key: "caseComplete.spoken" });
  }, [t, locale, reference]);

  const download = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadPacket = () => {
    const packet = JSON.stringify(buildNcrpPacket(caseData), null, 2);
    download(new Blob([packet], { type: "application/json" }), `rok-${reference}.json`);
  };

  const downloadPdf = async () => {
    setBuildingPdf(true);
    try {
      download(await buildCaseDocument(caseData, t, locale), `rok-${reference}.pdf`);
      setAutoSave("saved");
    } catch {
      setAutoSave("failed");
    } finally {
      setBuildingPdf(false);
    }
  };

  /* The record saves itself the moment the case exists.
     A victim should not have to notice a download button to end up holding
     the evidence — and this runs off the tap that completed the read-back,
     so it is a user-initiated download, not a drive-by one. A browser that
     blocks it still leaves the button below, and `failed` says so. */
  useEffect(() => {
    if (autoSavedCaseId.current === caseData.id) return;
    autoSavedCaseId.current = caseData.id;

    /* No cleanup cancellation here on purpose. StrictMode mounts an effect
       twice in development; cancelling on the first unmount killed the only
       in-flight build and the notice sat on "saving" forever. Guarding by
       case id gives exactly one file per case in both dev and production. */
    buildCaseDocument(caseData, t, locale)
      .then((blob) => {
        download(blob, `rok-${reference}.pdf`);
        setAutoSave("saved");
      })
      .catch(() => setAutoSave("failed"));
    /* Once per case: rebuilding on a locale change would save a second
       copy. The manual button below covers wanting it in another language. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseData.id]);

  /* The written route. Share sheet where the device offers one, clipboard
     everywhere else — either way the complaint leaves as text, with no
     spoken or heard step anywhere in the path. */
  const sendInWriting = async () => {
    const body = [t("caseComplete.written_intro"), "", ...helplineLines].join("\n");
    try {
      if (navigator.share) {
        await navigator.share({ title: t("caseComplete.four_lines"), text: body });
        setShared(true);
        return;
      }
      await navigator.clipboard.writeText(body);
      setShared(true);
    } catch {
      setShared(false);
    }
  };

  return (
    <section className="rok-container rok-screen complete">
      <div className="complete__hero">
        <span className="complete__tick" aria-hidden="true">
          <Icon name="check" size={32} />
        </span>
        <h1 className="complete__heading" lang={locale}>{t("caseComplete.heading")}</h1>
        <p className="complete__reference-label" lang={locale}>{t("caseComplete.reference_label")}</p>
        <p className="complete__reference">{reference}</p>
        {transaction.amount !== undefined && transaction.amount !== null && (
          <p className="complete__amount" lang={locale}>
            {t("caseComplete.amount_line", { amount: formatIndianCurrency(transaction.amount) })}
          </p>
        )}
      </div>

      {/* Four lines, in the order an operator asks for them — and three
          equally weighted ways to deliver them.

          The 1930 helpline is a telephone line, which the concept document
          notes excludes deaf users entirely. Making "call" the single
          primary action would end the flow, for the exact people this
          product exists for, at the last screen. So speaking, sending and
          handing to someone else are offered as peers: whichever a person
          can do is the right one. */}
      <article className="complete__card complete__card--helpline">
        <h2 className="rok-card__title">
          <Icon name="document" size={20} />
          {t("caseComplete.four_lines")}
        </h2>
        <ol className="complete__lines">
          {helplineLines.map((line) => <li key={line}>{line}</li>)}
        </ol>

        <p className="complete__routes-label" lang={locale}>{t("caseComplete.routes_label")}</p>

        <div className="complete__routes">
          <a className="complete__route" href="tel:1930">
            <span className="complete__route-icon"><Icon name="phone" size={24} /></span>
            <span className="complete__route-text">
              <span className="complete__route-title">{t("caseComplete.route_call")}</span>
              <span className="complete__route-note">{t("caseComplete.route_call_note")}</span>
            </span>
          </a>

          <button className="complete__route" type="button" onClick={sendInWriting}>
            <span className="complete__route-icon"><Icon name="message" size={24} /></span>
            <span className="complete__route-text">
              <span className="complete__route-title">
                {shared ? t("caseComplete.copied") : t("caseComplete.route_write")}
              </span>
              <span className="complete__route-note">{t("caseComplete.route_write_note")}</span>
            </span>
          </button>

          <button
            className="complete__route"
            type="button"
            onClick={() => send({ type: "OPEN_GUARDIAN_HANDOFF" })}
          >
            <span className="complete__route-icon"><Icon name="people" size={24} /></span>
            <span className="complete__route-text">
              <span className="complete__route-title">{t("caseComplete.route_helper")}</span>
              <span className="complete__route-note">{t("caseComplete.route_helper_note")}</span>
            </span>
          </button>
        </div>
      </article>

      <div className="complete__cards">
        <article className="complete__card">
          <h2 className="rok-card__title">
            <Icon name="rupee" size={20} />
            {t("caseComplete.your_money")}
          </h2>
          <p lang={locale}>{t("caseComplete.your_money_detail")}</p>
        </article>

        <article className="complete__card">
          <h2 className="rok-card__title">
            <Icon name="clock" size={20} />
            {t("caseComplete.your_job_now")}
          </h2>
          <p lang={locale}>{t("caseComplete.your_job_detail")}</p>
        </article>

        <article className="complete__card">
          <h2 className="rok-card__title">
            <Icon name="location" size={20} />
            {t("caseComplete.by_tomorrow")}
          </h2>
          <p lang={locale}>{t("caseComplete.by_tomorrow_detail")}</p>
        </article>
      </div>

      {/* Stated plainly, because the alternative is letting a judge or a
          victim believe a complaint was filed when it was not. */}
      <div className="complete__honesty">
        <Icon name="alert" size={20} />
        <div>
          <p className="complete__honesty-title" lang={locale}>{t("caseComplete.not_submitted_title")}</p>
          <p lang={locale}>{t("caseComplete.not_submitted_detail")}</p>
        </div>
      </div>

      <p className={`complete__autosave complete__autosave--${autoSave}`} role="status" lang={locale}>
        <Icon name={autoSave === "saved" ? "check" : autoSave === "failed" ? "alert" : "clock"} size={18} />
        <span>{t(`caseComplete.autosave_${autoSave}`)}</span>
      </p>

      <div className="complete__downloads">
        <Button variant="quiet" icon="document" onClick={downloadPacket}>
          {t("caseComplete.download_packet")}
        </Button>
        <Button variant="quiet" icon="document" disabled={buildingPdf} onClick={downloadPdf}>
          {t("caseComplete.download_pdf")}
        </Button>
      </div>

      <Button variant="primary" block iconAfter="arrowRight" onClick={() => send({ type: "ENTER_CALM_MODE" })}>
        {t("app.calm_mode")}
      </Button>

      {/* Discarding a case is the only destructive action in the app, and
          the case exists nowhere but this browser — so it goes through the
          same shared confirmation dialog as the generic Cancel control. */}
      <div className="complete__reset">
        <Button variant="ghost" onClick={onRequestNewCase}>
          {t("caseComplete.reset")}
        </Button>
      </div>
    </section>
  );
}
