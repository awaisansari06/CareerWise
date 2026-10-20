"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

/** Shared, short route entrance. Content never waits for an exit animation. */
export default function PageMotion({ children, className = "" }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  return <motion.div key={pathname} className={className}
    initial={reduced ? false : { opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}>
    {children}
  </motion.div>;
}
