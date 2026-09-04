import React from "react";
import { siteConfig } from "@/lib/site-config";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lock, FileCheck2, Cpu, Database, Server, AlertTriangle, Bug, ArrowUpRight, Mail } from "lucide-react";
import { MotionFadeUp } from "@/components/motion-primitives";

export const metadata = {
  title: "Security Architecture",
  description:
    "Learn about the multi-layered security controls, input sanitization, file validation, and authorization safeguards implemented across CareerWise.",
  alternates: {
    canonical: `${siteConfig.url}/security`,
  },
};

export default function SecurityArchitecturePage() {
  return (
    <div className="relative min-h-screen py-16 sm:py-24">
      {/* Background Mesh Grid */}
      <div className="grid-background" />

      <div className="container mx-auto px-4 md:px-6 max-w-4xl relative">
        {/* Header */}
        <MotionFadeUp className="mb-12 md:mb-16 space-y-4 text-center">
          <div className="flex justify-center">
            <Badge variant="neutral" className="gap-1.5 py-1 px-3.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Platform Hardening & Controls</span>
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Security at CareerWise
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A transparent overview of the technical safeguards, validation checks, and data protection practices implemented across our stack.
          </p>
        </MotionFadeUp>

        {/* Content Body */}
        <div className="space-y-10 text-foreground/90 leading-relaxed text-sm md:text-base">
          {/* 1. Authentication and Authorization */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">01.</span>
              <span>Authentication and Authorization</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Every request entering our application layer is subjected to identity verification and tenant authorization boundaries:
            </p>
            <ul className="space-y-3 pl-2 text-muted-foreground text-xs md:text-sm">
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Edge Middleware Protection:</strong> Core application routes (<code className="font-mono bg-muted px-1.5 py-0.5 rounded">/dashboard</code>, <code className="font-mono bg-muted px-1.5 py-0.5 rounded">/resume</code>, <code className="font-mono bg-muted px-1.5 py-0.5 rounded">/interview</code>, <code className="font-mono bg-muted px-1.5 py-0.5 rounded">/roadmap</code>, <code className="font-mono bg-muted px-1.5 py-0.5 rounded">/ai-cover-letter</code>, <code className="font-mono bg-muted px-1.5 py-0.5 rounded">/onboarding</code>) are safeguarded at the network edge by Clerk middleware. Unauthenticated requests are immediately redirected before touching server memory or executing code.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Server Action Authentication:</strong> All Next.js server actions call <code className="font-mono bg-muted px-1.5 py-0.5 rounded">await auth()</code> on invocation. If a valid, non-expired session token is not present, an immediate <code className="font-mono bg-muted px-1.5 py-0.5 rounded">Unauthorized</code> exception is thrown, halting execution before any database lookup.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Strict Ownership Checks:</strong> All database queries (resumes, assessments, cover letters, roadmaps) enforce tenant isolation by strictly scoping queries to the authenticated <code className="font-mono bg-muted px-1.5 py-0.5 rounded">userId</code>. User A cannot view, update, overwrite, or delete User B&apos;s records.</span>
              </li>
            </ul>
          </MotionFadeUp>

          {/* 2. Resume Upload Protection */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">02.</span>
              <span>Multi-Tier Resume Upload Protection</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              File upload endpoints are among the highest-risk vectors in modern web applications. CareerWise subjects every submitted resume to rigorous multi-tier validation before the file is even buffered:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1 text-xs md:text-sm">
              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <FileCheck2 className="h-4 w-4 text-emerald-500" />
                  <span>Binary Magic Byte Verification</span>
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We inspect the actual initial bytes of the uploaded file buffer to verify the standard <code className="font-mono bg-muted px-1 rounded">%PDF-</code> magic byte signature, rejecting disguised executables (.exe, .sh) renamed with a .pdf extension.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-emerald-500" />
                  <span>5MB Size Cap & MIME Enforcement</span>
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Files exceeding 5 Megabytes (5MB) or with non-PDF MIME types (<code className="font-mono bg-muted px-1 rounded">application/pdf</code>) are blocked immediately before invoking AI models or database connections.
                </p>
              </div>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Zero-byte files, corrupt archives, and unsupported formats (such as Microsoft Word .docx or images) are rejected with clear user-facing guidance to export the document as a clean PDF.
            </p>
          </MotionFadeUp>

          {/* 3. Input Validation */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">03.</span>
              <span>Input Validation and Sanitization</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              All client-provided parameters across cover letter drafting, onboarding, interview submission, and industry selection are validated against strict type, length, and presence rules:
            </p>
            <ul className="space-y-2 pl-2 text-muted-foreground text-xs md:text-sm">
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>Job titles, company names, and job descriptions are bound by reasonable character boundaries to prevent memory overflow.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>Selected industries are validated against recognized domains to avoid unexpected schema states.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span>Prisma ORM automatically uses parameterized SQL queries, eliminating SQL injection vulnerabilities.</span>
              </li>
            </ul>
          </MotionFadeUp>

          {/* 4. AI Request Protection */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">04.</span>
              <span>AI Request Protection & Resilience</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Interactions with generative machine learning endpoints are architected for safety and system stability:
            </p>
            <ul className="space-y-2.5 pl-2 text-muted-foreground text-xs md:text-sm">
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Decoupled AI & Database Transactions:</strong> External AI invocations run strictly outside database transactions. If Gemini takes 15 seconds to return or encounters network latency, database locks are never held open, keeping Postgres connections available for other users.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Bounded Timeouts & Exponential Backoff:</strong> AI requests are bound by hard timeouts (typically 25-45 seconds) and limited to finite retry attempts to prevent hanging promises or runaway billing.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span><strong className="text-foreground">Structured JSON Output Validation:</strong> Responses returned from Gemini are parsed through strict JSON cleaners and verified against expected schema structures before DB persistence.</span>
              </li>
            </ul>
          </MotionFadeUp>

          {/* 5. Protected Assessment Engine */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">05.</span>
              <span>Protected Assessment & Quiz Logic</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              In technical mock interview assessments, quiz integrity is protected on the server side:
            </p>
            <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2 text-xs md:text-sm">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Cpu className="h-4 w-4 text-primary" />
                <span>Zero Client-Side Answer Leakage:</span>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                When an interview quiz is delivered to the browser, the question objects contain only the question text and multiple-choice options. Correct answer keys and explanations are stored strictly on the server and are never sent down to the client until after answers have been submitted, verified, and scored.
              </p>
            </div>
          </MotionFadeUp>

          {/* 6. Security Headers */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">06.</span>
              <span>Security Headers and Transport Protection</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Every HTTP response includes modern browser security headers configured to mitigate common web attacks:
            </p>
            <ul className="space-y-2 pl-2 text-muted-foreground text-xs md:text-sm font-mono">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>X-Content-Type-Options: nosniff</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>X-Frame-Options: DENY (Clickjacking protection)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>Referrer-Policy: strict-origin-when-cross-origin</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>Strict-Transport-Security (HSTS enforced via Vercel/production SSL)</span>
              </li>
            </ul>
          </MotionFadeUp>

          {/* 7. Error Handling */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">07.</span>
              <span>Safe Error Handling</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed text-xs md:text-sm">
              We practice safe error propagation: detailed database stack traces, internal connection strings, and unhandled AI exceptions are logged on the server and masked into sanitized, user-friendly error notifications (such as &ldquo;AI service timed out. Please try again.&rdquo; or &ldquo;Unable to process resume file&rdquo;) rather than exposing internal system telemetry to client browsers.
            </p>
          </MotionFadeUp>

          {/* 8. Infrastructure / Database Security */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">08.</span>
              <span>Infrastructure and Database Protection</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed text-xs md:text-sm">
              Our PostgreSQL database is managed via secure cloud providers featuring encrypted connections at rest and in transit. Prisma client connection pooling safeguards serverless functions from exhausting connection quotas during peak concurrent loads.
            </p>
          </MotionFadeUp>

          {/* 9. Responsible Disclosure */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">09.</span>
              <span>Responsible Vulnerability Disclosure</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed text-xs md:text-sm">
              We welcome security researchers to responsibly report any potential vulnerabilities identified within CareerWise. If you discover a security concern, please send details to our security inbox with reproduction steps. We commit to investigating and patching validated vulnerabilities promptly.
            </p>
            <div className="p-4 rounded-xl border border-border/60 bg-muted/30 flex items-center gap-3">
              <Bug className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Security Inquiries & Disclosure</p>
                <a
                  href="mailto:security@careerwise.dev"
                  className="text-xs text-primary hover:underline font-mono"
                >
                  security@careerwise.dev
                </a>
              </div>
            </div>
          </MotionFadeUp>

          {/* 10. Security Updates */}
          <MotionFadeUp className="rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <span className="text-primary font-mono text-lg">10.</span>
              <span>Ongoing Hardening and Updates</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed text-xs md:text-sm">
              We continuously audit dependencies through npm audit, apply security patches, and refine our input validation routines as new attack vectors or edge cases emerge.
            </p>
          </MotionFadeUp>
        </div>
      </div>
    </div>
  );
}
