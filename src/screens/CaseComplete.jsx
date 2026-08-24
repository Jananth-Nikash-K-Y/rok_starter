import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import Icon from "../components/Icon.jsx";
import { announce } from "../engines/a11yBus.js";
import { buildCasePdf, buildHelplineCard, buildNcrpPacket } from "../engines/outputs.js";
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
export default function CaseComplete({ send, t, locale, caseData }) {
  const reference = caseReferenceFrom(caseData.id);
  const helplineLines = buildHelplineCard(caseData);
  const transaction = caseData.transactions[0] ?? {};
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    announce(t("caseComplete.spoken", { reference }), { locale });
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

  const downloadPdf = () => {
    download(buildCasePdf(caseData), `rok-${reference}.pdf`);
  };

  const copyHelpline = async () => {
    try {
      await navigator.clipboard.writeText(helplineLines.join("\n"));
      setCopied(true);
    } catch {
      setCopied(false);
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

      {/* The 1930 card: four lines, in the order an operator asks for them. */}
      <article className="complete__card complete__card--helpline">
        <h2 className="rok-card__title">
          <Icon name="phone" size={20} />
          {t("caseComplete.helpline_card")}
        </h2>
        <ol className="complete__lines">
          {helplineLines.map((line) => <li key={line}>{line}</li>)}
        </ol>
        <div className="complete__helpline-actions">
          <a className="rok-btn rok-btn--danger" href="tel:1930">
            <Icon name="phone" />
            <span>{t("caseComplete.call_1930")}</span>
          </a>
          <Button variant="quiet" icon="document" onClick={copyHelpline}>
            {copied ? t("caseComplete.copied") : t("caseComplete.copy_lines")}
          </Button>
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

      <div className="complete__downloads">
        <Button variant="quiet" icon="document" onClick={downloadPacket}>
          {t("caseComplete.download_packet")}
        </Button>
        <Button variant="quiet" icon="document" onClick={downloadPdf}>
          {t("caseComplete.download_pdf")}
        </Button>
      </div>

      <Button variant="primary" block iconAfter="arrowRight" onClick={() => send({ type: "ENTER_CALM_MODE" })}>
        {t("app.calm_mode")}
      </Button>
    </section>
  );
}
