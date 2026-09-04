<div align="center">

  <img src="public/Banner-Dark.png" alt="CareerWise Banner" width="100%" style="border-radius: 12px; margin-bottom: 20px;" />

  # CareerWise
  ### *AI-Powered Career Intelligence Platform*

  <p align="center">
    CareerWise is an AI-powered career intelligence platform that connects resume analysis, skill-gap discovery, interview preparation, career planning, cover-letter generation, and industry insights in one personalized workspace.
  </p>

  <p align="center">
    Instead of treating these tasks as separate tools, CareerWise connects them around your profile and career goals so you can understand where you stand, identify what to improve, and plan your next move.
  </p>

  <p align="center">
    <a href="#-why-careerwise"><strong>Why CareerWise »</strong></a>
    ·
    <a href="#-key-features"><strong>Explore Features »</strong></a>
    ·
    <a href="#-system-architecture"><strong>Architecture »</strong></a>
    ·
    <a href="#-tech-stack"><strong>Tech Stack »</strong></a>
    ·
    <a href="#-getting-started"><strong>Quick Start »</strong></a>
  </p>

  <!-- Status Badges -->
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-15.5-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 15" />
    <img src="https://img.shields.io/badge/React-19.0-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Google_Gemini-Flash_Lite-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
    <img src="https://img.shields.io/badge/Prisma_ORM-6.19-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/PostgreSQL-Neon-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Clerk_Auth-6.39-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk" />
    <img src="https://img.shields.io/badge/Inngest-4.18-FF3E00?style=for-the-badge&logo=inngest&logoColor=white" alt="Inngest" />
  </p>

</div>

---

## 📌 Table of Contents

