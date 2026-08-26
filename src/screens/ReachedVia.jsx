import Choice from "../components/Choice.jsx";
import Screen from "../components/Screen.jsx";
import { inferTaxonomy } from "../engines/taxonomy.js";
import "./ReachedVia.css";

/**
 * Screen 5 — How they reached you (part of mechanic M3).
 *
 * Four icons stand in for the entire NCRP category taxonomy. The user never
 * sees a dropdown and never classifies their own crime; the mapping lives in
 * src/engines/taxonomy.js and surfaces only in the judges' debug ribbon.
 */
const CHANNELS = [
  { channel: "call", icon: "phone", labelKey: "reachedVia.call" },
  { channel: "sms", icon: "message", labelKey: "reachedVia.sms" },
  { channel: "whatsapp", icon: "whatsapp", labelKey: "reachedVia.whatsapp" },
  { channel: "link", icon: "link", labelKey: "reachedVia.link" },
];

export default function ReachedVia({ send, t, locale, caseData, debugMode }) {
  const transaction = caseData.transactions[0];

  const choose = (channel) => {
    const { category, subCategory } = inferTaxonomy(channel, transaction);
    send({ type: "SELECT_CHANNEL", channel, category, subCategory });
  };

  return (
    <Screen
      t={t}
      locale={locale}
      question={t("reachedVia.question")}
      spokenKey="reachedVia.question"
      why={t("reachedVia.why")}
      footer={debugMode && (
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
    >
      <div className="rok-choice-grid rok-choice-grid--four">
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
    </Screen>
  );
}
