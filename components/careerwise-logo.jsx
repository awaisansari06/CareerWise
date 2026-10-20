/** A compact W with an upward finish, readable at favicon and navigation sizes. */
export function CareerWiseLogo({ className = "h-10 w-10", ariaLabel, ...props }) {
  return <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
    aria-hidden={ariaLabel ? undefined : true} aria-label={ariaLabel} role={ariaLabel ? "img" : undefined} {...props}>
    <rect x="1" y="1" width="46" height="46" rx="13" fill="var(--cw-logo-tile, #eef0f7)" stroke="var(--cw-line, #dddeda)"/>
    <path d="M10 15 16.5 33 24 20 31.5 33 38 14" stroke="var(--cw-logo-ink, #3459b7)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M31 14h7v7" stroke="var(--cw-logo-ink, #3459b7)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}
export default CareerWiseLogo;
