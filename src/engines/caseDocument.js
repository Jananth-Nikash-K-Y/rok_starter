/**
 * The complaint record a victim carries away.
 *
 * WHY THIS IS RENDERED FROM THE DOM RATHER THAN DRAWN WITH jsPDF TEXT CALLS
 *
 * jsPDF's built-in fonts are Latin-1, and even with a TTF embedded it does
 * no complex-script shaping: Devanagari conjuncts and matra reordering do
 * not happen, Tamil ligatures do not form. A Hindi complaint drawn that way
 * comes out visibly garbled — in a document someone hands to a police
 * station. That is worse than useless.
 *
 * So the localised page is laid out as real DOM, shaped correctly by the
 * browser's own text engine, and rasterised. The trade is that page one is
 * an image rather than selectable text, which is why page two carries the
 * same case as native, selectable, copyable Latin text for the officer
 * receiving it. A reader gets a document in their language; an officer gets
 * data they can lift.
 */

import { caseReferenceFrom } from "../state/machine.js";
import { buildNcrpPacket } from "./outputs.js";
import { composeNarrative, composeReadBackSentences } from "./narrative.js";
import {
  formatIndianCurrency,
  formatIndianDateTime,
  formatMaskedAccount,
} from "../i18n/format.js";
import { localeMeta } from "../i18n/locales.js";

const A4_WIDTH_PX = 794;   /* 210mm at 96dpi */
const A4_HEIGHT_MM = 297;
const A4_WIDTH_MM = 210;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[character]));
}

/** One row set per confirmed transaction, plus the case-level fields once
    at the end. A case built from several payments must show every one of
    them, not just the first the victim ticked. */
function transactionBlocks(caseObj, t) {
  const unknown = t("doc.unconfirmed");
  const transactions = caseObj.transactions?.length ? caseObj.transactions : [{}];

  const perTransaction = transactions.map((tx, index) => ({
    label: transactions.length > 1
      ? `${t("doc.s_transaction")} ${index + 1}`
      : t("doc.s_transaction"),
    rows: [
      [t("doc.f_amount"), formatIndianCurrency(tx.amount) ?? unknown],
      [t("doc.f_bank"), tx.bank ?? unknown],
      [t("doc.f_when"), formatIndianDateTime(tx.timestamp, tx.timeKnown) ?? unknown],
      [t("doc.f_account"), formatMaskedAccount(tx.accountTail) ?? unknown],
      [t("doc.f_reference"), tx.utr ?? unknown],
      [t("doc.f_beneficiary"), tx.beneficiaryVpa ?? unknown],
    ],
  }));

  const caseRows = [
    [t("doc.f_category"), caseObj.ncrpCategory ?? unknown],
    [t("doc.f_subcategory"), caseObj.ncrpSubCategory ?? unknown],
    [t("doc.f_state"), caseObj.stateUt ?? unknown],
  ];

  return { perTransaction, caseRows };
}

function tableHtml(rows) {
  return rows.map(([label, value]) => `
      <tr>
        <td style="padding:7px 0;border-bottom:1px solid #e7e7e3;color:#4a4f59;width:44%;vertical-align:top">${escapeHtml(label)}</td>
        <td style="padding:7px 0;border-bottom:1px solid #e7e7e3;font-weight:600;text-align:right">${escapeHtml(value)}</td>
      </tr>`).join("");
}

/**
 * The printable page, as an offscreen DOM node.
 * Styles are inline: html2canvas does not inherit the page's stylesheets
 * reliably, and this must render identically wherever it is called from.
 */
