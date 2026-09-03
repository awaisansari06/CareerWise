import React from "react";

/**
 * CareerWise Official Logo Mark — Concept #1
 *
 * Geometry: A geometric "C" arc (cyan) whose right-side opening
 * naturally integrates with an ascending vertical arrow (electric blue).
 * The "C" sweeps from top-right, around the left, back to the right,
 * and the right terminal rises straight up into an arrowhead — making
 * the letter and the growth symbol one unified, seamless glyph.
 *
 * Palette:
 *  - Foundation tile: Deep navy  #0B132B / stroke #1E293B
 *  - C arc (subtle):  Cyan       #38BDF8
 *  - Arrow ascent:    Electric blue #2563EB
 *
 * Works cleanly at all sizes from 512px down to 16px favicon.
 */
export function CareerWiseLogo({
  /** Any Tailwind / CSS class for sizing, e.g. "h-8 w-8" */
  className = "h-8 w-8",
  /**
   * Provide a meaningful label when the logo is the only brand identity
   * on screen (e.g. auth pages). Leave undefined when next to the
   * "CAREERWISE" wordmark — screen-readers will skip it automatically.
   */
  ariaLabel,
  ...props
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={ariaLabel ? undefined : "true"}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
      {...props}
    >
      {/* Deep Navy Foundation — slightly rounded square */}
      <rect width="32" height="32" rx="7.5" fill="#0B132B" stroke="#1E293B" strokeWidth="1" />

      {/*
        C arc (cyan):
        Starts at the top-right open end (17.5, 9),
        sweeps horizontally left along the top cap,
        curves down and around through the left half,
        sweeps back along the bottom cap to (17.5, 23).
      */}
      <path
        d="M17.5 9H13C9.1 9 6 12.1 6 16C6 19.9 9.1 23 13 23H17.5"
        stroke="#38BDF8"
        strokeWidth="2.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/*
        Ascending growth arrow (electric blue):
        Rises vertically from the bottom opening of the C (17.5, 23)
        up through the center gap to the top, then forms an arrowhead.
        This visually "closes" the right side of the C with upward motion.
      */}
      <line
        x1="21"
        y1="23"
        x2="21"
        y2="10"
        stroke="#2563EB"
        strokeWidth="2.7"
        strokeLinecap="round"
      />
      {/* Arrowhead — pointing straight up */}
      <polyline
        points="17.5,13.5 21,9.5 24.5,13.5"
        stroke="#2563EB"
        strokeWidth="2.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default CareerWiseLogo;