- [🎯 Why CareerWise?](#-why-careerwise)
- [🖥️ Product Preview](#️-product-preview)
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ System Architecture](#️-system-architecture)
- [📊 Database Architecture](#-database-architecture)
- [🔒 Security & Reliability](#-security--reliability)
- [⚡ Performance](#-performance)
- [🧪 Testing](#-testing)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Background Processing Setup](#background-processing-setup)
  - [Running the Application](#running-the-application)
- [📜 Scripts & Commands](#-scripts--commands)
- [🌐 SEO & Public Website](#-seo--public-website)
- [🚢 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Why CareerWise?

Most job seekers manage their careers with fragmented tools: one site for resume scanning, another for practice questions, disconnected spreadsheets for skills, and static blogs for salary trends.

CareerWise integrates these steps into a unified, feedback-driven pipeline:

- **Your Experience:** Structured profile information derived from your actual resume.
- **Your Resume:** Instant ATS-oriented diagnostics, formatting evaluations, and keyword gap discovery.
- **Your Skills:** Clear identification of existing competencies alongside missing requirements.
- **Interview Preparation:** Adaptive role-specific practice assessments with server-side evaluation.
- **Career Roadmap:** Visual milestone graphs that translate goals into sequenced skill acquisition.
- **Industry Intelligence:** Market outlook, demand levels, and salary benchmarks in Indian Rupees (INR).

By connecting these workflows around a single user profile, CareerWise enables informed decision-making and continuous professional readiness rather than isolated, one-off checks.

---

## 🖥️ Product Preview

CareerWise includes adaptive themes tailored for focused preparation in both dark and light modes:

<div align="center">
  <table>
    <tr>
      <td width="50%" align="center">
        <b>Dark Theme (Default)</b><br/><br/>
        <img src="public/Banner-Dark.png" alt="CareerWise Dark Mode Preview" width="100%" style="border-radius: 8px;" />
      </td>
      <td width="50%" align="center">
        <b>Light Theme</b><br/><br/>
        <img src="public/Banner-Light.png" alt="CareerWise Light Mode Preview" width="100%" style="border-radius: 8px;" />
      </td>
    </tr>
  </table>
</div>

---

## ✨ Key Features

### 📄 Resume Intelligence
- **PDF Upload & Validation:** Secure server-side validation ensuring valid `%PDF-` file headers and enforcing a 5MB size limit.
- **ATS Diagnostic Analysis:** Comprehensive diagnostic scoring (0–100) across contact information, professional experience, education, and technical skills.
- **Keyword Matching & Gap Detection:** Identifies critical missing domain keywords and evaluates keyword density for target industry alignment.
- **Actionable Recommendations:** Structured tips highlighting positive elements and targeted areas for improvement.
- **Single Active Resume Model:** Supports updating or replacing an existing resume at any time, automatically refreshing personal skills and invalidating outdated diagnostic caches.

### ✍️ Cover Letter Generator
- **Role & Company Alignment:** Generates tailored cover letters contextualized to the candidate's parsed background and specific job descriptions.
- **Interactive Markdown Editor:** Live in-browser editing and formatting using `@uiw/react-md-editor`.
- **Draft & History Management:** Save, organize, edit, and track status across multiple job applications.

### 🎯 Interview Preparation
- **Targeted Quiz Generation:** Generates customized question sets based on selected role, difficulty level, and category (Technical or Behavioral).
- **Server-Side Scoring & Integrity:** Quiz answers and scoring logic are maintained strictly on the server to prevent client-side answer disclosure.
- **Comprehensive Feedback:** Detailed answer explanations and actionable improvement tips returned upon submission.
- **Historical Assessment Tracking:** Tracks performance trends across completed attempts to visualize interview readiness.

### 🗺️ Career Roadmaps
- **Interactive Visual Progression:** Generates node-and-edge career roadmaps rendered with React Flow and organized using the Dagre layout engine.
- **Milestones & Skill Acquisition:** Sequential milestones that categorize core competencies, project recommendations, and progression timelines.
- **Cached & Regenerable:** Reuses existing roadmaps across sessions while supporting on-demand regeneration when career goals change.

### 📊 Industry & Market Intelligence
- **Market Dynamics:** Industry growth rates, current demand ratings, and forward-looking market outlook across over 60 industry tracks.
- **Salary Benchmarks in Indian Rupees (INR):** Role-specific minimum, median, and maximum compensation visualized with interactive Recharts charts.
- **In-Demand Skill Prioritization:** Ranked lists of top technical proficiencies and high-value industry certifications.
- **Background Refresh:** Industry insights are cached in PostgreSQL and periodically refreshed asynchronously to maintain current data without slowing down user interactions.

### 🔄 Background Processing
- **Inngest Workflow Orchestration:** Scheduled background functions handle recurring industry data refreshes and heavy processing tasks outside the synchronous HTTP request path.

---

## 🛠️ Tech Stack

### Frontend & UI
- **Framework:** [Next.js 15.5](https://nextjs.org/) (App Router, Turbopack, Server Actions)
- **Core Library:** [React 19.0](https://react.dev/)
- **Styling:** [Tailwind CSS 3.4](https://tailwindcss.com/) with `tailwindcss-animate`
- **Component Primitives:** [Shadcn UI](https://ui.shadcn.com/) built on [Radix UI](https://www.radix-ui.com/)
- **Visualizations & Node Graphs:** [React Flow 11.11](https://reactflow.dev/) and [Dagre 0.8](https://github.com/dagrejs/dagre)
- **Charts:** [Recharts 3.1](https://recharts.org/)
- **Markdown Editing:** [@uiw/react-md-editor 4.0](https://uiwjs.github.io/react-md-editor/)
- **Icons & Polish:** [Lucide React](https://lucide.dev/), [Framer Motion 12.23](https://www.framer.com/motion/)
- **Theme Management:** [next-themes](https://github.com/pacocoursey/next-themes) (Class-based dark/light support)

### Backend, Data & AI
- **AI Platform:** [Google Gemini AI](https://ai.google.dev/) (`@google/generative-ai` v0.24, Gemini 2.5 Flash Lite)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (Compatible with [Neon](https://neon.tech), Supabase, or self-hosted)
- **ORM:** [Prisma ORM 6.19](https://www.prisma.io/)
- **Authentication:** [Clerk Auth 6.39](https://clerk.com/) (`@clerk/nextjs`, `@clerk/themes`)
- **Background Jobs:** [Inngest 4.18](https://www.inngest.com/)
- **Schema Validation:** [Zod 4.0](https://zod.dev/)
- **Forms:** [React Hook Form 7.61](https://react-hook-form.com/) with `@hookform/resolvers`

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Client Browser (React 19 / Next.js 15)"]
        UI[Workspace UI & Dashboard]
        Flow[React Flow Roadmap]
        Editor[Markdown Cover Letter Editor]
        Charts[Recharts Salary Visualizer]
    end

    subgraph MiddlewareLayer["Edge Middleware"]
        ClerkMid["Clerk Authentication Guard (middleware.js)"]
    end

    subgraph ServerLayer["Server Layer (Next.js Server Actions)"]
        AuthCheck["Authentication & Ownership Check"]
        Val["Zod Schema & PDF Header Validator"]
        Actions["Feature Actions (Resume, Quiz, Roadmap, Letter)"]
    end

    subgraph BackgroundLayer["Background Processing"]
        Inngest["Inngest Client & Runner"]
        CronJob["Industry Insight Periodic Refresh"]
    end

    subgraph Services["External Services & Storage"]
        Gemini["Google Gemini AI (Structured JSON Extraction)"]
        Neon["PostgreSQL Database (Prisma ORM)"]
        ClerkService["Clerk User Management"]
    end

    UI --> ClerkMid
    ClerkMid --> AuthCheck
    AuthCheck --> Val
    Val --> Actions
    Actions -->|Cached Read / Mutation| Neon
    Actions -->|External AI Invocation| Gemini
    Actions --> ClerkService
    Inngest --> CronJob
    CronJob --> Gemini
    CronJob --> Neon
    Actions -.->|Trigger Background Task| Inngest
```

---

## 📊 Database Architecture

The schema maintains clean isolation between user records, single-active documents, and historical multi-record collections:

```mermaid
erDiagram
    User ||--o| Resume : "has (1-to-1)"
    User ||--o| ResumeAnalysis : "receives (1-to-1)"
    User ||--o| Roadmap : "tracks (1-to-1)"
    User ||--o{ CoverLetter : "generates (1-to-many)"
    User ||--o{ Assessment : "completes (1-to-many)"
    IndustryInsight ||--o{ User : "categorizes (1-to-many)"

    User {
        String id PK
        String clerkUserId UK
        String email UK
        String name
        String imageUrl
        String industry FK
        Boolean isUploaded
        DateTime createdAt
        DateTime updatedAt
    }

    Resume {
        String id PK
        String userId UK "FK -> User.id"
        String content "Markdown text"
        String filename
        String fileUrl
        DateTime createdAt
        DateTime updatedAt
    }

    ResumeAnalysis {
        String id PK
        String userId UK "FK -> User.id"
        Float overallScore
        Float atsScore
        Float contactScore
        Float experienceScore
        Float educationScore
        Float skillsScore
        String[] keywordMatches
        String[] keywordGaps
        String[] tipsForImprovement
        DateTime createdAt
        DateTime updatedAt
    }

    Roadmap {
        String id PK
        String userId UK "FK -> User.id"
        String roadmapTitle
        String description
        String industry
        String duration
        Json initialNodes
        Json initialEdges
        DateTime createdAt
        DateTime updatedAt
    }

    Assessment {
        String id PK
        String userId FK "FK -> User.id"
        Float quizScore
        Json questions
        String category
        String improvementTip
        DateTime createdAt
        DateTime updatedAt
    }

    CoverLetter {
        String id PK
        String userId FK "FK -> User.id"
        String companyName
        String jobTitle
        String jobDescription
        String content "Markdown text"
        String status "draft | completed"
        DateTime createdAt
        DateTime updatedAt
    }

    IndustryInsight {
        String id PK
        String industry UK "Unique Industry Key"
        Float growthRate
        String demandLevel "High | Medium | Low"
        Json salaryRanges "INR Compensation Data"
        String[] topSkills
        String marketOutlook "Positive | Neutral | Negative"
        String[] keyTrends
        String[] recommendedSkills
        DateTime lastUpdated
        DateTime nextUpdate
    }
```

---

## 🔒 Security & Reliability

CareerWise implements defensive programming across authentication, data mutations, and AI integrations:

- **Route Protection:** Handled via Clerk Edge middleware (`middleware.js`), restricting workspace routes (`/dashboard`, `/resume`, `/interview`, `/roadmap`, `/ai-cover-letter`, `/onboarding`) while maintaining public access to the landing page and auth handlers.
- **Server-Side Authorization Checks:** Every Server Action independently validates user identity via `auth()` and enforces ownership boundaries. Cross-user mutations or queries return unauthorized or null.
- **Server-Side Quiz Scoring:** Quiz questions are sanitized before reaching the browser. Answer verification and final score calculations occur strictly on the server.
- **File & Binary Validation:** Uploaded resumes undergo magic-byte verification (`%PDF-`) to reject disguised executables and strictly enforce a 5MB size limit before buffering or processing.
- **Structured Output Validation:** AI outputs are parsed through defensive extraction helpers and validated against strict Zod schemas. Structured output validation and defensive parsing reduce malformed or unsafe AI responses.
- **Prompt Injection Defense:** User-supplied text (resumes and job descriptions) is enclosed in XML-style delimiter blocks paired with explicit AI safety directives to treat user input as passive data.
- **Bounded AI Resilience:** Gemini calls implement an explicit 25-second timeout and capped exponential retries (max 2 attempts) for transient rate limits (HTTP 429), failing fast on non-retryable client errors.
- **Decoupled Database Transactions:** External AI invocations run strictly outside database transaction blocks to prevent holding connection pool locks during generative calls.
- **Security Response Headers:** Configured via `next.config.mjs` to include `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and restricted permissions policies.
- **Sanitized Logging:** Error utilities mask database internal details, table names, and sensitive keys from client-facing messages.

---

## ⚡ Performance

- **Cached Industry Insights:** Market data is stored with scheduled `nextUpdate` timestamps, allowing dashboards to load immediately from PostgreSQL without triggering duplicate Gemini calls.
- **Cached Roadmaps:** User roadmaps persist as structured node/edge JSON; repeated visits load cached data instantly unless the user explicitly requests regeneration.
- **Selective Field Projection:** Server actions use Prisma `select` projections to fetch only the fields required for preview cards (e.g., omitting large markdown bodies in cover letter list views).
- **Client Component Code Splitting:** Heavier client modules (`@uiw/react-md-editor`, React Flow canvas) load dynamically to keep initial bundle sizes minimal.
- **Optimized Static Delivery:** Brand assets and banners are served in modern vector SVG and compressed PNG formats.
- **Asynchronous Processing:** Heavy recurring tasks run as background Inngest jobs rather than blocking synchronous user requests.

---

## 🧪 Testing

The repository features an automated integration and unit test suite executed using Node.js's native test runner (`node --test`).

```bash
npm test
```

### Verified Test Coverage (165 Tests across 27 Suites)
- **AI Reliability & Schema Conformance:** JSON extraction, malformed recovery, safety delimiter checks, and schema validation.
- **Data Integrity & Authorization Hardening:** Name formatting, ownership enforcement, cross-user isolation, and invalidation hooks.
- **Interview Security & Anti-Tampering:** Client payload sanitization, server-side grading, and replay prevention.
- **Resume Upload & Single-Resume Lifecycle:** File extension rejection, magic-byte validation, 5MB limit enforcement, upsert deduplication, and analysis invalidation.
- **Resume Replacement & Dashboard Sync:** Cross-domain industry re-evaluation, personal skill synchronization, and cached insight reuse.
- **Roadmap Generation Integrity:** Unique constraint conflict prevention and on-demand regeneration flows.
- **Production Hardening & Reliability:** Environment variable validation, timeout boundaries, rate-limit retry logic, and security header checks.
- **Salary Currency Standards:** Verification that salary formatting and data structures conform to Indian Rupee (INR) specifications.

> **Note:** These automated tests validate backend actions, security rules, AI sanitization, and data contracts. They do not substitute for browser-level end-to-end (E2E) automation.

---

## 📁 Project Structure

```bash
CareerWise/
├── 📁 actions/                 # Next.js Server Actions
│   ├── cover-letter.js         # Cover letter generation, retrieval & deletion
│   ├── dashboard.js            # Dashboard aggregation & industry insights
│   ├── interview.js            # Mock interview quiz generation & server-side scoring
│   ├── resume-analysis.js      # ATS resume diagnostic analysis & scoring
│   ├── resume.js               # Resume upload, validation, parsing & replacement
│   ├── road-map.js             # Visual career roadmap generation & regeneration
│   └── user.js                 # User profile initialization & onboarding sync
├── 📁 app/                     # Next.js App Router
│   ├── 📁 (auth)/              # Clerk authentication routes (/sign-in, /sign-up)
│   ├── 📁 (main)/              # Authenticated workspace routes
│   │   ├── 📁 ai-cover-letter/ # Tailored cover letter generator & editor
│   │   ├── 📁 dashboard/       # Career metrics & market intelligence dashboard
│   │   ├── 📁 interview/       # Adaptive mock interview quiz & history
│   │   ├── 📁 onboarding/      # User industry selection & profile setup
│   │   ├── 📁 resume/          # ATS resume scanner & diagnostic feedback
│   │   └── 📁 roadmap/         # Interactive React Flow career progression tree
│   ├── 📁 api/inngest/         # Inngest webhook route handler
│   ├── 📁 data/                # Static industries, features & FAQs
│   ├── globals.css             # Tailwind design tokens & dark theme variables
│   ├── icon.svg                # Application browser favicon (SVG)
│   ├── layout.js               # Root layout with Clerk, Theme & Sonner providers
│   ├── not-found.jsx           # Dynamic 404 page
│   ├── page.jsx                # Public landing page with schema markup
│   ├── robots.js               # Dynamic robots.txt configuration
│   └── sitemap.js              # Dynamic XML sitemap generator
├── 📁 components/              # React UI components
│   ├── 📁 ui/                  # Shadcn UI primitives (dialog, button, select, etc.)
│   ├── AppLayout.jsx           # Authenticated workspace layout wrapper
│   ├── body-scroll-fix.tsx     # Radix modal scroll fix utility
│   ├── careerwise-logo.jsx     # Official CareerWise vector SVG logo
│   ├── header.jsx              # Navigation navbar with Clerk auth buttons
│   ├── hero.jsx                # Landing hero with theme-aware banner switching
│   ├── theme-provider.jsx      # next-themes wrapper
│   └── theme-toggle.jsx        # Dark/Light/System theme dropdown toggle
├── 📁 hooks/                   # Custom React hooks (use-fetch)
├── 📁 lib/                     # Core utilities, clients & helpers
│   ├── 📁 inngest/             # Inngest client & background cron handlers
│   ├── checkUser.js            # Clerk-to-Prisma user sync helper
│   ├── env-validator.js        # Production environment variable validation
│   ├── gemini.js               # Gemini client, structured prompt runners & retry logic
│   ├── prisma.js               # Global Prisma client singleton
│   ├── resume-validator.js     # Server-side PDF validation & magic-byte check
│   ├── salary-utils.js         # Indian Rupee (INR) salary formatting & Lakhs helpers
│   ├── site-config.js          # Centralized site metadata & SEO constants
│   └── utils.js                # Tailwind class merge helper (cn)
├── 📁 prisma/                  # Database configuration
│   ├── 📁 migrations/          # Version-controlled Prisma migration history
│   └── schema.prisma           # Relational schema definition
├── 📁 public/                  # Public static assets
│   ├── Banner-Dark.png         # Dark mode application banner preview
│   ├── Banner-Light.png        # Light mode application banner preview
│   └── favicon.svg             # Static favicon fallback
├── 📁 tests/                   # Automated test suites (165 automated tests)
├── .env.example                # Environment variable template
├── .gitignore                  # Git ignore rules
├── components.json             # Shadcn UI component configuration
├── eslint.config.mjs           # ESLint 9 configuration
├── jsconfig.json               # Path alias configuration (@/*)
├── middleware.js               # Clerk route protection middleware
├── next.config.mjs             # Next.js configuration & security headers
├── package.json                # Project dependencies & scripts
└── tailwind.config.mjs         # Tailwind CSS styling tokens
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** v18.18+ or v20+ recommended
- **Package Manager:** npm (bundled with Node.js)
- **PostgreSQL Database:** A running PostgreSQL instance (e.g., [Neon](https://neon.tech), [Supabase](https://supabase.com), or local Postgres)
- **API Keys:**
  - [Clerk Dashboard](https://dashboard.clerk.com/) (Publishable and Secret keys)
  - [Google AI Studio](https://aistudio.google.com/) (Gemini API key)
  - [Inngest Cloud / CLI](https://www.inngest.com/) (Optional for background processing)

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd CareerWise
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

---

### Environment Variables

Create a local `.env` configuration file by copying the template:

```bash
cp .env.example .env
```

Populate the required credentials:

```env
# 🐘 Database Connection (PostgreSQL with connection pooling recommended)
DATABASE_URL="postgresql://username:password@localhost:5432/careerwise?sslmode=require"

# 🔐 Clerk Authentication (https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# 🔄 Clerk Route Handlers
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# 🧠 Google Gemini AI Key (https://aistudio.google.com/)
GEMINI_API_KEY=AIzaSy...

# 🌐 Application Base URL (Optional - defaults to https://careerwise.dev)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

### Database Setup

1. **Generate the Prisma client:**
   ```bash
   npx prisma generate
   ```

2. **Apply migrations (Development):**
   ```bash
   npx prisma migrate dev
   ```

   *For production deployments, apply existing migrations without creating new ones:*
   ```bash
   npx prisma migrate deploy
   ```

3. *(Optional)* Launch Prisma Studio GUI to inspect your data:
   ```bash
   npx prisma studio
   ```

---

### Background Processing Setup

CareerWise uses **Inngest** to schedule and run background data refreshes.

In a separate terminal, launch the local Inngest Dev Server:
```bash
npx inngest-cli@latest dev
```
Access the Inngest local dashboard at [http://localhost:8288](http://localhost:8288).

---

### Running the Application

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Scripts & Commands

The project defines the following scripts in `package.json`:

| Command | Description |
|---|---|
| `npm run dev` | Runs `prisma generate` and starts the Next.js development server with Turbopack |
| `npm run build` | Runs `prisma generate` and compiles the Next.js application for production |
| `npm run start` | Starts the production server using the built `.next` bundle |
| `npm run lint` | Runs ESLint to inspect code quality and type safety |
| `npm test` | Executes the complete automated test suite (165 tests across 27 suites) using Node's test runner |
| `npm run fix` | ⚠️ **Development reset utility only:** Runs `prisma migrate reset` (drops data) and `prisma migrate dev`. **Do not run in production!** |

### Additional Tooling Commands

| Command | Description |
|---|---|
| `npx prisma studio` | Opens a local web interface to browse database tables |
| `npx prisma migrate deploy` | Applies pending Prisma migrations to a production database |
| `npx inngest-cli@latest dev` | Launches the local Inngest development server on port 8288 |

---

## 🌐 SEO & Public Website

CareerWise incorporates foundational technical and on-page SEO best practices:

- **Metadata Architecture:** Unified metadata managed via `lib/site-config.js` with dynamic title templates and descriptions.
- **Sitemap & Robots:** Dynamically generated XML sitemap (`/sitemap.xml`) and crawler control (`/robots.txt`).
- **Structured Data:** Schema.org JSON-LD definitions on the homepage covering Organization, SoftwareApplication, and WebSite schemas.
- **OpenGraph & Social Sharing:** Responsive OpenGraph and Twitter card tags referencing high-resolution banner previews.

---

## 🚢 Deployment

When deploying CareerWise to production environments (such as Vercel):

1. **Environment Variables:** Ensure all required variables (`DATABASE_URL`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `GEMINI_API_KEY`) are configured across **Production** and **Preview** environments.
2. **Database Migrations:** Run `npx prisma migrate deploy` during the build or release phase to ensure the schema is in sync without data loss.
3. **Connection Pooling:** Use a pooled connection string (such as Neon's pooled endpoint) to handle serverless database connections smoothly.
4. **Build Step:** Configure the build command as `npm run build`.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Run the test suite: `npm test && npm run lint`
5. Push to your branch: `git push origin feature/your-feature`
6. Open a Pull Request with a clear summary of your changes.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<div align="center">
  <p>Built with <b>Next.js 15</b>, <b>React 19</b>, <b>Prisma</b>, <b>Tailwind CSS</b>, and <b>Google Gemini AI</b></p>
</div>
