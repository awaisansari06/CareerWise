"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import Image from "next/image";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, useReducedMotion } from "framer-motion";
import { standardEase } from "@/lib/motion-variants";

const HeroSection = () => {
  const imageRef = useRef(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Mount guard prevents hydration mismatch:
  // On server / first paint we default to the dark banner since the app
  // defaults to dark mode, then swap after client hydration if needed.
  useEffect(() => {
    setMounted(true);
  }, []);

  const bannerSrc =
    mounted && resolvedTheme === "light"
      ? "/Banner-Light.png"
      : "/Banner-Dark.png";

  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 80;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Motion helpers that respect reduced-motion
  const getFadeUp = (delay = 0, y = 16) => {
    if (shouldReduceMotion) return {};
    return {
      initial: { opacity: 0, y },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay, ease: standardEase },
    };
  };

  return (
    <section className="relative w-full pt-28 sm:pt-36 md:pt-44 pb-12 sm:pb-20 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          {/* Top Innovation Badge */}
          <motion.div
            {...getFadeUp(0.05, 12)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs sm:text-sm font-semibold text-foreground backdrop-blur-md shadow-2xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            <span>AI-Powered Career Intelligence Platform</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            {...getFadeUp(0.15, 16)}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight gradient-title leading-[1.15] sm:leading-[1.12]"
          >
            Turn Your Experience Into Your Next Opportunity
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            {...getFadeUp(0.25, 16)}
            className="max-w-2xl text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed"
          >
            CareerWise analyzes where you are today, identifies what is holding you back, and helps you prepare for the roles you actually want — from resume improvement to interview readiness and career planning.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            {...getFadeUp(0.35, 16)}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto"
          >
            <Button
              asChild
              size="lg"
              className="w-full sm:w-auto px-8 py-6 text-base font-bold gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Link href="/dashboard">
                <span>Get Started Free</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto px-8 py-6 text-base font-semibold border-border/80 hover:bg-muted/40"
            >
              <Link href="#features">
                <span>Explore Features</span>
              </Link>
            </Button>
          </motion.div>

          {/* Micro Value Proposition Bar */}
          <motion.div
            {...getFadeUp(0.45, 10)}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs text-muted-foreground font-medium"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Resume-driven recommendations</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Role-specific interview practice</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Real-time market intelligence</span>
            </span>
          </motion.div>
        </div>

        {/* Hero Product Banner Preview with Subtle Ambient Glow */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20, scale: 0.98 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5, ease: standardEase }}
          className="relative hero-image-wrapper mt-12 sm:mt-16 max-w-5xl mx-auto"
        >
          {/* Subtle Ambient Cyan/Blue Glow behind Image */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-48 bg-sky-500/15 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div
            ref={imageRef}
            className="relative hero-image rounded-2xl border border-border/80 bg-card/50 p-2 sm:p-3 shadow-2xl backdrop-blur-md"
          >
            <div className="relative overflow-hidden rounded-xl border border-border/60">
              <Image
                src={bannerSrc}
                width={1280}
                height={720}
                alt="CareerWise Workspace & Career Dashboard Preview"
                className="w-full h-auto rounded-lg object-cover"
                priority
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
