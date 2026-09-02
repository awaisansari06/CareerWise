"use client";

import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import Image from "next/image";
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

const HeroSection = () => {
  const imageRef = useRef(null);

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

  return (
    <section className="relative w-full pt-28 sm:pt-36 md:pt-44 pb-12 sm:pb-20 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          {/* Top Innovation Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs sm:text-sm font-medium text-foreground backdrop-blur-md shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
            <span>Next-Gen AI Career Acceleration Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight gradient-title leading-[1.15] sm:leading-[1.12]">
            Smarter Careers, Powered by AI Insight
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
            Advance your professional trajectory with intelligent career tooling — from ATS-calibrated resume diagnostics and role-tailored mock interviews to dynamic market insights and skill milestone roadmaps.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
            <Button asChild size="lg" className="w-full sm:w-auto px-8 gap-2 shadow-md hover:shadow-lg font-medium">
              <Link href="/dashboard">
                <span>Get Started Free</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto px-8 font-medium">
              <Link href="#features">
                <span>Explore Features</span>
              </Link>
            </Button>
          </div>

          {/* Micro Value Proposition Bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Instant ATS Resume Audit</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Personalized Mock Q&A</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Real-Time Market Benchmarks</span>
            </span>
          </div>
        </div>

        {/* Hero Product Banner Preview */}
        <div className="hero-image-wrapper mt-10 sm:mt-14 max-w-5xl mx-auto">
          <div
            ref={imageRef}
            className="hero-image rounded-2xl border border-border/80 bg-card/40 p-2 sm:p-3 shadow-2xl backdrop-blur-md"
          >
            <div className="relative overflow-hidden rounded-xl border border-border/60">
              <Image
                src="/banner.png"
                width={1280}
                height={720}
                alt="CareerWise AI Dashboard & Workspace Preview"
                className="w-full h-auto rounded-lg object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
