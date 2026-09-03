import React from "react";
import HeroSection from "@/components/hero";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  BrainCircuit,
  Briefcase,
  LineChart,
  ScrollText,
  UserPlus,
  FileEdit,
  Users,
  Compass,
  CheckCircle2,
  HelpCircle,
  Building2,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { faqs } from "./data/faqs";
import { features } from "./data/features";
import { howItWorks } from "./data/howItWorks";
import { testimonial } from "./data/testimonial";

export default function LandingPage() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Fixed Theme Background Mesh Grid */}
      <div className="grid-background" />

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Features & Capabilities Section */}
      <section id="features" className="relative w-full py-16 sm:py-24 border-t border-border/60 bg-muted/15">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
            <Badge variant="neutral" className="gap-1.5 py-1 px-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Intelligent Career Suite</span>
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Core Capabilities Engineered for Your Growth
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
              Every tool in CareerWise AI is purpose-built to analyze your qualifications, bridge skill gaps, and prepare you for competitive hiring standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group relative flex flex-col justify-between border-border/80 bg-card/70 backdrop-blur-sm hover:border-primary/50 hover:bg-card hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                {/* Accent Top Border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/70 via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <CardHeader className="space-y-3 pb-3">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Grounded & Verifiable Product Metrics */}
      <section className="w-full py-12 sm:py-16 border-y border-border/50 bg-card/40 backdrop-blur-xs">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-5xl mx-auto text-center">
            {/* Stat 1 */}
            <div className="space-y-1.5 p-5 rounded-2xl bg-card border border-border/70 shadow-2xs">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                60+
              </div>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                Career Specializations
              </p>
              <p className="text-[11px] text-muted-foreground">
                Spanning tech, business & creative fields
              </p>
            </div>

            {/* Stat 2 */}
            <div className="space-y-1.5 p-5 rounded-2xl bg-card border border-border/70 shadow-2xs">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                10-Point
              </div>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                ATS Diagnostic Rubric
              </p>
              <p className="text-[11px] text-muted-foreground">
                Keyword matching & section scoring
              </p>
            </div>

            {/* Stat 3 */}
            <div className="space-y-1.5 p-5 rounded-2xl bg-card border border-border/70 shadow-2xs">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                100%
              </div>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                Resume-Aligned Scenarios
              </p>
              <p className="text-[11px] text-muted-foreground">
                Questions customized to your background
              </p>
            </div>

            {/* Stat 4 */}
            <div className="space-y-1.5 p-5 rounded-2xl bg-card border border-border/70 shadow-2xs">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-500 dark:text-emerald-400 font-mono">
                Instant
              </div>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                Real-Time AI Feedback
              </p>
              <p className="text-[11px] text-muted-foreground">
                Actionable tips for immediate improvement
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Connected "How It Works" Flow */}
      <section className="w-full py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
            <Badge variant="neutral" className="gap-1.5 py-1 px-3">
              <Compass className="h-3.5 w-3.5 text-primary" />
              <span>Guided Process</span>
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              How CareerWise AI Works
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
              Four connected steps engineered to take you from resume diagnostic to high-conviction job offers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto relative">
            {howItWorks.map((item, index) => (
              <div
                key={index}
                className="group relative flex flex-col items-center text-center p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs space-y-4 hover:border-primary/50 hover:bg-card transition-all"
              >
                {/* Step Number Badge */}
                <span className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-md bg-primary text-primary-foreground font-mono text-xs font-bold shadow-xs">
                  0{index + 1}
                </span>

                {/* Step Connector Indicator for Desktop */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 text-muted-foreground/50">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                )}

                {/* Icon Container */}
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mt-2 group-hover:scale-105 transition-transform">
                  {item.icon}
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-base sm:text-lg text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. User Feedback & Testimonials */}
      <section className="w-full py-16 sm:py-24 border-t border-border/60 bg-muted/15">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <Badge variant="neutral" className="gap-1.5 py-1 px-3">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>User Perspectives</span>
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Accelerating Career Success
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              See how professionals leverage CareerWise AI to prepare and land competitive roles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonial.map((item, index) => (
              <Card
                key={index}
                className="border-border/80 bg-card/80 backdrop-blur-sm flex flex-col justify-between p-6 hover:border-primary/40 transition-all shadow-xs"
              >
                <div className="space-y-4">
                  {/* Author Header */}
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`h-11 w-11 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0`}
                    >
                      {item.initials}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm text-foreground">{item.author}</p>
                      <p className="text-xs text-muted-foreground">{item.role}</p>
                      <p className="text-[11px] font-medium text-primary flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span>{item.company}</span>
                      </p>
                    </div>
                  </div>

                  {/* Quote text */}
                  <blockquote className="text-xs sm:text-sm text-muted-foreground leading-relaxed italic pt-1">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Frequently Asked Questions */}
      <section className="w-full py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <Badge variant="neutral" className="gap-1.5 py-1 px-3">
              <HelpCircle className="h-3.5 w-3.5 text-primary" />
              <span>Clear Answers</span>
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Everything you need to know about CareerWise AI, our intelligence tooling, and privacy.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border border-border/70 rounded-xl px-5 py-1 bg-card/60 backdrop-blur-xs data-[state=open]:border-primary/50 data-[state=open]:bg-card transition-all"
                >
                  <AccordionTrigger className="text-sm sm:text-base font-semibold text-foreground text-left py-4 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-xs sm:text-sm text-muted-foreground leading-relaxed pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* 7. Theme-Integrated Call to Action */}
      <section className="w-full py-12 sm:py-20 border-t border-border/60 bg-muted/10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="relative rounded-3xl border border-primary/25 bg-gradient-to-b from-card/95 to-card/70 p-8 sm:p-14 md:p-16 text-center max-w-4xl mx-auto shadow-2xl backdrop-blur-md overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-primary/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <Badge variant="neutral" className="gap-1.5 py-1 px-3">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Begin Your Journey Today</span>
              </Badge>

              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                Take the Next Step Toward Your Professional Future
              </h2>

              <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                Join ambitious professionals accelerating their careers with AI resume diagnostics, role-specific mock interviews, and skill roadmaps.
              </p>

              <div className="pt-2">
                <Button
                  asChild
                  size="lg"
                  className="px-8 py-6 text-base font-bold shadow-lg hover:shadow-xl gap-2 transition-all group"
                >
                  <Link href="/dashboard">
                    <span>Smarter Careers Start Here</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}