import React from "react";
import { siteConfig } from "@/lib/site-config";
import { Badge } from "@/components/ui/badge";
import { FileCheck, AlertCircle, Scale, CheckCircle2, ShieldAlert, Mail } from "lucide-react";
import { MotionFadeUp } from "@/components/motion-primitives";

export const metadata = {
  title: "Terms of Service",
  description:
    "Review the Terms of Service governing the use of CareerWise career intelligence, AI resume analysis, and interview preparation tools.",
  alternates: {
    canonical: `${siteConfig.url}/terms`,
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="relative min-h-screen py-16 sm:py-24">
      {/* Background Mesh Grid */}
      <div className="grid-background" />

      <div className="container mx-auto px-4 md:px-6 max-w-4xl relative">
        {/* Header */}
        <MotionFadeUp className="mb-12 md:mb-16 space-y-4 text-center">
          <div className="flex justify-center">
            <Badge variant="neutral" className="gap-1.5 py-1 px-3.5">
              <Scale className="h-3.5 w-3.5 text-primary" />
              <span>User Agreement</span>
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Terms of Service
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Last Updated: March 2025
          </p>
        </MotionFadeUp>

        {/* Content Body */}
        <div className="space-y-10 text-foreground/90 leading-relaxed text-sm md:text-base">
          {/* 1. Acceptance of Terms */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">01.</span>
              <span>Acceptance of Terms</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using CareerWise (&ldquo;the Service&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), you acknowledge that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree with any portion of these Terms, you must discontinue use of the platform immediately.
            </p>
          </MotionFadeUp>

          {/* 2. Description of CareerWise */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">02.</span>
              <span>Description of the Service</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              CareerWise provides web-based career exploration and preparation tools, including automated resume diagnostics, Applicant Tracking System (ATS) benchmark scoring, industry trend telemetry, mock interview practice simulations, role-tailored cover letter generators, and technical career progression roadmaps.
            </p>
          </MotionFadeUp>

          {/* 3. User Accounts */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">03.</span>
              <span>User Accounts and Registration</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              To access personalized career features, you must create an account verified via our authentication provider (Clerk). You agree to provide accurate registration information, maintain the confidentiality of your login credentials, and immediately notify us of any unauthorized account access.
            </p>
          </MotionFadeUp>

          {/* 4. User-Provided Content */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">04.</span>
              <span>User-Provided Content</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain all ownership rights to resumes, cover letter text, career achievements, and notes you submit to CareerWise. By submitting content, you grant CareerWise a limited, non-exclusive license to store, process, and transmit such content solely as necessary to render the services requested by you.
            </p>
          </MotionFadeUp>

          {/* 5. Resume and Career Information */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">05.</span>
              <span>Resume and Career Information</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You represent and warrant that any resume or credential history you upload represents truthful information about your background. You acknowledge that uploading a new resume replaces your existing active resume record in the system and recalculates corresponding diagnostics.
            </p>
          </MotionFadeUp>

          {/* 6. AI-Generated Content (Critical Disclaimer) */}
          <MotionFadeUp className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                <span className="text-primary font-mono text-lg mr-2">06.</span>
                <span>AI-Generated Content & Career Disclaimer</span>
              </h2>
            </div>
            <div className="space-y-3 text-muted-foreground text-xs md:text-sm leading-relaxed">
              <p>
                <strong className="text-foreground">Automated Machine Learning Output:</strong> CareerWise utilizes artificial intelligence models (including Google Gemini) to generate resume evaluations, ATS scores, interview questions, roadmap recommendations, and draft cover letters. These systems generate predictions based on probabilistic text patterns.
              </p>
              <p>
                <strong className="text-foreground">No Guarantee of Hiring or Outcomes:</strong> CareerWise does <strong className="text-foreground">NOT</strong> guarantee employment, job offers, interview callbacks, salary thresholds, or specific career advancement. An ATS compatibility score is an automated estimation and does not represent an actual hiring decision by any employer.
              </p>
              <p>
                <strong className="text-foreground">Not Professional Legal or Financial Advice:</strong> CareerWise does not provide certified legal, financial, immigration, or professional employment recruiting counsel. You are solely responsible for independently verifying all resume contents, cover letter claims, and career decisions before submitting materials to real-world employers.
              </p>
            </div>
          </MotionFadeUp>

          {/* 7. Acceptable Use */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">07.</span>
              <span>Acceptable Use Policy</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to misuse CareerWise or facilitate any unauthorized actions, including:
            </p>
            <ul className="space-y-2.5 pl-2 text-muted-foreground text-xs md:text-sm">
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                <span>Uploading non-PDF files, executable scripts, malicious payloads, or files exceeding our 5MB size limit.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                <span>Attempting to bypass multi-tenant authorization controls to view or manipulate another user&apos;s data.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                <span>Deploying automated scraping bots or initiating abusive request volumes that burden our backend infrastructure.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                <span>Reverse engineering or decompiling the source code and internal proprietary algorithms.</span>
              </li>
            </ul>
          </MotionFadeUp>

          {/* 8. Intellectual Property */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">08.</span>
              <span>Intellectual Property</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              All visual designs, logos, software code, user interface components, and trademarks belonging to CareerWise remain the exclusive property of CareerWise. You may not replicate, distribute, or create derivative works of our interface without prior written authorization.
            </p>
          </MotionFadeUp>

          {/* 9. Third-Party Services */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">09.</span>
              <span>Third-Party Services</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              CareerWise relies on integrated third-party platforms (such as Clerk for authentication and Google for AI inference). Your interactions with third-party systems are subject to their respective terms and privacy policies.
            </p>
          </MotionFadeUp>

          {/* 10. Disclaimer */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">10.</span>
              <span>Disclaimer of Warranties</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed text-xs md:text-sm uppercase tracking-wide font-mono">
              THE SERVICE IS PROVIDED ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES.
            </p>
          </MotionFadeUp>

          {/* 11. Limitation of Liability */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">11.</span>
              <span>Limitation of Liability</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed text-xs md:text-sm">
              TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL CAREERWISE, ITS CREATORS, OR CONTRIBUTORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, USE, REPUTATION, OR EMPLOYMENT OPPORTUNITIES RESULTING FROM YOUR ACCESS TO OR USE OF (OR INABILITY TO ACCESS OR USE) THE SERVICE.
            </p>
          </MotionFadeUp>

          {/* 12. Changes to the Service */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">12.</span>
              <span>Modifications to the Service</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify, suspend, or discontinue any feature, endpoint, or tool in CareerWise at any time without prior notice.
            </p>
          </MotionFadeUp>

          {/* 13. Changes to These Terms */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">13.</span>
              <span>Changes to These Terms</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may revise these Terms of Service periodically. When revisions take effect, the &ldquo;Last Updated&rdquo; date at the top will be modified accordingly. Continued use of CareerWise following posted modifications constitutes your acceptance of the updated Terms.
            </p>
          </MotionFadeUp>

          {/* 14. Contact */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">14.</span>
              <span>Contact Information</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions regarding these Terms of Service, please reach out to us at:
            </p>
            <div className="p-4 rounded-xl border border-border/60 bg-muted/30 flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">CareerWise Legal Inquiries</p>
                <a
                  href="mailto:legal@careerwise.dev"
                  className="text-xs text-primary hover:underline font-mono"
                >
                  legal@careerwise.dev
                </a>
              </div>
            </div>
          </MotionFadeUp>
        </div>
      </div>
    </div>
  );
}
