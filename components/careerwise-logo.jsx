import React from "react";

/**
 * CareerWise Official Logo Mark
 * Features a bold C glyph integrated with an upward zigzag momentum arrow.
 * Adapts seamlessly between Light Mode (#0066CC / #64748B) and Dark Mode (#4DB8FF / #94A3B8).
 */
export function CareerWiseLogo({
  /** Any Tailwind / CSS class for sizing, e.g. "h-9 w-9" */
  className = "h-9 w-9",
  ariaLabel,
  ...props
}) {
  return (
    <svg
      viewBox="22 15 30 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={ariaLabel ? undefined : "true"}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
      {...props}
    >
      {/* Bold C shape */}
      <path
        d="M38 18C30 18 24 23 24 32C24 41 30 46 38 46C42 46 45 44 48 41L48 38C46 40 43 41 39 41C34 41 30 38 30 32C30 26 34 23 39 23C43 23 46 25 48 28V25C45 22 42 18 38 18Z"
        className="fill-[#0066CC] dark:fill-[#4DB8FF] transition-colors duration-200"
      />
      {/* Zigzag arrow */}
      <path
        d="M26 38L32 28L38 36L48 22"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-[#64748B] dark:stroke-[#94A3B8] transition-colors duration-200"
      />
      {/* Arrow head */}
      <path
        d="M42 18L48 22L46 27"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-[#64748B] dark:stroke-[#94A3B8] transition-colors duration-200"
      />
    </svg>
  );
}

export default CareerWiseLogo;

