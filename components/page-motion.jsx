"use client";

import { usePathname } from "next/navigation";

/** Shared, short route entrance. Content never waits for an exit animation. */
export default function PageMotion({ children, className = "" }) {
  const pathname = usePathname();
  return <div key={pathname} className={`${className} cw-route-enter`}>
    {children}
  </div>;
}
