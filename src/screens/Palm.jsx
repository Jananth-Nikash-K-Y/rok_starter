import { useEffect } from "react";
import Icon from "../components/Icon.jsx";
import { announce } from "../engines/a11yBus.js";
import "./Palm.css";

/**
 * Screen 1 — the Palm.
 *
 * One target, comprehensible without reading. Tapping it opens and
 * timestamps the case before a single question is asked (mechanic M1),
 * which is what makes every later step optional rather than mandatory.
 */
export default function Palm({ send, t, locale }) {
  useEffect(() => {
    announce(t("palm.caption"), { locale });
  }, [t, locale]);

  return (
    <section className="rok-container palm">
      <div className="palm__mark" aria-hidden="true">
        <Icon name="palm" size={64} />
      </div>

      <h1 className="palm__title" lang={locale}>{t("palm.caption")}</h1>
      <p className="palm__sub" lang={locale}>{t("palm.sub")}</p>

      <button
        className="palm__button"
        type="button"
        onClick={() => send({ type: "OPEN_CASE" })}
      >
        <span className="palm__button-label" lang={locale}>{t("palm.action")}</span>
        <span className="palm__button-hint" lang={locale}>{t("palm.action_hint")}</span>
      </button>

      <ul className="palm__promises">
        <li>
          <Icon name="clock" size={18} />
          <span lang={locale}>{t("palm.promise_time")}</span>
        </li>
        <li>
          <Icon name="shield" size={18} />
          <span lang={locale}>{t("palm.promise_otp")}</span>
        </li>
        <li>
          <Icon name="document" size={18} />
          <span lang={locale}>{t("palm.promise_typing")}</span>
        </li>
      </ul>
    </section>
  );
}
