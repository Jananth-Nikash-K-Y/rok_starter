import Choice from "../components/Choice.jsx";
import Icon from "../components/Icon.jsx";
import Screen from "../components/Screen.jsx";
import { formatIndianCurrency } from "../i18n/format.js";
import "./Scope.css";

/**
 * Screen 4 — Scope. Whether more money left than the transaction already
 * captured. Freeze-relevant: a second mule account needs a second hold.
 */
export default function Scope({ send, t, locale, caseData }) {
  const captured = caseData.transactions;
  const total = captured.reduce((sum, transaction) => sum + (transaction.amount ?? 0), 0);

  return (
    <Screen
      step={2}
      t={t}
      locale={locale}
      question={t("scope.question")}
      why={t("scope.why")}
      footer={
        <ul className="scope__captured">
          {captured.map((transaction, index) => (
            <li key={`${transaction.utr ?? "tx"}-${index}`}>
              <Icon name="check" size={18} />
              <span className="scope__captured-amount">
                {formatIndianCurrency(transaction.amount) ?? t("messageWall.not_available")}
              </span>
              <span className="scope__captured-bank">
                {transaction.bank ?? t("messageWall.unknown_bank")}
              </span>
            </li>
          ))}
          {captured.length > 1 && (
            <li className="scope__total">
              <Icon name="rupee" size={18} />
              <span className="scope__captured-amount">{formatIndianCurrency(total)}</span>
              <span className="scope__captured-bank">{t("scope.total_label")}</span>
            </li>
          )}
        </ul>
      }
    >
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
    </Screen>
  );
}
