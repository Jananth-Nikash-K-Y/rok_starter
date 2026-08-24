import { useEffect } from "react";
import Choice from "../components/Choice.jsx";
import Icon from "../components/Icon.jsx";
import { announce } from "../engines/a11yBus.js";
import { inferTaxonomy } from "../engines/taxonomy.js";
import "./ReachedVia.css";

/**
 * Screen 5 — How they reached you (part of mechanic M3).
 *
 * Four icons stand in for the entire NCRP category and sub-category
 * taxonomy. The user never sees a dropdown, never classifies their own
 * crime, and never learns the vocabulary — the mapping happens in
 * src/engines/taxonomy.js and is shown only in the judges' debug ribbon.
 */
const CHANNELS = [
  { channel: "call", icon: "phone", labelKey: "reachedVia.call" },
  { channel: "sms", icon: "message", labelKey: "reachedVia.sms" },
  { channel: "whatsapp", icon: "whatsapp", labelKey: "reachedVia.whatsapp" },
  { channel: "link", icon: "link", labelKey: "reachedVia.link" },
];

export default function ReachedVia({ send, t, locale, caseData, debugMode }) {
  useEffect(() => {
    announce(t("reachedVia.question"), { locale });
  }, [t, locale]);

  const transaction = caseData.transactions[0];

  const choose = (channel) => {
    const { category, subCategory } = inferTaxonomy(channel, transaction);
    send({ type: "SELECT_CHANNEL", channel, category, subCategory });
  };

  return (
    <section className="rok-container rok-screen reached">
      <p className="rok-eyebrow">
        <Icon name="people" size={14} />
        {t("reachedVia.eyebrow")}
      </p>

      <h1 className="rok-question" lang={locale}>{t("reachedVia.question")}</h1>
      <p className="rok-support" lang={locale}>{t("reachedVia.support")}</p>

      <div className="rok-choice-grid">
        {CHANNELS.map(({ channel, icon, labelKey }) => (
          <Choice
            key={channel}
            icon={icon}
            lang={locale}
            label={t(labelKey)}
            onClick={() => choose(channel)}
          />
        ))}
      </div>

      <div className="rok-why">
        <Icon name="document" size={18} />
        <span lang={locale}>{t("reachedVia.why")}</span>
      </div>

      {debugMode && (
        <div className="reached__debug">
          <p className="reached__debug-title">{t("reachedVia.debug_title")}</p>
          <table>
            <tbody>
              {CHANNELS.map(({ channel, labelKey }) => {
                const mapped = inferTaxonomy(channel, transaction);
                return (
                  <tr key={channel}>
                    <th scope="row">{t(labelKey)}</th>
                    <td>{mapped.category}</td>
                    <td>{mapped.subCategory}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
