"use client";
import { motion, useReducedMotion } from "framer-motion";

const ease = [0.25, 0.1, 0.25, 1];
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.94 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.65, ease } } };
const slideLeft = { hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease } } };
const slideRight = { hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0, transition: { duration: 0.55, ease } } };
const vp = { once: true, amount: 0.18, margin: "0px 0px -50px 0px" };

function Wrap({ children, className, variants: v = stagger, ...rest }) {
  const skip = useReducedMotion();
  if (skip) return <div className={className} {...rest}>{children}</div>;
  return <motion.div className={className} variants={v} initial="hidden" whileInView="visible" viewport={vp} {...rest}>{children}</motion.div>;
}
function Item({ children, className, variants: v = fadeUp, ...rest }) {
  const skip = useReducedMotion();
  if (skip) return <div className={className} {...rest}>{children}</div>;
  return <motion.div className={className} variants={v} {...rest}>{children}</motion.div>;
}
function ScaleItem({ children, className, ...rest }) {
  return <Item className={className} variants={scaleIn} {...rest}>{children}</Item>;
}

export { Wrap as LandingStagger, Item as LandingFadeUp, ScaleItem as LandingScale, slideLeft, slideRight, fadeUp, scaleIn };
