import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";
import Icon from "../components/Icon.jsx";
import { announce } from "../engines/a11yBus.js";
import "./CalmMode.css";

/**
 * Screen 9 — Calm Mode.
 *
 * Everything the Golden Hour clock refused to ask for. This screen is
 * deliberately unhurried: no countdown, no red, no progress rail. The
 * contrast with the first sixty seconds is the argument — these fields
 * were never urgent, and NCRP asking for them up front is what costs the
 * money.
 *
 * The ID photograph is held in memory for this session only. It is never
 * uploaded, and never written to localStorage (see App.jsx).
 */
export default function CalmMode({ send, t, locale, caseData }) {
  const [address, setAddress] = useState(caseData.address ?? "");
  const [idFile, setIdFile] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    announce(t("calmMode.heading"), { locale });
  }, [t, locale]);

  const save = () => {
    send({ type: "SAVE_CALM_DETAILS", address: address.trim() || null, idAttachment: idFile });
    setSaved(true);
  };

  return (
    <section className="rok-container rok-screen calm">
      <header className="calm__header">
        <h1 className="calm__heading" lang={locale}>{t("calmMode.heading")}</h1>
        <p className="rok-support" lang={locale}>{t("calmMode.support")}</p>
      </header>

      <div className="calm__panel">
        <h2 className="rok-card__title">
          <Icon name="camera" size={20} />
          {t("calmMode.id_prompt")}
        </h2>
        <p className="calm__note" lang={locale}>{t("calmMode.id_note")}</p>

        <label className="calm__file">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => { setIdFile(event.target.files?.[0] ?? null); setSaved(false); }}
          />
          <span className="calm__file-label">
            {idFile?.name ?? caseData.idAttachmentName ?? t("calmMode.choose_file")}
          </span>
        </label>
      </div>

      <div className="calm__panel">
        <h2 className="rok-card__title">
          <Icon name="location" size={20} />
          {t("calmMode.address_label")}
        </h2>
        <label className="calm__field">
          <span className="rok-sr-only">{t("calmMode.address_label")}</span>
          <textarea
            rows={3}
            value={address}
            placeholder={t("calmMode.address_placeholder")}
            onChange={(event) => { setAddress(event.target.value); setSaved(false); }}
          />
        </label>
      </div>

      <div className="calm__privacy">
        <Icon name="shield" size={18} />
        <span lang={locale}>{t("calmMode.privacy")}</span>
      </div>

      <div className="calm__actions">
        <Button variant="ghost" icon="arrowLeft" onClick={() => send({ type: "EXIT_CALM_MODE" })}>
          {t("calmMode.back_button")}
        </Button>
        <Button variant="primary" icon="check" onClick={save}>
          {t("calmMode.save_button")}
        </Button>
      </div>

      {saved && (
        <p className="calm__saved" role="status" lang={locale}>
          <Icon name="check" size={16} />
          {t("calmMode.saved_status")}
        </p>
      )}
    </section>
  );
}
