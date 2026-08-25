import { useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";
import { LOCALES, localeMeta } from "../i18n/locales.js";

/**
 * The language control.
 *
 * Every option is written in its own script, at full size — a picker that
 * lists "Tamil" in English is unusable by the person who needs Tamil. The
 * trigger shows the current language natively too, so a user who cannot
 * read the interface can still recognise their own language and find it.
 */
export default function LanguagePicker({ locale, onChange, t }) {
  const [open, setOpen] = useState(false);
  const panel = useRef(null);
  const trigger = useRef(null);
  const current = localeMeta(locale);

  useEffect(() => {
    if (!open) return undefined;
    const onDocument = (event) => {
      if (!panel.current?.contains(event.target) && !trigger.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDocument);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocument);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="lang">
      <button
        ref={trigger}
        className="lang__trigger"
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("app.language")}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="globe" size={20} />
        <span className="lang__current">{current.native}</span>
      </button>

      {open && (
        <ul className="lang__panel" ref={panel} role="listbox" aria-label={t("app.language")}>
          {LOCALES.map((option) => (
            <li key={option.code}>
              <button
                className="lang__option"
                type="button"
                role="option"
                aria-selected={option.code === locale}
                lang={option.code}
                onClick={() => { onChange(option.code); setOpen(false); }}
              >
                <span className="lang__native">{option.native}</span>
                <span className="lang__english">{option.english}</span>
                {option.code === locale && <Icon name="check" size={20} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
