/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { announce } from "../engines/a11yBus.js";
import { useT } from "../i18n/useT.js";
import "./Scope.css";

/** Inline SVG: single circle for "only this one". */
function SingleIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon" fill="none" height="32" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="32">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="16" />
      <line x1="8" x2="16" y1="12" y2="12" />
    </svg>
  );
}

/** Inline SVG: multiple circles for "there were more". */
function MultipleIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon" fill="none" height="32" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="32">
      <rect height="6" rx="1" width="6" x="3" y="3" />
      <rect height="6" rx="1" width="6" x="15" y="3" />
      <rect height="6" rx="1" width="6" x="3" y="15" />
      <rect height="6" rx="1" width="6" x="15" y="15" />
    </svg>
  );
}

export default function Scope({ send }) {
  const t = useT();

  useEffect(() => {
    announce(t("scope.question"));
  }, [t]);

  return (
    <section className="scope">
      <div className="scope__content">
        <h1>{t("scope.question")}</h1>
        <div className="scope__choices">
          <button
            className="scope__choice"
            onClick={() => send({ type: "SCOPE_ONLY_THIS" })}
            type="button"
          >
            <SingleIcon />
            <span>{t("scope.only_this_one")}</span>
          </button>
          <button
            className="scope__choice scope__choice--secondary"
            onClick={() => send({ type: "SCOPE_MORE" })}
            type="button"
          >
            <MultipleIcon />
            <span>{t("scope.there_were_more")}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
