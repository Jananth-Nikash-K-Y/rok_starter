/* eslint-disable react/prop-types -- Phase 0 keeps the placeholder props dependency-free. */
import { useT } from "../i18n/useT.js";

export default function Scope({ send }) {
  const t = useT();
  return <section><h1>{t("scope.question")}</h1><button onClick={() => send({ type: "SCOPE_ONLY_THIS" })} type="button">{t("scope.only_this_one")}</button><button onClick={() => send({ type: "SCOPE_MORE" })} type="button">{t("scope.there_were_more")}</button></section>;
}
