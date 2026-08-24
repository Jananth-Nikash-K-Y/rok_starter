/* eslint-disable react/prop-types -- Phase 0 keeps the placeholder props dependency-free. */
import { useT } from "../i18n/useT.js";

export default function Palm({ send }) {
  const t = useT();
  return <section><h1>Rok</h1><button aria-label={t("palm.sr_label")} onClick={() => send({ type: "OPEN_CASE" })} type="button">{t("palm.caption")}</button></section>;
}
