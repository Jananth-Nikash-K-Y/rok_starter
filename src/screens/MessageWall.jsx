import { useEffect, useRef, useState } from "react";
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

/** Two entries are the same payment if they share a reference number, or —
 * for a reference-less message — the exact same raw text. */
function sameTransaction(a, b) {
  if (a.parsed.utr && b.parsed.utr) return a.parsed.utr === b.parsed.utr;
  return a.raw === b.raw;
}

/**
 * Screen 3 — the Message Wall (mechanic M2).
 *
 * The one question that replaces the UTR field: "which one is the wrong
 * one?" Recognition is the only cognitive function that survives panic,
 * age, low literacy, blindness and an unfamiliar script, so everything the
 * user needs to recognise a transaction is on the card — above all the
 * amount, in full. Masking those digits would remove the only cue they
 * have and break the mechanic this screen exists for.
 *
 * This used to be pick-one-then-loop: select a message, review it, then a
 * separate screen asked "only this one, or were there more?", looping back
 * here for each additional payment. A victim who recognises three wrong
 * payments at a glance should not have to make that trip three times, so
 * selection is multiple by default — tap every payment that is wrong, then
 * continue once, however many there are.
 *
 * Two local phases, no state-machine involvement until the very end:
 * 'select' (tick every wrong payment) and 'review' (check and correct each
 * one before it becomes evidence). Only the final confirm in 'review'
 * reaches the reducer, via CONFIRM_TRANSACTIONS.
 */
