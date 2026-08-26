/**
 * The Rok mark.
 *
 * A raised palm — the universal "stop" — drawn as solid geometry rather
 * than an outline icon so it holds up at 20px in a masthead and at 96px on
 * the opening screen. Four fingers and a thumb reduced to rounded bars,
 * enclosed in a squircle that echoes the squared geometry of the interface.
 *
 * Deliberately not any state insignia: the State Emblem, the Ashoka Chakra
 * and the national flag are restricted under the State Emblem of India Act,
 * 2005, and this is not an official Government of India product.
 */
export default function Logo({ size = 32, className, title }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role={title ? "img" : undefined}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : "true"}
      focusable="false"
    >
      <rect width="48" height="48" rx="11" fill="currentColor" />
      <g fill="var(--rok-logo-ink, #ffffff)">
        {/* Three standing fingers, the middle one tallest. */}
        <rect x="17.4" y="10.5" width="4.2" height="15" rx="2.1" />
        <rect x="23.2" y="8" width="4.2" height="17.5" rx="2.1" />
        <rect x="29" y="11.5" width="4.2" height="14" rx="2.1" />
        {/* The thumb, angled across the palm. */}
        <rect
          x="11.4"
          y="16.6"
          width="4.2"
          height="11"
          rx="2.1"
          transform="rotate(-20 13.5 22.1)"
        />
        {/* The heel of the hand. */}
        <path d="M13.6 24.4h20.2v6.1a10.1 10.1 0 0 1-10.1 10.1h0a10.1 10.1 0 0 1-10.1-10.1v-6.1Z" />
      </g>
    </svg>
  );
}
