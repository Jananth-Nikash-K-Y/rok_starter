import { useEffect } from "react";
import Choice from "../components/Choice.jsx";
import Icon from "../components/Icon.jsx";
import { announce } from "../engines/a11yBus.js";
import { formatIndianCurrency } from "../i18n/format.js";
import "./Scope.css";

/**
 * Screen 4 — Scope.
 *
 * Whether more money left than the one transaction already captured. This
 * is a freeze-relevant question: a second mule account needs a second hold.
 */
export default function Scope({ send, t, locale, caseData }) {
  useEffect(() => {
    announce(t("scope.question"), { locale });
  }, [t, locale]);

  const captured = caseData.transactions;
  const total = captured.reduce((sum, transaction) => sum + (transaction.amount ?? 0), 0);

  return (
    <section className="rok-container rok-screen scope">
      <p className="rok-eyebrow">
        <Icon name="rupee" size={14} />
        {t("scope.eyebrow", { count: String(captured.length) })}
      </p>

      <h1 className="rok-question" lang={locale}>{t("scope.question")}</h1>

      <ul className="scope__captured">
        {captured.map((transaction, index) => (
          <li key={`${transaction.utr ?? "tx"}-${index}`}>
            <Icon name="check" size={16} />
            <span>{formatIndianCurrency(transaction.amount) ?? t("messageWall.not_available")}</span>
            <span className="scope__captured-bank">
              {transaction.bank ?? t("messageWall.unknown_bank")}
            </span>
          </li>
        ))}
      </ul>

      {captured.length > 1 && (
        <p className="scope__total">
          {t("scope.total", { amount: formatIndianCurrency(total) })}
        </p>
      )}

      <div className="rok-choice-grid">
        <Choice
          icon="check"
          tone="affirm"
          lang={locale}
          label={t("scope.only_this_one")}
          onClick={() => send({ type: "SCOPE_ONLY_THIS" })}
        />
        <Choice
          icon="rupee"
          tone="danger"
          lang={locale}
          label={t("scope.there_were_more")}
          onClick={() => send({ type: "SCOPE_MORE" })}
        />
      </div>

      <div className="rok-why">
        <Icon name="shield" size={18} />
        <span lang={locale}>{t("scope.why")}</span>
      </div>
    </section>
  );
}