export default function MessageWall({ send, t, locale, caseData }) {
  const [parsedInbox, setParsedInbox] = useState([]);
  const [ocrState, setOcrState] = useState("idle");
  const fileInput = useRef(null);
  const [phase, setPhase] = useState("select");

  /* Seeded from the case, not from scratch: if the user is back here after
     rejecting the read-back, or after using Back to revert a later choice,
     whatever was already confirmed reappears ticked rather than forcing a
     re-pick from zero. */
  const [selected, setSelected] = useState(() =>
    caseData.transactions.map((transaction, index) => ({
      id: transaction.utr || `existing-${index}`,
      raw: transaction.raw || "",
      parsed: transaction,
    })),
  );
  const [corrections, setCorrections] = useState({});
  const [reviewIndex, setReviewIndex] = useState(0);
  const touchStartX = useRef(null);

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
        .filter((entry) => entry.parsed !== null && entry.parsed.direction !== "credit"),
    );
  }, []);

  const isSelected = (entry) => selected.some((row) => sameTransaction(row, entry));

  const toggle = (entry) => {
    setSelected((current) => (
      current.some((row) => sameTransaction(row, entry))
        ? current.filter((row) => !sameTransaction(row, entry))
        : [...current, entry]
    ));
  };

  const remove = (entry) => {
    setSelected((current) => current.filter((row) => !sameTransaction(row, entry)));
  };

  /* Removing a card mid-review can leave the index pointing past the end
     of the (now shorter) deck; clamp it back onto the last remaining one. */
  useEffect(() => {
    setReviewIndex((current) => Math.min(current, Math.max(selected.length - 1, 0)));
  }, [selected.length]);

  const available = parsedInbox.filter((entry) => !isSelected(entry));
  const total = selected.reduce((sum, entry) => sum + (entry.parsed.amount ?? 0), 0);

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
    /* Straight into the selected set — a screenshot the user chose to
       upload is, by definition, the one they mean to report. */
    setSelected((current) => [...current, { id: `ocr-${Date.now()}`, raw: parsed.raw, parsed }]);
  };

  /* One card in view at a time on the review screen instead of a long
     stack — several disputed payments read easier as a swipe-through deck
     than as an ever-growing scroll, and the total sits above it, outside
     any single card, so it never reads as belonging to just the one in
     view. Only the current card is rendered (not a row of every card with
     the rest scrolled off-screen), so a short card never sits inside a
     box sized for a taller sibling — swiping never leaves dead space
     underneath it. */
  const goToIndex = (index) => {
    setReviewIndex(Math.min(Math.max(index, 0), selected.length - 1));
  };

  const onTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const onTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    goToIndex(delta > 0 ? reviewIndex - 1 : reviewIndex + 1);
  };

  const confirmAll = () => {
    const transactions = selected.map((entry) => ({
      ...entry.parsed,
      ...corrections[entry.id],
      raw: entry.raw,
    }));
    send({ type: "CONFIRM_TRANSACTIONS", transactions });
  };

  if (phase === "review") {
    return (
      <Screen
        t={t}
        locale={locale}
        question={t("messageWall.receipt_title")}
        spokenKey="messageWall.receipt_title"
      >
        <div className="wall__review">
          {selected.length > 1 && (
            <p className="wall__review-total">
              <Icon name="rupee" size={18} />
              <span>{t("scope.total_label")}</span>
              <strong>{formatIndianCurrency(total)}</strong>
            </p>
          )}

          <div
            className="wall__review-slide"
            onTouchStart={selected.length > 1 ? onTouchStart : undefined}
            onTouchEnd={selected.length > 1 ? onTouchEnd : undefined}
          >
            <ReceiptCard
              key={selected[reviewIndex].id}
              entry={selected[reviewIndex]}
              correction={corrections[selected[reviewIndex].id]}
              onCorrect={(field, value) => setCorrections((current) => ({
                ...current,
                [selected[reviewIndex].id]: { ...current[selected[reviewIndex].id], [field]: value },
              }))}
              onRemove={() => remove(selected[reviewIndex])}
              t={t}
              locale={locale}
            />
          </div>

          {selected.length > 1 && (
            <div className="wall__review-nav">
              <button
                type="button"
                className="wall__review-nav-btn"
                disabled={reviewIndex === 0}
                aria-label={t("messageWall.previous_transaction")}
                onClick={() => goToIndex(reviewIndex - 1)}
              >
                <Icon name="arrowLeft" size={18} />
              </button>
              <span className="wall__review-nav-count" aria-live="polite">
                {t("messageWall.review_progress", { index: reviewIndex + 1, total: selected.length })}
              </span>
              <button
                type="button"
                className="wall__review-nav-btn"
                disabled={reviewIndex === selected.length - 1}
                aria-label={t("messageWall.next_transaction")}
                onClick={() => goToIndex(reviewIndex + 1)}
              >
                <Icon name="arrowRight" size={18} />
              </button>
            </div>
          )}
        </div>

        <div className="receipt__actions">
          <Button variant="quiet" icon="arrowLeft" onClick={() => setPhase("select")}>
            {t("messageWall.choose_different")}
          </Button>
          <Button variant="danger" iconAfter="arrowRight" onClick={confirmAll}>
            {t("messageWall.review_confirm")}
          </Button>
        </div>
      </Screen>
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
        {available.map((entry) => (
          <li key={entry.id}>
            <div className="wall__card">
              <button
                className="wall__select"
                type="button"
                onClick={() => toggle(entry)}
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

      {/* Everything ticked so far, plus the way forward. Sticky on a phone
          so it stays reachable without scrolling back up through a long
          list — see MessageWall.css. */}
      <div className={`wall__summary ${selected.length === 0 ? "wall__summary--empty" : ""}`}>
        {selected.length === 0 ? (
          <p className="wall__summary-hint" lang={locale}>{t("messageWall.select_hint")}</p>
        ) : (
          <>
            <ul className="wall__selected">
              {selected.map((entry) => (
                <li key={entry.id}>
                  <Icon name="check" size={16} />
                  <span className="wall__selected-amount">
                    {formatIndianCurrency(entry.parsed.amount) ?? t("messageWall.not_available")}
                  </span>
                  <span className="wall__selected-bank">
                    {entry.parsed.bank ?? t("messageWall.unknown_bank")}
                  </span>
                  <button
                    type="button"
                    className="wall__selected-remove"
                    onClick={() => remove(entry)}
                    aria-label={t("messageWall.remove_message", {
                      bank: entry.parsed.bank ?? t("messageWall.unknown_bank"),
                      amount: formatIndianCurrency(entry.parsed.amount) ?? "",
                    })}
                  >
                    <Icon name="cross" size={16} />
                  </button>
                </li>
              ))}
            </ul>

            {selected.length > 1 && (
              <p className="wall__summary-why" lang={locale}>
                <Icon name="shield" size={16} />
                {t("scope.why")}
              </p>
            )}

            <Button variant="danger" block iconAfter="arrowRight" onClick={() => setPhase("review")}>
              {t("messageWall.continue")}
            </Button>
          </>
        )}
      </div>
    </Screen>
  );
}

/**
 * One selected payment, shown back before it becomes evidence. Nothing is
 * submitted without this step, and every field stays editable — a wrong
 * identifier here could freeze an innocent person's account.
 */
function ReceiptCard({ entry, correction, onCorrect, onRemove, t, locale }) {
  const parsed = { ...entry.parsed, ...correction };
  const edited = Boolean(correction && Object.keys(correction).length > 0);

  const rows = [
    { key: "amount", label: t("messageWall.amount"), value: formatIndianCurrency(parsed.amount), editable: true, raw: parsed.amount },
    { key: "bank", label: t("messageWall.bank"), value: parsed.bank, editable: true, raw: parsed.bank },
    { key: "timestamp", label: t("messageWall.timestamp"), value: formatIndianDateTime(parsed.timestamp, parsed.timeKnown) },
    { key: "accountTail", label: t("messageWall.account_tail"), value: formatMaskedAccount(parsed.accountTail) },
    { key: "utr", label: t("messageWall.reference"), value: parsed.utr, editable: true, raw: parsed.utr },
    { key: "beneficiaryVpa", label: t("messageWall.beneficiary"), value: parsed.beneficiaryVpa },
  ];

  return (
    <article className="receipt receipt--card">
      <div className="receipt__headline">
        <span className="receipt__amount">
          {formatIndianCurrency(parsed.amount) ?? t("messageWall.not_available")}
        </span>
        <span className="receipt__bank">{parsed.bank ?? t("messageWall.unknown_bank")}</span>
        <button
          type="button"
          className="receipt__remove"
          onClick={onRemove}
          aria-label={t("messageWall.remove_message", {
            bank: parsed.bank ?? t("messageWall.unknown_bank"),
            amount: formatIndianCurrency(parsed.amount) ?? "",
          })}
        >
          <Icon name="cross" size={16} />
        </button>
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
    </article>
  );
}