function buildPageNode(caseObj, t, locale) {
  const reference = caseReferenceFrom(caseObj.id);
  const meta = localeMeta(locale);
  const fontStack = {
    hi: "'Noto Sans Devanagari', sans-serif",
    ta: "'Noto Sans Tamil', sans-serif",
    te: "'Noto Sans Telugu', sans-serif",
  }[locale] ?? "'Instrument Sans Variable', 'Instrument Sans', sans-serif";

  const node = document.createElement("div");
  node.setAttribute("lang", locale);
  node.setAttribute("aria-hidden", "true");
  Object.assign(node.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: `${A4_WIDTH_PX}px`,
    background: "#ffffff",
    color: "#16181d",
    fontFamily: fontStack,
    fontSize: "13px",
    lineHeight: "1.6",
    padding: "48px",
    boxSizing: "border-box",
  });

  const { perTransaction, caseRows } = transactionBlocks(caseObj, t);

  const heading = (text) => `
    <h2 style="font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:#6b7079;
               margin:26px 0 10px;font-weight:700">${escapeHtml(text)}</h2>`;

  node.innerHTML = `
    <div style="border-bottom:2px solid #1b2f63;padding-bottom:14px;display:flex;
                justify-content:space-between;align-items:flex-end">
      <div>
        <div style="font-size:19px;font-weight:700;letter-spacing:-.02em">${escapeHtml(t("doc.title"))}</div>
        <div style="color:#6b7079;font-size:11px;margin-top:3px">
          ${escapeHtml(t("doc.prepared", { date: formatIndianDateTime(new Date().toISOString(), true) }))}
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:#6b7079">
          ${escapeHtml(t("doc.reference"))}
        </div>
        <div style="font-size:22px;font-weight:700;letter-spacing:.02em;font-variant-numeric:tabular-nums">
          ${escapeHtml(reference)}
        </div>
      </div>
    </div>

    <div style="color:#6b7079;font-size:11px;margin-top:10px">
      ${escapeHtml(t("doc.opened"))}: ${escapeHtml(formatIndianDateTime(caseObj.openedAt, true) ?? "")}
      &nbsp;·&nbsp; ${escapeHtml(meta.english)}
    </div>

    ${perTransaction.map((block) => `
      ${heading(block.label)}
      <table style="width:100%;border-collapse:collapse;font-size:13px">${tableHtml(block.rows)}</table>
    `).join("")}
    <table style="width:100%;border-collapse:collapse;font-size:13px">${tableHtml(caseRows)}</table>

    ${heading(t("doc.s_statement"))}
    <ul style="margin:0 0 14px;padding-left:18px;font-size:13px;line-height:1.7">
      ${composeReadBackSentences(caseObj, t)
        .map((sentence) => `<li style="margin-bottom:4px">${escapeHtml(sentence)}</li>`)
        .join("")}
    </ul>

    ${/* The portal accepts one script and one language. The complainant is
          told why the paragraph below is not in theirs, rather than being
          handed an English block with no explanation. */ ""}
    <div style="font-size:10px;color:#6b7079;margin-bottom:6px">${escapeHtml(t("doc.official_note"))}</div>
    <p style="margin:0;font-size:11.5px;line-height:1.7;text-align:justify;color:#16181d;
              background:#f8f8f6;border-left:2px solid #ccd2e2;padding:10px 12px">
      ${escapeHtml(composeNarrative(caseObj))}
    </p>

    ${heading(t("doc.s_action"))}
    <ol style="margin:0;padding-left:20px;font-size:13px">
      <li style="margin-bottom:7px">${escapeHtml(t("doc.a1"))}</li>
      <li style="margin-bottom:7px">${escapeHtml(t("doc.a2"))}</li>
      <li>${escapeHtml(t("doc.a3"))}</li>
    </ol>

    <div style="margin-top:26px;border:1px solid #eecdc7;background:#fdf2f0;
                padding:12px 14px;font-size:11px;line-height:1.65;color:#85160f">
      ${escapeHtml(t("doc.notfiled"))}
    </div>

    <div style="margin-top:22px;border-top:1px solid #e7e7e3;padding-top:10px;
                color:#6b7079;font-size:10px;display:flex;justify-content:space-between">
      <span>${escapeHtml(t("doc.generated"))}</span>
      <span>${escapeHtml(t("doc.notofficial"))}</span>
    </div>`;

  return node;
}

/**
 * @returns {Promise<Blob>} a two-page A4 PDF: the localised record, then
 *   the same case as selectable Latin text.
 */
export async function buildCaseDocument(caseObj, t, locale) {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const node = buildPageNode(caseObj, t, locale);
  document.body.appendChild(node);

  try {
    /* Wait for the script's webfont before rasterising, or the page is
       captured in a fallback face. */
    if (document.fonts?.ready) await document.fonts.ready;

    const canvas = await html2canvas(node, {
      scale: 2,
      backgroundColor: "#ffffff",
      logging: false,
      useCORS: true,
    });

    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const imageHeight = (canvas.height * A4_WIDTH_MM) / canvas.width;
    pdf.addImage(
      canvas.toDataURL("image/jpeg", 0.92),
      "JPEG",
      0,
      0,
      A4_WIDTH_MM,
      Math.min(imageHeight, A4_HEIGHT_MM),
    );

    /* Page two: native text, so an officer can select and copy it. Latin
       only by construction — this is the machine-readable half. */
    pdf.addPage();
    const packet = buildNcrpPacket(caseObj);
    let y = 20;
    pdf.setFont("helvetica", "bold").setFontSize(13);
    pdf.text(t("doc.data_page").replace(/[^\x20-\x7E]/g, "") || "Structured record", 15, y);
    pdf.setFont("helvetica", "normal").setFontSize(9);
    y += 9;

    Object.entries(packet).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      const label = key.replace(/^_/, "").replace(/([A-Z])/g, " $1").toLowerCase();
      const lines = pdf.splitTextToSize(`${label}: ${value}`, 180);
      if (y + lines.length * 4.6 > 280) { pdf.addPage(); y = 20; }
      pdf.text(lines, 15, y);
      y += lines.length * 4.6 + 1.6;
    });

    return pdf.output("blob");
  } finally {
    node.remove();
  }
}

export { buildPageNode };
