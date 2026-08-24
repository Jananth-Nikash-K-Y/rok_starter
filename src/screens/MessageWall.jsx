/* eslint-disable react/prop-types -- Phase 0 keeps the placeholder props dependency-free. */
import { useT } from "../i18n/useT.js";

const demoMessage = { raw: "Demo bank message selected during Phase 0.", bank: "Demo Bank", amount: 0, confidence: "low" };

export default function MessageWall({ send }) {
  const t = useT();
  return <section><h1>{t("messageWall.title")}</h1><button onClick={() => send({ type: "SELECT_MESSAGE", message: demoMessage })} type="button">{t("app.demo_message")}: {t("app.placeholder_transaction")}</button></section>;
}
