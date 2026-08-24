/**
 * Placeholder root component.
 *
 * Phase 0 (see docs/BUILD_BRIEF.md, section 9) replaces this with real
 * routing between screens, driven by src/state/machine.js. Leaving this
 * as an intentionally minimal placeholder rather than building it here,
 * so the first meaningful diff in this repo's history is Codex's.
 */
export default function App() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        textAlign: "center",
        padding: "2rem",
        gap: "0.5rem",
      }}
    >
      <h1 style={{ fontFamily: "var(--rok-font-display)", color: "var(--rok-ink)" }}>
        Rok
      </h1>
      <p style={{ color: "var(--rok-grey)", maxWidth: "32ch" }}>
        Scaffold ready. See <code>docs/BUILD_BRIEF.md</code> for Phase 0.
      </p>
    </main>
  );
}
