import React from "react";
import HeroSection from "@/components/hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Compass,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { faqs } from "./data/faqs";
import { features } from "./data/features";
import { howItWorks } from "./data/howItWorks";
import { careerDecisions } from "./data/careerDecisions";
import { siteConfig } from "@/lib/site-config";
import {
  MotionSection,
  MotionFadeUp,
  MotionStagger,
  MotionStaggerItem,
  MotionScale,
} from "@/components/motion-primitives";

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        url: siteConfig.url,
        name: siteConfig.name,
        description: siteConfig.description,
        publisher: {
          "@id": `${siteConfig.url}/#organization`,
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.name,
        url: siteConfig.url,
        logo: `${siteConfig.url}/icon.svg`,
        description: siteConfig.descriptor,
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${siteConfig.url}/#software`,
        name: siteConfig.name,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description: siteConfig.description,
        featureList: [
          "Resume Analysis & ATS Scoring",
          "AI Mock Interview Simulator",
          "Role-Aligned Career Roadmap",
          "AI Cover Letter Generator",
          "Market Intelligence & Industry Insights",
        ],
      },
    ],
  };

  return (
    <div className="relative min-h-screen">
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Fixed Theme Background Mesh Grid */}
      <div className="grid-background" />

      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Features & Capabilities Section */}
      <MotionSection id="features" className="relative w-full py-16 sm:py-24 border-t border-border/60 bg-muted/15">
        <div className="container mx-auto px-4 md:px-6">
          <MotionFadeUp className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
            <Badge variant="neutral" className="gap-1.5 py-1 px-3">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Intelligent Career Suite</span>
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Everything You Need to Move Forward
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
              One career workspace that turns your experience, skills, and goals into practical next steps.
            </p>
          </MotionFadeUp>

          <MotionStagger stagger={0.08} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <MotionStaggerItem key={index} className="h-full">
                <Card
                  className="group relative flex flex-col justify-between h-full border-border/80 bg-card/70 backdrop-blur-sm hover:border-primary/50 hover:bg-card hover:shadow-lg transition-all duration-200 overflow-hidden"
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
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </div>
      </MotionSection>

      {/* 3. Grounded & Verifiable Product Metrics */}
      <MotionSection className="w-full py-12 sm:py-16 border-y border-border/50 bg-card/40 backdrop-blur-xs">
        <div className="container mx-auto px-4 md:px-6">
          <MotionStagger stagger={0.07} className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 max-w-5xl mx-auto text-center">
            {/* Stat 1 */}
            <MotionStaggerItem className="space-y-1.5 p-5 rounded-2xl bg-card border border-border/70 shadow-2xs">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                60+
              </div>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                Career Paths Mapped
              </p>
              <p className="text-[11px] text-muted-foreground">
                Spanning diverse industries and roles
              </p>
            </MotionStaggerItem>

            {/* Stat 2 */}
            <MotionStaggerItem className="space-y-1.5 p-5 rounded-2xl bg-card border border-border/70 shadow-2xs">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                10-Point
              </div>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                Resume Diagnostic
              </p>
              <p className="text-[11px] text-muted-foreground">
                Deep section-by-section analysis
              </p>
            </MotionStaggerItem>

            {/* Stat 3 */}
            <MotionStaggerItem className="space-y-1.5 p-5 rounded-2xl bg-card border border-border/70 shadow-2xs">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-mono">
                100%
              </div>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                Resume-Aware Practice
              </p>
              <p className="text-[11px] text-muted-foreground">
                Questions anchored in your genuine background
              </p>
            </MotionStaggerItem>

            {/* Stat 4 */}
            <MotionStaggerItem className="space-y-1.5 p-5 rounded-2xl bg-card border border-border/70 shadow-2xs">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-500 dark:text-emerald-400 font-mono">
                Instant
              </div>
              <p className="text-xs sm:text-sm font-bold text-foreground">
                Actionable Feedback
              </p>
              <p className="text-[11px] text-muted-foreground">
                Clear recommendations you can act on today
              </p>
            </MotionStaggerItem>
          </MotionStagger>
        </div>
      </MotionSection>

      {/* 4. Connected "How It Works" Flow */}
      <MotionSection className="w-full py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <MotionFadeUp className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
            <Badge variant="neutral" className="gap-1.5 py-1 px-3">
              <Compass className="h-3.5 w-3.5 text-primary" />
              <span>Guided Process</span>
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              From Resume to Readiness
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
              CareerWise connects your profile, goals, and practice into one continuous improvement loop.
            </p>
          </MotionFadeUp>

          <MotionStagger stagger={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto relative">
            {howItWorks.map((item, index) => (
              <MotionStaggerItem
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
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </div>
      </MotionSection>

      {/* 5. Decision Pillars & Value Framework */}
      <MotionSection className="w-full py-16 sm:py-24 border-t border-border/60 bg-muted/15">
        <div className="container mx-auto px-4 md:px-6">
          <MotionFadeUp className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <Badge variant="neutral" className="gap-1.5 py-1 px-3">
              <Compass className="h-3.5 w-3.5 text-primary" />
              <span>Decision Framework</span>
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Built Around Real Career Decisions
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Career growth rarely comes down to one perfect answer. CareerWise helps you evaluate your options, identify what matters, and act on the next step.
            </p>
          </MotionFadeUp>

          <MotionStagger stagger={0.09} className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {careerDecisions.map((item, index) => (
              <MotionStaggerItem key={index}>
                <Card
                  className="border-border/80 bg-card/80 backdrop-blur-sm flex flex-col justify-between p-6 hover:border-primary/40 transition-all shadow-xs group h-full"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                        {item.icon}
                      </div>
                      <span className="font-mono text-xs font-bold text-muted-foreground/60 px-2 py-0.5 rounded bg-muted/30">
                        {item.step}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </MotionStaggerItem>
            ))}
          </MotionStagger>
        </div>
      </MotionSection>

      {/* 6. Frequently Asked Questions */}
      <MotionSection className="w-full py-16 sm:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <MotionFadeUp className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <Badge variant="neutral" className="gap-1.5 py-1 px-3">
              <HelpCircle className="h-3.5 w-3.5 text-primary" />
              <span>Clear Answers</span>
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
              Questions Before You Get Started
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Everything you need to know about how CareerWise analyzes your profile, supports your preparation, and protects your information.
            </p>
          </MotionFadeUp>

          <MotionFadeUp delay={0.1} className="max-w-3xl mx-auto">
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
          </MotionFadeUp>
        </div>
      </MotionSection>

      {/* 7. Theme-Integrated Call to Action */}
      <MotionSection className="w-full py-12 sm:py-20 border-t border-border/60 bg-muted/10">
        <div className="container mx-auto px-4 md:px-6">
          <MotionScale className="relative rounded-3xl border border-primary/25 bg-gradient-to-b from-card/95 to-card/70 p-8 sm:p-14 md:p-16 text-center max-w-4xl mx-auto shadow-2xl backdrop-blur-md overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-primary/15 blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <Badge variant="neutral" className="gap-1.5 py-1 px-3">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>✦ Start Building Your Career Strategy</span>
              </Badge>

              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                Your Next Move Starts With Knowing Where You Stand
              </h2>

              <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                Analyze your experience, strengthen your weak spots, and build a clearer path toward the opportunities you want.
              </p>

              <div className="pt-2">
                <Button
                  asChild
                  size="lg"
                  className="px-8 py-6 text-base font-bold shadow-lg hover:shadow-xl gap-2 transition-all group"
                >
                  <Link href="/dashboard">
                    <span>Explore CareerWise</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </MotionScale>
        </div>
      </MotionSection>
    </div>
  );
}