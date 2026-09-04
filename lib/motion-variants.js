/**
 * CareerWise Centralized Motion Design System
 *
 * Core Principles:
 * - Subtle, calm, and intentional
 * - Focus on opacity, small vertical translations (<= 20px), and subtle scale (0.98 -> 1)
 * - Viewport-based reveals trigger ONCE to avoid repetitive re-animation
 * - Respects prefers-reduced-motion
 */

export const standardEase = [0.25, 0.1, 0.25, 1];

export const fadeUpVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (custom = {}) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: custom.duration ?? 0.5,
      delay: custom.delay ?? 0,
      ease: standardEase,
    },
  }),
};

export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: (custom = {}) => ({
    opacity: 1,
    transition: {
      duration: custom.duration ?? 0.45,
      delay: custom.delay ?? 0,
      ease: "easeOut",
    },
  }),
};

export const subtleScaleVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: (custom = {}) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: custom.duration ?? 0.5,
      delay: custom.delay ?? 0,
      ease: standardEase,
    },
  }),
};

export const createStaggerContainer = (staggerDelay = 0.08, delayChildren = 0.05) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: delayChildren,
    },
  },
});

export const staggerContainerVariants = createStaggerContainer(0.08, 0.05);

export const staggerItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: standardEase,
    },
  },
};

export const defaultViewport = {
  once: false,
  amount: 0.15,
  margin: "0px 0px -40px 0px",
};
