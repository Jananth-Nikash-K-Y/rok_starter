import { useEffect, useRef, useState } from "react";
import Icon from "./Icon.jsx";

/**
 * Text size and contrast controls.
 *
 * The concept document criticises NCRP for shipping a contrast toggle and a
 * link to download NVDA as its entire accessibility story. That critique is
 * about a toggle being offered *instead of* a considered design — not about
 * the toggle itself. For a 68-year-old with low vision, being able to make
 * the text bigger is genuinely useful on top of good defaults, so Rok ships
 * both: the design does the work, and these adjust it further.
 *
 * Preferences are applied to the document root and remembered, so they
 * survive the reload that also restores an in-progress case.
 */
const TEXT_SIZES = ["normal", "large", "largest"];
const STORAGE_KEY = "rok:display";

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function AccessibilityMenu({ t }) {
  const stored = useRef(readStored()).current;
  const [textSize, setTextSize] = useState(stored?.textSize ?? "normal");
  const [highContrast, setHighContrast] = useState(stored?.highContrast ?? false);
  const [open, setOpen] = useState(false);
  const panel = useRef(null);
  const trigger = useRef(null);

  useEffect(() => {
    document.documentElement.dataset.textSize = textSize;
    document.documentElement.dataset.contrast = highContrast ? "high" : "normal";
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ textSize, highContrast }));
    } catch {
      /* A display preference is never worth failing over. */
    }
  }, [textSize, highContrast]);

  useEffect(() => {
    if (!open) return undefined;
    const onDocument = (event) => {
      if (!panel.current?.contains(event.target) && !trigger.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKey = (event) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener("mousedown", onDocument);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocument);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="a11y">
      <button
        ref={trigger}
        className="rok-icon-btn"
        type="button"
        aria-expanded={open}
        aria-label={t("display.title")}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="textSize" size={20} />
      </button>

      {open && (
        <div className="a11y__panel" ref={panel}>
          <fieldset className="a11y__group">
            <legend>{t("display.text_size")}</legend>
            <div className="a11y__sizes">
              {TEXT_SIZES.map((size, index) => (
                <button
                  key={size}
                  type="button"
                  className="a11y__size"
                  aria-pressed={textSize === size}
                  onClick={() => setTextSize(size)}
                >
                  <span style={{ fontSize: `${0.9 + index * 0.35}rem` }}>A</span>
                  <span className="rok-sr-only">{t(`display.size_${size}`)}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            className="a11y__toggle"
            aria-pressed={highContrast}
            onClick={() => setHighContrast((value) => !value)}
          >
            <Icon name={highContrast ? "check" : "contrast"} size={20} />
            {t("display.high_contrast")}
          </button>
        </div>
      )}
    </div>
  );
}
