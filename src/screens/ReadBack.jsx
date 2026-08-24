/* eslint-disable react/prop-types -- Phase 0 keeps the placeholder props dependency-free. */
import { useT } from "../i18n/useT.js";

export default function ReadBack({ caseData, send }) {
  const t = useT();
  const index = caseData.sentenceConfirmations.findIndex((confirmed) => !confirmed);
  return <section><h1>{t("app.readback_sentence", { number: index + 1 })}</h1><button onClick={() => send({ type: "CONFIRM_SENTENCE", index, confirmed: true })} type="button">{t("readBack.confirm_yes")}</button><button onClick={() => send({ type: "CONFIRM_SENTENCE", index, confirmed: false })} type="button">{t("readBack.confirm_no")}</button></section>;
}
