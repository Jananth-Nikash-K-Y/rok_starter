import { useEffect, useRef } from "react";
import Button from "./Button.jsx";
import Icon from "./Icon.jsx";

/**
 * The one confirmation dialog in the app.
 *
 * Cancelling a report — abandoning it mid-flow, or starting a fresh one
 * from the green screen — is the only destructive action Rok has, and a
 * case exists nowhere but this browser. So every path to it goes through
 * the same modal rather than each screen inventing its own confirm
 * pattern: one thing to get right, one thing for a screen reader user to
 * learn.
 *
 * Deliberately not a full focus trap — this is a two-button dialog open
 * for seconds, not a form — but focus does move in on open and back to
 * whatever opened it on close, and Escape dismisses. The overlay does not
 * dismiss on click: a backdrop click is easy to trigger by accident on a
 * shaking hand, and this is the one place in the app where an accidental
 * dismissal would look like the confirmation itself.
 */
export default function ConfirmDialog({ open, title, body, confirmLabel, keepLabel, onConfirm, onDismiss }) {
  const dialogRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    if (open) {
      openerRef.current = document.activeElement;
      dialogRef.current?.focus({ preventScroll: true });
    } else {
      openerRef.current?.focus?.({ preventScroll: true });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onDismiss();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onDismiss]);

  if (!open) return null;

  return (
    <div className="confirm-dialog__overlay">
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        tabIndex={-1}
        ref={dialogRef}
      >
        <div className="confirm-dialog__icon">
          <Icon name="alert" size={22} />
        </div>
        <h2 id="confirm-dialog-title" className="confirm-dialog__title">{title}</h2>
        <p className="confirm-dialog__body">{body}</p>
        <div className="confirm-dialog__actions">
          <Button variant="quiet" block onClick={onDismiss}>{keepLabel}</Button>
          <Button variant="danger" block onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
