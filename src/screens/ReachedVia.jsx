/* eslint-disable react/prop-types */
import { useEffect, useMemo } from "react";
import { announce } from "../engines/a11yBus.js";
import { inferTaxonomy } from "../engines/taxonomy.js";
import { useT } from "../i18n/useT.js";
import "./ReachedVia.css";

/** Inline SVG: phone call icon. */
function CallIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon" fill="none" height="28" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="28">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

/** Inline SVG: message/sms icon. */
function SmsIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon" fill="none" height="28" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="28">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/** Inline SVG: whatsapp-style chat icon. */
function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon" fill="none" height="28" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="28">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

/** Inline SVG: link/globe icon. */
function LinkIcon() {
  return (
    <svg aria-hidden="true" className="rok-icon" fill="none" height="28" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="28">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

const CHANNEL_CONFIG = [
  { channel: "call", Icon: CallIcon },
  { channel: "sms", Icon: SmsIcon },
  { channel: "whatsapp", Icon: WhatsAppIcon },
  { channel: "link", Icon: LinkIcon },
];

export default function ReachedVia({ send }) {
  const t = useT();
  const debugMode = useMemo(() => new URLSearchParams(window.location.search).has("debug"), []);

  useEffect(() => {
    announce(t("reachedVia.question"));
  }, [t]);

  const handleSelect = (channel) => {
    send({ type: "SELECT_CHANNEL", channel });
  };

  return (
    <section className="reached-via">
      <div className="reached-via__content">
        <h1>{t("reachedVia.question")}</h1>
        <div className="reached-via__grid">
          {CHANNEL_CONFIG.map(({ channel, Icon }) => (
            <button
              className="reached-via__choice"
              key={channel}
              onClick={() => handleSelect(channel)}
              type="button"
            >
              <Icon />
              <span>{t(`reachedVia.${channel}`)}</span>
            </button>
          ))}
        </div>

        {debugMode && (
          <details className="reached-via__debug">
            <summary>{t("reachedVia.debug_title")}</summary>
            <ul>
              {CHANNEL_CONFIG.map(({ channel }) => {
                const { category, subCategory } = inferTaxonomy(channel);
                return (
                  <li key={channel}>
                    <strong>{channel}</strong>: {category} / {subCategory}
                  </li>
                );
              })}
            </ul>
          </details>
        )}
      </div>
    </section>
  );
}
