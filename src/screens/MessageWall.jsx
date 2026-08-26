import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../components/Button.jsx";
import ConfidenceBadge from "../components/ConfidenceBadge.jsx";
import Icon from "../components/Icon.jsx";
import Screen from "../components/Screen.jsx";
import { announce } from "../engines/a11yBus.js";
import { parseTransactionImage, parseTransactionSms } from "../engines/smsParser.js";
import { SAMPLE_INBOX } from "../fixtures/sampleSms.js";
import {
  formatIndianCurrency,
  formatIndianDateTime,
  formatMaskedAccount,
} from "../i18n/format.js";
import "./MessageWall.css";

/**
 * Screen 3 — the Message Wall (mechanic M2).
 *
 * The one question that replaces the UTR field: "which one is the wrong
 * one?" Recognition is the only cognitive function that survives panic,
 * age, low literacy, blindness and an unfamiliar script, so everything the
 * user needs to recognise a transaction is on the card — above all the
 * amount, in full. Masking those digits would remove the only cue they
 * have and break the mechanic this screen exists for.
 */
export default function MessageWall({ send, t, locale, caseData }) {
  const [parsedInbox, setParsedInbox] = useState([]);
  const [selected, setSelected] = useState(null);
  const [ocrState, setOcrState] = useState("idle");
  const alreadyCaptured = useMemo(
    () => new Set(caseData.transactions.map((transaction) => transaction.utr ?? transaction.raw)),
    [caseData.transactions],
  );
  const [corrections, setCorrections] = useState({});
  const fileInput = useRef(null);

  useEffect(() => {
    setParsedInbox(
      SAMPLE_INBOX.map((message) => ({
        id: message.id,
        raw: message.text,
        parsed: parseTransactionSms(message.text),
      }))
        /* Money arriving is not a fraud to report, and offering it would
           only give a frightened user a wrong answer to tap. Credits are
           still parsed — they are simply never shown here. */
        .filter((entry) => entry.parsed !== null && entry.parsed.direction !== "credit")
        /* After "there were more", a payment already in the case must not
           be offered again: adding it twice would double the reported
           amount and repeat the reference number in the complaint. */
        .filter((entry) => !alreadyCaptured.has(entry.parsed.utr ?? entry.raw)),
    );
  }, [alreadyCaptured]);

  const readAloud = (entry) => {
    const amount = formatIndianCurrency(entry.parsed.amount);
    announce(
      t("messageWall.spoken_card", {
        bank: entry.parsed.bank ?? t("messageWall.unknown_bank"),
        amount: amount ?? t("messageWall.not_available"),
        when: formatIndianDateTime(entry.parsed.timestamp, entry.parsed.timeKnown) ?? "",
      }),
      { locale, speak: true },
    );
  };

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setOcrState("reading");
    announce(t("messageWall.ocr_reading"), { locale });
    const parsed = await parseTransactionImage(file);

    if (!parsed) {
      setOcrState("failed");
      announce(t("messageWall.ocr_unrecognized"), { locale });
      return;
    }

    setOcrState("idle");
    setSelected({ id: "ocr", raw: parsed.raw, parsed });
  };

  const confirmSelection = () => {
    send({ type: "SELECT_MESSAGE", message: { ...selected.parsed, ...corrections, raw: selected.raw } });
  };

  if (selected) {
    return (
      <Receipt
        entry={selected}
        corrections={corrections}
        onCorrect={(field, value) => setCorrections((current) => ({ ...current, [field]: value }))}
        onConfirm={confirmSelection}
        onBack={() => { setSelected(null); setCorrections({}); }}
        t={t}
        locale={locale}
      />
    );
  }

  return (
    <Screen
      t={t}
      locale={locale}
      question={t("messageWall.title")}
      spokenKey="messageWall.title"
      why={t("messageWall.why")}
    >
      <p className="wall__demo">
        <span className="rok-badge rok-badge--demo">{t("messageWall.demo_label")}</span>
      </p>

      <ul className="wall__list">
        {parsedInbox.map((entry) => (
          <li key={entry.id}>
            <div className="wall__card">
              <button
                className="wall__select"
                type="button"
                onClick={() => setSelected(entry)}
                aria-label={t("messageWall.select_message", {
                  bank: entry.parsed.bank ?? t("messageWall.unknown_bank"),
                  amount: formatIndianCurrency(entry.parsed.amount) ?? "",
                })}
              >
                <span className="wall__bank">
                  {entry.parsed.bank ?? t("messageWall.unknown_bank")}
                </span>
                {/* The recognition cue. Never masked. */}
                <span className="wall__amount">
                  {formatIndianCurrency(entry.parsed.amount) ?? t("messageWall.not_available")}
                </span>
                <span className="wall__when">
                  {formatIndianDateTime(entry.parsed.timestamp, entry.parsed.timeKnown)}
                  {!entry.parsed.timeKnown && entry.parsed.timestamp && (
                    <span className="wall__no-time"> · {t("messageWall.no_time")}</span>
                  )}
                </span>
                <span className="wall__snippet">{entry.raw}</span>
              </button>

              <button
                className="wall__speak"
                type="button"
                onClick={() => readAloud(entry)}
                aria-label={t("messageWall.read_message", {
                  bank: entry.parsed.bank ?? t("messageWall.unknown_bank"),
                })}
              >
                <Icon name="speaker" size={22} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="wall__upload">
        <p className="wall__upload-title" lang={locale}>{t("messageWall.upload_screenshot")}</p>
        <p className="wall__upload-note" lang={locale}>{t("messageWall.upload_note")}</p>

        <input
          ref={fileInput}
          className="rok-sr-only"
          type="file"
          accept="image/*"
          id="rok-screenshot"
          onChange={handleUpload}
        />
        <Button
          variant="quiet"
          icon={ocrState === "reading" ? "clock" : "camera"}
          block
          disabled={ocrState === "reading"}
          onClick={() => fileInput.current?.click()}
        >
          {ocrState === "reading" ? t("messageWall.ocr_reading") : t("messageWall.upload_button")}
        </Button>

        {ocrState === "reading" && (
          <p className="wall__ocr-status" role="status" lang={locale}>
            <span className="wall__spinner" aria-hidden="true" />
            {t("messageWall.ocr_reading_detail")}
          </p>
        )}

        {ocrState === "failed" && (
          <p className="wall__ocr-error" role="alert" lang={locale}>
            <Icon name="alert" size={18} />
            {t("messageWall.ocr_unrecognized")}
          </p>
        )}
      </div>
    </Screen>
  );
}

/**
 * What we read out of the message, shown back before it becomes evidence.
 * Nothing is submitted without this step, and every field stays editable —
 * a wrong identifier here could freeze an innocent person's account.
 */
function Receipt({ entry, corrections, onCorrect, onConfirm, onBack, t, locale }) {
  const parsed = { ...entry.parsed, ...corrections };
  const edited = Object.keys(corrections).length > 0;

  useEffect(() => {
    announce(t("messageWall.receipt_title"), { locale });
  }, [t, locale]);

  const rows = [
    { key: "amount", label: t("messageWall.amount"), value: formatIndianCurrency(parsed.amount), editable: true, raw: parsed.amount },
    { key: "bank", label: t("messageWall.bank"), value: parsed.bank, editable: true, raw: parsed.bank },
    { key: "timestamp", label: t("messageWall.timestamp"), value: formatIndianDateTime(parsed.timestamp, parsed.timeKnown) },
    { key: "accountTail", label: t("messageWall.account_tail"), value: formatMaskedAccount(parsed.accountTail) },
    { key: "utr", label: t("messageWall.reference"), value: parsed.utr, editable: true, raw: parsed.utr },
    { key: "beneficiaryVpa", label: t("messageWall.beneficiary"), value: parsed.beneficiaryVpa },
  ];

  return (
    <section className="rok-container screen receipt">
      <p className="rok-eyebrow">
        <Icon name="document" size={14} />
        {t("messageWall.receipt_title")}
      </p>

      <div className="receipt__headline">
        <span className="receipt__amount">
          {formatIndianCurrency(parsed.amount) ?? t("messageWall.not_available")}
        </span>
        <span className="receipt__bank">{parsed.bank ?? t("messageWall.unknown_bank")}</span>
      </div>

      <ConfidenceBadge level={edited ? "corrected" : parsed.confidence} t={t} />

      {!parsed.timeKnown && parsed.timestamp && (
        <p className="receipt__caveat" lang={locale}>
          <Icon name="alert" size={16} />
          {t("messageWall.no_time_detail")}
        </p>
      )}

      <dl className="receipt__fields">
        {rows.map((row) => (
          <div className="receipt__row" key={row.key}>
            <dt>{row.label}</dt>
            <dd>{row.value ?? <span className="receipt__missing">{t("messageWall.not_available")}</span>}</dd>
          </div>
        ))}
      </dl>

      <details className="receipt__correct">
        <summary lang={locale}>{t("messageWall.something_wrong")}</summary>
        <div className="receipt__correct-body">
          {rows.filter((row) => row.editable).map((row) => (
            <label className="receipt__field" key={row.key}>
              <span>{row.label}</span>
              <input
                type={row.key === "amount" ? "number" : "text"}
                defaultValue={row.raw ?? ""}
                onChange={(event) => onCorrect(
                  row.key,
                  row.key === "amount"
                    ? (event.target.value === "" ? null : Number(event.target.value))
                    : (event.target.value || null),
                )}
              />
            </label>
          ))}
          <p className="receipt__correct-note" lang={locale}>{t("messageWall.correct_note")}</p>
        </div>
      </details>

      <div className="receipt__actions">
        {/* `quiet`, not `ghost`: beside a filled confirm button, a
            borderless one reads as secondary text rather than a control,
            and going back is a first-class choice here. */}
        <Button variant="quiet" icon="arrowLeft" onClick={onBack}>
          {t("messageWall.choose_different")}
        </Button>
        <Button variant="danger" iconAfter="arrowRight" onClick={onConfirm}>
          {t("messageWall.confirm_this")}
        </Button>
      </div>
    </section>
  );
}
