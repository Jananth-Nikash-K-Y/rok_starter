/* eslint-disable react/prop-types -- Phase 0 keeps the placeholder props dependency-free. */
import { useT } from "../i18n/useT.js";

export default function CaseComplete({ caseData }) {
  const t = useT();
  return <section><h1>{t("caseComplete.heading")}</h1><p>{t("app.case_reference", { id: caseData.id })}</p><p>{t("caseComplete.your_money")}</p><p>{t("caseComplete.your_job_now")}</p><p>{t("caseComplete.by_tomorrow")}</p></section>;
}
