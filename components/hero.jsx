"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import CareerJourney from "@/components/career-journey";

/* ---------- background orb data ---------- */
const orbs = [
  { cx: "12%", cy: "18%", r: 220, color: "var(--hero-orb-1)", delay: 0 },
  { cx: "78%", cy: "30%", r: 280, color: "var(--hero-orb-2)", delay: 1.2 },
  { cx: "55%", cy: "82%", r: 170, color: "var(--hero-orb-3)", delay: 2.4 },
  { cx: "90%", cy: "70%", r: 140, color: "var(--hero-orb-4)", delay: 0.8 },
];

/* ---------- floating particle positions ---------- */
const particles = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${6 + ((i * 47) % 89)}%`,
  top: `${8 + ((i * 31) % 85)}%`,
  size: 2 + (i % 3) * 1.5,
  delay: i * 0.35,
  duration: 4 + (i % 4) * 1.5,
}));

/* ---------- animation variants ---------- */
const ease = [0.25, 0.1, 0.25, 1];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

const fadeScale = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease, delay: 0.5 } },
};

export default function HeroSection({ preview = false }) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="cw-design cw-product-hero" aria-labelledby="hero-title">
      {/* ───── Animated background layer ───── */}
      <div className="cw-hero-bg" aria-hidden="true">
        {/* Gradient orbs */}
        <svg className="cw-hero-orbs" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            {orbs.map((orb, i) => (
              <radialGradient key={i} id={`hero-orb-${i}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={orb.color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={orb.color} stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>
          {orbs.map((orb, i) => (
            <circle
              key={i}
              cx={orb.cx}
              cy={orb.cy}
              r={orb.r}
              fill={`url(#hero-orb-${i})`}
              className="cw-hero-orb-circle"
              style={{ animationDelay: `${orb.delay}s` }}
            />
          ))}
        </svg>

        {/* Dot grid texture */}
        <div className="cw-hero-grid-texture" />

        {/* Floating particles */}
        <div className="cw-hero-particles">
          {particles.map((p) => (
            <i
              key={p.id}
              className="cw-hero-particle"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>

        {/* Top-edge glow line */}
        <div className="cw-hero-glow-line" />
      </div>

      {/* ───── Content ───── */}
      <div className="cw-container">
        <motion.div
          className="cw-product-intro"
          variants={reduceMotion ? {} : containerVariants}
          initial={reduceMotion ? undefined : "hidden"}
          animate={reduceMotion ? undefined : "visible"}
        >
          <motion.p className="cw-product-category" variants={fadeUp}>
            PERSONALIZED CAREER GUIDANCE
          </motion.p>

          <motion.h1 id="hero-title" variants={fadeUp}>
            Find the roles you can grow into.
            <br />
            <span>Know how to get there.</span>
          </motion.h1>

          <motion.p className="cw-product-lead" variants={fadeUp}>
            Connect your experience to career options, see the skills to build,
            and leave with a practical next step.
          </motion.p>

          <motion.div className="cw-product-actions" variants={fadeUp}>
            <Link href="/dashboard" className="cw-button cw-hero-cta-btn">
              <FileText size={18} />
              Start my career plan
              <ArrowRight size={18} />
            </Link>
            <Link
              className="cw-product-secondary"
              href={preview ? "/#how-it-works" : "#how-it-works"}
            >
              How it works <ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.p className="cw-product-promise" variants={fadeUp}>
            Start with your resume or profile. Get career directions, skill
            gaps, and a plan to act on.
          </motion.p>
        </motion.div>

        <motion.div
          variants={reduceMotion ? {} : fadeScale}
          initial={reduceMotion ? undefined : "hidden"}
          whileInView={reduceMotion ? undefined : "visible"}
          viewport={{ once: true, amount: 0.1 }}
        >
          <CareerJourney />
        </motion.div>
      </div>
    </section>
  );
}
