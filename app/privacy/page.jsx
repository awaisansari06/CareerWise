import React from "react";
import { siteConfig } from "@/lib/site-config";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, Cpu, Lock, Eye, RefreshCw, Mail } from "lucide-react";
import { MotionFadeUp } from "@/components/motion-primitives";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Learn how CareerWise collects, uses, and safeguards your resume data, personal information, and career intelligence records.",
  alternates: {
    canonical: `${siteConfig.url}/privacy`,
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen py-16 sm:py-24">
      {/* Background Mesh Grid */}
      <div className="grid-background" />

      <div className="container mx-auto px-4 md:px-6 max-w-4xl relative">
        {/* Header */}
        <MotionFadeUp className="mb-12 md:mb-16 space-y-4 text-center">
          <div className="flex justify-center">
            <Badge variant="neutral" className="gap-1.5 py-1 px-3.5">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Legal Documentation</span>
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Last Updated: March 2025
          </p>
        </MotionFadeUp>

        {/* Content Body */}
        <div className="space-y-10 text-foreground/90 leading-relaxed text-sm md:text-base">
          {/* 1. Introduction */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">01.</span>
              <span>Introduction</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              CareerWise (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) operates an AI-assisted career intelligence platform designed to help job seekers, professionals, and students analyze their resumes, identify technical skill gaps, simulate mock interview scenarios, generate role-aligned cover letters, and build personalized skill roadmaps.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              This Privacy Policy explains transparently how we collect, store, process, and handle your information when you access our web application. We believe in candid disclosure: we describe our actual system design rather than making vague, inflated marketing assertions.
            </p>
          </MotionFadeUp>

          {/* 2. Information We Collect */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">02.</span>
              <span>Information We Collect</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information that you directly provide to us and data required to authenticate and deliver our career services:
            </p>
            <ul className="space-y-3 pl-2 text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Authentication & Profile Information:</strong> Handled securely via our identity provider (Clerk). This includes your email address, full name, profile picture (if provided), and unique account identifier.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Resume Data:</strong> PDF documents you upload for diagnostic scanning, along with extracted textual data including work experience, education history, contact links, and listed technical competencies.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Career & Target Preferences:</strong> Industry selection, target job titles, years of experience, and personal professional skills.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Application Activity & Exercises:</strong> Answers submitted during mock interview quizzes, generated interview scores, feedback reviews, cover letter input parameters, and generated career roadmaps.</span>
              </li>
            </ul>
          </MotionFadeUp>

          {/* 3. How We Use Information */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">03.</span>
              <span>How We Use Information</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We process your data strictly to execute the core features you request:
            </p>
            <ul className="space-y-2.5 pl-2 text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>Generating automated ATS compatibility scoring and section-by-section resume feedback.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>Curating tailored interview questions matching your chosen industry and calculating objective quiz performance scores.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>Drafting structured cover letter markdown tailored to job descriptions you specify.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>Generating role-specific technical learning roadmaps and skill milestones.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>Preventing unauthorized cross-user data access through strict account authorization barriers.</span>
              </li>
            </ul>
          </MotionFadeUp>

          {/* 4. Resume and Career Data */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">04.</span>
              <span>Resume and Career Data Lifecycle</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              CareerWise operates on a <strong className="text-foreground">single active resume model</strong> per user account:
            </p>
            <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2 text-xs md:text-sm">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-primary" />
                <span>Replacement & Invalidation Architecture:</span>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                When you upload a new resume, CareerWise replaces your prior resume record in our database and permanently invalidates previous diagnostic analysis records. Only your most recently submitted resume and its corresponding analysis are preserved for active dashboard use.
              </p>
            </div>
            <p className="text-muted-foreground leading-relaxed text-xs md:text-sm">
              All uploads are subject to pre-flight security constraints: files must be genuine PDFs under 5 Megabytes (5MB) verified via binary magic bytes (<code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">%PDF-</code>). Non-PDF files and disguised executables are blocked and rejected before processing.
            </p>
          </MotionFadeUp>

          {/* 5. AI-Powered Features */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">05.</span>
              <span>AI-Powered Features & Third-Party Processing</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              To deliver resume diagnostics, quiz evaluation, and personalized career roadmaps, CareerWise interacts with external machine learning APIs:
            </p>
            <ul className="space-y-3 pl-2 text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Google Gemini API:</strong> Extracted resume text, target role descriptions, and prompt instructions are transmitted via encrypted HTTPS to Google&apos;s Gemini API endpoints for inference.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Zero Model Training on Personal Data:</strong> Under our enterprise API configuration with Google Cloud, user prompts and uploaded resume texts sent via the API are not utilized to train or fine-tune public base models.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Structured Output Validation:</strong> All AI outputs are returned as structured JSON schemas and sanitized on our application server prior to database persistence.</span>
              </li>
            </ul>
          </MotionFadeUp>

          {/* 6. Data Storage and Security */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">06.</span>
              <span>Data Storage and Access Controls</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Your career records and profile data are stored in a managed PostgreSQL database configured with strict relational foreign keys:
            </p>
            <ul className="space-y-2.5 pl-2 text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Multi-Tenant Isolation:</strong> Every database query for resumes, assessments, cover letters, and roadmaps is explicitly bound to the verified Clerk <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">userId</code>. One user cannot view, alter, or delete another user&apos;s records.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Encryption in Transit:</strong> All communications between your browser, our application servers, database instances, and external APIs are encrypted using modern Transport Layer Security (TLS/HTTPS).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Server-Side Quiz Calculation:</strong> Interview assessment questions, answer keys, and scoring logic are calculated on our backend. Correct answers are never sent down to the client before submission, preventing client-side answer tampering.</span>
              </li>
            </ul>
          </MotionFadeUp>

          {/* 7. Third-Party Services */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">07.</span>
              <span>Third-Party Subprocessors</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We partner only with established infrastructure providers to operate the platform:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                <p className="font-semibold text-xs text-foreground">Clerk (Auth)</p>
                <p className="text-xs text-muted-foreground">User identity, session management, secure passwords, and OAuth providers.</p>
              </div>
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                <p className="font-semibold text-xs text-foreground">Google Cloud (Gemini AI)</p>
                <p className="text-xs text-muted-foreground">API processing for resume analysis, interview scoring, and content synthesis.</p>
              </div>
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                <p className="font-semibold text-xs text-foreground">Neon / PostgreSQL</p>
                <p className="text-xs text-muted-foreground">Managed relational cloud database storage for structured career records.</p>
              </div>
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                <p className="font-semibold text-xs text-foreground">Inngest</p>
                <p className="text-xs text-muted-foreground">Background event orchestration and scheduled market data synchronization.</p>
              </div>
            </div>
          </MotionFadeUp>

          {/* 8. Cookies and Similar Technologies */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">08.</span>
              <span>Cookies and Local Storage</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              CareerWise keeps client storage minimal and functional:
            </p>
            <ul className="space-y-2.5 pl-2 text-muted-foreground text-xs md:text-sm">
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Essential Session Cookies:</strong> Created and managed by Clerk to keep you securely signed in across page requests.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Theme Preference:</strong> Stored in browser <code className="text-xs font-mono bg-muted px-1 rounded">localStorage</code> to remember your selected light or dark mode theme between visits.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Zero Ad Trackers:</strong> We do not employ third-party advertising tracking pixels, cross-site behavior trackers, or data broker scripts.</span>
              </li>
            </ul>
          </MotionFadeUp>

          {/* 9. Data Retention */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">09.</span>
              <span>Data Retention</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your active profile, current resume, interview assessments, and generated cover letters for as long as your CareerWise account exists. Historical interview assessments and generated cover letters remain in your archive until you remove them or delete your account.
            </p>
          </MotionFadeUp>

          {/* 10. Your Choices and Rights */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">10.</span>
              <span>Your Choices and Rights</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You maintain direct control over your career information:
            </p>
            <ul className="space-y-2.5 pl-2 text-muted-foreground text-xs md:text-sm">
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Resume Replacement:</strong> You can upload a new resume at any time from your dashboard or onboarding workflow.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Profile Updates:</strong> You can modify your target industry and skills in your account profile.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Account Deletion:</strong> You can request complete removal of your profile and associated database records by managing your Clerk account or contacting support.</span>
              </li>
            </ul>
          </MotionFadeUp>

          {/* 11. Children's Privacy */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">11.</span>
              <span>Children&apos;s Privacy</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              CareerWise is intended for working adults, university students, and career seekers. We do not knowingly collect personal information from individuals under the age of 13. If you believe a minor has created an account, please reach out to us for prompt account removal.
            </p>
          </MotionFadeUp>

          {/* 12. Changes to This Policy */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">12.</span>
              <span>Changes to This Policy</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy as new capabilities, tools, or security practices are added to the application. Any revisions will be reflected on this page with an updated &ldquo;Last Updated&rdquo; date at the top.
            </p>
          </MotionFadeUp>

          {/* 13. Contact Us */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">13.</span>
              <span>Contact Us</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions or privacy inquiries regarding your information on CareerWise, please contact us at:
            </p>
            <div className="p-4 rounded-xl border border-border/60 bg-muted/30 flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">CareerWise Privacy Inquiries</p>
                <a
                  href="mailto:privacy@careerwise.dev"
                  className="text-xs text-primary hover:underline font-mono"
                >
                  privacy@careerwise.dev
                </a>
              </div>
            </div>
          </MotionFadeUp>
        </div>
      </div>
    </div>
  );
}
