/* eslint-disable react/prop-types -- Phase 0 keeps the placeholder props dependency-free. */
import { useT } from "../i18n/useT.js";

export default function SafetyTriage({ isHangupScript, send }) {
  const t = useT();
  if (isHangupScript) return <section><p>{t("safetyTriage.hangup_instruction")}</p><button onClick={() => send({ type: "GENERATE_HANDOFF_CODE" })} type="button">{t("safetyTriage.alert_contact")}</button></section>;
  return <section><h1>{t("safetyTriage.question")}</h1><button onClick={() => send({ type: "STILL_ON_CALL_YES" })} type="button">{t("safetyTriage.yes")}</button><button onClick={() => send({ type: "STILL_ON_CALL_NO" })} type="button">{t("safetyTriage.no")}</button></section>;
}
