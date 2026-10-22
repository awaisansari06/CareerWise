"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText, Check, Compass, ChartNoAxesColumnIncreasing } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import CareerJourney from "@/components/career-journey";

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
    <>
    <section className="cw-design cw-portrait-hero" aria-labelledby="hero-title">
      <div className="cw-portrait-art" aria-hidden="true">
        <div className="cw-portrait-orbit cw-portrait-orbit-one" />
        <div className="cw-portrait-orbit cw-portrait-orbit-two" />
        <div className="cw-portrait-photo">
          <Image src="/images/career-portrait.webp" alt="" fill priority sizes="(max-width: 700px) 100vw, 58vw" />
        </div>
      </div>

      {/* ───── Content ───── */}
      <div className="cw-container">
        <motion.div
          className="cw-portrait-copy"
          variants={reduceMotion ? {} : containerVariants}
          initial={reduceMotion ? undefined : "hidden"}
          animate={reduceMotion ? undefined : "visible"}
        >
          <motion.p className="cw-portrait-category" variants={fadeUp}>
            <span aria-hidden="true" /> YOUR EXPERIENCE. NEW POSSIBILITIES.
          </motion.p>

          <motion.h1 id="hero-title" variants={fadeUp}>
            Your next chapter.
            <br />
            <span>A clearer direction.</span>
          </motion.h1>

          <motion.p className="cw-portrait-lead" variants={fadeUp}>
            Turn what you’ve done into what comes next. Discover career paths,
            build the right skills, and move forward with a plan that’s yours.
          </motion.p>

          <motion.div className="cw-portrait-actions" variants={fadeUp}>
            <Link href="/dashboard" className="cw-button cw-portrait-primary">
              <FileText size={18} />
              Start my career plan
              <ArrowRight size={18} />
            </Link>
            <Link
              className="cw-portrait-secondary"
              href={preview ? "/#how-it-works" : "#how-it-works"}
            >
              How it works <ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.p className="cw-portrait-promises" variants={fadeUp}>
            <span><Check size={14} /> Start with a resume or profile</span>
            <span><Check size={14} /> Guidance built around you</span>
            <span><Check size={14} /> Practical next steps</span>
          </motion.p>
          <motion.ul className="cw-portrait-benefits" variants={fadeUp} aria-label="Your career toolkit">
            {[
              { icon: Compass, title: "Explore career paths", detail: "See where your experience can take you.", tone: "blue" },
              { icon: ChartNoAxesColumnIncreasing, title: "Build the right skills", detail: "Close gaps and grow with confidence.", tone: "green" },
              { icon: FileText, title: "Get a personalized plan", detail: "Practical steps for real progress.", tone: "purple" },
            ].map(({ icon: Icon, title, detail, tone }) => <li key={title}><span className={`cw-portrait-benefit-icon is-${tone}`}><Icon size={22} strokeWidth={1.7} /></span><div><h2>{title}</h2><p>{detail}</p></div></li>)}
          </motion.ul>
        </motion.div>
      </div>
    </section>
    <section className="cw-design cw-portrait-journey" aria-label="Explore an example career journey">
      <div className="cw-container">
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
    </>
  );
}
