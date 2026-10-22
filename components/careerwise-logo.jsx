/** A rising path through layered hills, drawn to stay clear at small sizes. */
export function CareerWiseLogo({ className = "h-10 w-10", ariaLabel, ...props }) {
  return <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}
    aria-hidden={ariaLabel ? undefined : true} aria-label={ariaLabel} role={ariaLabel ? "img" : undefined} {...props}>
    <rect x="1" y="1" width="46" height="46" rx="14" fill="var(--cw-logo-tile, #405b48)"/>
    <path d="M7 31c8-10 13-13 21-10 5 2 9 2 13-1v15c-12 7-23 6-34 1Z" fill="var(--cw-logo-ink, #fff9e9)" opacity=".22"/>
    <path d="M11 38c0-8 21-9 21-16 0-5-9-6-9-12 0 7 4 9 4 13 0 5-20 6-20 15Z" fill="var(--cw-logo-ink, #fff9e9)"/>
    <path d="m23 8-4 6m4-6 5 5" stroke="var(--cw-logo-ink, #fff9e9)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}
export default CareerWiseLogo;
