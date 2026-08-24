/* eslint-disable react/prop-types -- Phase 0 keeps the placeholder props dependency-free. */
import { useT } from "../i18n/useT.js";

const channels = ["call", "sms", "whatsapp", "link"];

export default function ReachedVia({ send }) {
  const t = useT();
  return <section><h1>{t("reachedVia.question")}</h1>{channels.map((channel) => <button key={channel} onClick={() => send({ type: "SELECT_CHANNEL", channel })} type="button">{t(`reachedVia.${channel}`)}</button>)}</section>;
}
