/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { announce } from "../engines/a11yBus.js";
import { useT } from "../i18n/useT.js";
import "./Palm.css";

/** Inline SVG: raised hand / stop icon — the product's core motif. */
function PalmIcon() {
  return (
    <svg aria-hidden="true" className="palm__icon" fill="none" height="80" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="80">
      <path d="M18 11V6a2 2 0 0 0-4 0" />
      <path d="M14 10V4a2 2 0 0 0-4 0v2" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-5.9-2.4L3.7 17a2 2 0 0 1 3-2.6l.3.3" />
    </svg>
  );
}

export default function Palm({ send }) {
  const t = useT();

  useEffect(() => {
    announce(t("palm.sr_label"));
  }, [t]);

  return (
    <section className="palm">
      <div className="palm__content">
        <PalmIcon />
        <button
          aria-label={t("palm.sr_label")}
          className="palm__button"
          onClick={() => send({ type: "OPEN_CASE" })}
          type="button"
        >
          {t("palm.caption")}
        </button>
      </div>
    </section>
  );
}
