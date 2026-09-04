"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  fadeUpVariants,
  fadeInVariants,
  subtleScaleVariants,
  createStaggerContainer,
  staggerItemVariants,
  defaultViewport,
} from "@/lib/motion-variants";

/**
 * Viewport-triggered section container.
 * Coordinates child animations once scrolled into view.
 */
export function MotionSection({
  children,
  className,
  viewport = defaultViewport,
  delay = 0,
  stagger = 0.08,
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <section className={className} {...props}>
        {children}
      </section>
    );
  }

  const variants = createStaggerContainer(stagger, delay);

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.section>
  );
}

/**
 * Upward fade reveal component for headers, titles, and text blocks.
 */
export function MotionFadeUp({
  children,
  className,
  delay = 0,
  duration = 0.5,
  viewport = defaultViewport,
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeUpVariants}
      custom={{ delay, duration }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Container component that staggers entrance of child MotionStaggerItem components.
 */
export function MotionStagger({
  children,
  className,
  delay = 0.05,
  stagger = 0.08,
  viewport = defaultViewport,
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  const variants = createStaggerContainer(stagger, delay);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Child item wrapper within a MotionStagger container.
 */
export function MotionStaggerItem({
  children,
  className,
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerItemVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Subtle scale and opacity reveal (0.98 -> 1).
 */
export function MotionScale({
  children,
  className,
  delay = 0,
  duration = 0.5,
  viewport = defaultViewport,
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={subtleScaleVariants}
      custom={{ delay, duration }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
