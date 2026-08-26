/**
 * One icon system for the whole app: 24x24 grid, 2px stroke, round caps,
 * currentColor. Mixing icon styles (or mixing emoji with SVG) is the
 * fastest way to make an interface look assembled rather than designed,
 * so every glyph in Rok comes from this file.
 *
 * Icons are decorative by default (aria-hidden). The accessible name
 * belongs on the control that wraps them.
 */

/* 1.6 rather than 2. A two-pixel stroke on a 24 grid reads heavy and
   slightly crude next to text set in Inter; 1.6 sits at the same optical
   weight as a 600 label, which is what makes a set look drawn rather than
   assembled. Contrast is unaffected — these are never the only signal. */
const BASE = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": "true",
  focusable: "false",
};

const PATHS = {
  palm: (
    <>
      <path d="M8 11V5.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M11 11V4.5a1.5 1.5 0 0 1 3 0V11" />
      <path d="M14 11V5.5a1.5 1.5 0 0 1 3 0V12" />
      <path d="M8 11V9a1.5 1.5 0 0 0-3 0v5a7 7 0 0 0 7 7h1a6 6 0 0 0 6-6v-3" />
    </>
  ),
  phone: <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L14 13l5 2v3a2 2 0 0 1-2.2 2A16 16 0 0 1 3 6.2 2 2 0 0 1 5 4Z" />,
  phoneOff: (
    <>
      <path d="M11 6.2A16 16 0 0 1 21 16v2a2 2 0 0 1-2.2 2 15 15 0 0 1-4.3-1" />
      <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 3 3.6" />
      <path d="M3 3l18 18" />
    </>
  ),
  message: <path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.5-4.5A8 8 0 1 1 21 12Z" />,
  whatsapp: (
    <>
      <path d="M21 12a9 9 0 0 1-13.3 7.9L3 21l1.2-4.5A9 9 0 1 1 21 12Z" />
      <path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1-.5 1-1l-1.3-.8-1 .8a5 5 0 0 1-2.2-2.2l.8-1L11 9.5c0-.5-.4-1-1-1s-1 .4-1 1Z" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 0 0-5.7-5.7L11.5 6" />
      <path d="M14 11a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 0 0 5.7 5.7l1.1-1.1" />
    </>
  ),
  speaker: (
    <>
      <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" />
      <path d="M15.5 9.5a3.5 3.5 0 0 1 0 5" />
      <path d="M18 7a7 7 0 0 1 0 10" />
    </>
  ),
  speakerOff: (
    <>
      <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" />
      <path d="m16 10 4 4M20 10l-4 4" />
    </>
  ),
  check: <path d="m4 12.5 5 5L20 6.5" />,
  cross: <path d="M6 6l12 12M18 6 6 18" />,
  upload: (
    <>
      <path d="M12 16V4" />
      <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v6c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6l-7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.5l3.5 2" />
    </>
  ),
  rupee: (
    <>
      <path d="M7 4h10" />
      <path d="M7 9h10" />
      <path d="M7 4c5 0 5 5 0 5" />
      <path d="M7 9c6 0 8 3 8 5s-2 6-8 6" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M16 6a3 3 0 0 1 0 6" />
      <path d="M18 14a6 6 0 0 1 3 5" />
    </>
  ),
  location: (
    <>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  document: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </>
  ),
  arrowRight: <path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5" />,
  arrowLeft: <path d="M20 12H5m0 0 5.5-5.5M5 12l5.5 5.5" />,
  alert: (
    <>
      <path d="M12 4 2.5 20h19L12 4Z" />
      <path d="M12 10v4.5" />
      <circle cx="12" cy="17.5" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  textSize: (
    <>
      <path d="M3 18 8 6l5 12" />
      <path d="M4.6 14.5h6.8" />
      <path d="M14 18l3.5-8 3.5 8" />
      <path d="M15.1 15.6h4.8" />
    </>
  ),
  contrast: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18a9 9 0 0 0 0-18Z" fill="currentColor" stroke="none" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 9h17M3.5 15h17" />
      <path d="M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
    </>
  ),
};

export default function Icon({ name, size = 24, className }) {
  const path = PATHS[name];
  if (!path) return null;
  /* Scale the stroke with the glyph so a 14px icon does not look hairline
     and a 40px one does not look bloated. */
  const strokeWidth = size >= 32 ? 1.5 : size <= 16 ? 1.9 : 1.6;
  return (
    <svg {...BASE} width={size} height={size} strokeWidth={strokeWidth} className={className}>
      {path}
    </svg>
  );
}
