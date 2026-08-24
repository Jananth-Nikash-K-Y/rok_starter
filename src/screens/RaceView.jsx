import Button from "../components/Button.jsx";
import Icon from "../components/Icon.jsx";
import "./RaceView.css";

/**
 * Screen 10 — the Race.
 *
 * The pitch screen. The same complaint, structured for the investigator on
 * the left and for the money on the right. Content is the field mapping in
 * docs/DESIGN_SUMMARY.md, Appendix B — every row is a real NCRP mandatory
 * field, not an illustrative one.
 */
const FIELD_MAP = [
  { field: "Category of complaint", ncrp: "Chosen from a dropdown", rok: "Inferred from one icon tap" },
  { field: "Sub-category", ncrp: "Chosen from a dropdown", rok: "Inferred from the same tap" },
  { field: "State / UT", ncrp: "Selected by the complainant", rok: "Inferred, then confirmed with one yes" },
  { field: "Incident date and time", ncrp: "Typed", rok: "Read from the bank message" },
  { field: "Fraud amount", ncrp: "Typed", rok: "Read from the bank message" },
  { field: "Bank / wallet", ncrp: "Typed or selected", rok: "Read from the bank message" },
  { field: "12-digit transaction ID", ncrp: "Located, then typed", rok: "Read from the bank message" },
  { field: "Victim account number", ncrp: "Typed", rok: "Last four digits only, never the full number" },
  { field: "Description, 200+ characters", ncrp: "Written by the victim", rok: "Composed, then read back for yes or no" },
  { field: "Government photo ID", ncrp: "Scanned and uploaded", rok: "Deferred until after the freeze request" },
];

const CONTRAST = [
  { label: "Steps to a filed complaint", ncrp: "~21", rok: "4" },
  { label: "Words the victim types", ncrp: "200+", rok: "0" },
  { label: "Languages offered", ncrp: "2", rok: "Any, by recognition" },
  { label: "If you stop halfway", ncrp: "No complaint exists", rok: "A timestamped case exists" },
];

export default function RaceView({ t, onBack }) {
  return (
    <section className="rok-container rok-screen race">
      <Button variant="ghost" icon="arrowLeft" onClick={onBack}>{t("raceView.back")}</Button>

      <header className="race__header">
        <h1 className="race__title">{t("raceView.title")}</h1>
        <p className="rok-support">{t("raceView.subtitle")}</p>
      </header>

      <div className="race__contrast">
        {CONTRAST.map((row) => (
          <div className="race__stat" key={row.label}>
            <p className="race__stat-label">{row.label}</p>
            <div className="race__stat-values">
              <span className="race__stat-ncrp">{row.ncrp}</span>
              <Icon name="arrowRight" size={18} />
              <span className="race__stat-rok">{row.rok}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="race__table-wrap">
        <table className="race__table">
          <caption className="rok-sr-only">{t("raceView.table_caption")}</caption>
          <thead>
            <tr>
              <th scope="col">{t("raceView.field_column")}</th>
              <th scope="col">{t("raceView.ncrp_column")}</th>
              <th scope="col">{t("raceView.rok_column")}</th>
            </tr>
          </thead>
          <tbody>
            {FIELD_MAP.map((row) => (
              <tr key={row.field}>
                <th scope="row">{row.field}</th>
                <td className="race__cell-ncrp">{row.ncrp}</td>
                <td className="race__cell-rok">{row.rok}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="race__source">{t("raceView.source_note")}</p>

      <footer className="rok-footer">
        <p>{t("footer.not_official")}</p>
      </footer>
    </section>
  );
}
