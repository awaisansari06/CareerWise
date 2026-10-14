import React from "react";

/** The CareerWise W mark: two rising folds and a north-point accent. */
export function CareerWiseLogo({ className = "h-9 w-9", ariaLabel, ...props }) {
  return (
    <svg viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden={ariaLabel ? undefined : "true"} aria-label={ariaLabel} role={ariaLabel ? "img" : undefined} {...props}>
      <path d="M28 58 42 34Q44 30 48 30H55Q58 30 60 34L69 50 59 68 49 49 39 68Z" className="fill-[#64748B] dark:fill-[#94A3B8]" />
      <path d="M5 30H18Q21 30 23 34L38 62 29 76H25Q21 76 19 72Z" className="fill-[#0076D0] dark:fill-[#4DB8FF]" />
      <path d="M49 49 59 68 79 21H94L72 73Q70 76 66 76H59Q55 76 53 72L40 49Z" className="fill-[#0076D0] dark:fill-[#4DB8FF]" />
      <path d="M86 2 97 19 86 14 75 19Z" className="fill-[#64748B] dark:fill-[#94A3B8]" />
    </svg>
  );
}

export default CareerWiseLogo;
