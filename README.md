<div align="center">

  <img src="public/banner.png" alt="CareerWise AI Banner" width="100%" style="border-radius: 12px; margin-bottom: 20px;" />

  # 🚀 CareerWise AI
  ### *Your Intelligent AI-Powered Career Coach & Growth Platform*

  <p align="center">
    Accelerate your professional growth with personalized AI career guidance, real-time market insights, intelligent ATS resume analysis, dynamic cover letter generation, interactive interview preparation, and visual career roadmaps.
  </p>

  <p align="center">
    <a href="#-key-features"><strong>Explore Features »</strong></a>
    ·
    <a href="#-getting-started"><strong>Quick Start »</strong></a>
    ·
    <a href="#-tech-stack"><strong>Tech Stack »</strong></a>
    ·
    <a href="#-database-architecture"><strong>Architecture »</strong></a>
  </p>

  <!-- Badges -->
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Google_Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
    <img src="https://img.shields.io/badge/Prisma_ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Clerk_Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" alt="Clerk" />
    <img src="https://img.shields.io/badge/Inngest-FF3E00?style=for-the-badge&logo=inngest&logoColor=white" alt="Inngest" />
  </p>

</div>

---

## 📌 Table of Contents

- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ System Architecture](#️-system-architecture)
- [📊 Database Architecture](#-database-architecture)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Background Job Setup (Inngest)](#background-job-setup-inngest)
  - [Run Application](#run-application)
- [⚡ Scripts \& Commands](#-scripts--commands)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Key Features

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>📈 Real-Time Industry Insights & Analytics</h3>
      <ul>
        <li><b>Dynamic Market Analysis:</b> Real-time tracking of growth rates, demand levels, and market outlooks across 60+ industries.</li>
        <li><b>Salary Benchmarks:</b> Role-based minimum, median, and maximum salary visualizer with interactive charts.</li>
        <li><b>Key Skill Forecasts:</b> AI-curated in-demand technical and soft skills to prioritize learning.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>📄 ATS Resume Builder & Deep Analyzer</h3>
      <ul>
        <li><b>Automated ATS Scoring:</b> Full diagnostic scoring (0-100) evaluating contact info, experience, skills, and formatting.</li>
        <li><b>Keyword Gap Analysis:</b> Identifies crucial missing keywords and matches for target roles.</li>
        <li><b>PDF Parsing & Export:</b> Direct PDF resume parsing, live Markdown editor, and instant PDF downloads.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>✍️ AI Cover Letter Generator</h3>
      <ul>
        <li><b>Role & Company Tailored:</b> Generates compelling, personalized cover letters matching candidate experience to job descriptions.</li>
        <li><b>Markdown Live Preview:</b> Built-in rich editor for instant editing and formatting tweaks.</li>
        <li><b>Status & History Management:</b> Save, organize, edit, and export drafts seamlessly.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>🎯 Interactive AI Interview Preparation</h3>
      <ul>
        <li><b>Adaptive Mock Quizzes:</b> Tailored question generation based on role, category (technical/behavioral), and difficulty level.</li>
        <li><b>Instant Scoring & Feedback:</b> Actionable tips, explanation of correct answers, and historical performance tracking.</li>
        <li><b>Progress Analytics:</b> Visual analytics on score trends and readiness over time.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🗺️ Visual Career Roadmap Generator</h3>
      <ul>
        <li><b>Interactive Node Graphs:</b> Visualizes step-by-step career progression nodes using <code>React Flow</code> and <code>Dagre</code>.</li>
        <li><b>Milestone Pathways:</b> Detailed timelines, foundational skills, and actionable growth checkpoints.</li>
        <li><b>Customized to Your Trajectory:</b> Adapts dynamically to your background and career target.</li>
      </ul>
    </td>
    <td width="50%" valign="top">
      <h3>⚡ Automated Background Sync & Scheduling</h3>
      <ul>
        <li><b>Inngest Workflows:</b> Periodic background jobs to fetch, update, and refresh industry salary data and market conditions.</li>
        <li><b>Resilient Cron Jobs:</b> Ensures user dashboards always display up-to-date market trends.</li>
        <li><b>Robust User State Management:</b> Smooth onboarding, Clerk auth sync, and PostgreSQL persistence.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🛠️ Tech Stack

### **Frontend & UI**
- **Framework:** [Next.js 15 (App Router, Turbopack, Server Actions)](https://nextjs.org/)
- **Core Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/), Tailwind Animate
- **Visuals & Charts:** [Recharts](https://recharts.org/), [React Flow](https://reactflow.dev/), [Dagre](https://github.com/dagrejs/dagre)
- **Icons & Editor:** [Lucide React](https://lucide.dev/), [@uiw/react-md-editor](https://uiwjs.github.io/react-md-editor/)
- **PDF Handling:** `pdf2json`, `pdfjs-dist`, `html2pdf.js`

### **Backend, Database & AI**
- **AI Engine:** [Google Gemini Generative AI](https://aistudio.google.com/) (`@google/generative-ai`)
- **Database:** [PostgreSQL (Neon Serverless DB)](https://neon.tech/)
- **ORM:** [Prisma ORM v6](https://www.prisma.io/)
- **Authentication:** [Clerk Auth](https://clerk.com/)
- **Background Jobs & Workflows:** [Inngest](https://www.inngest.com/)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)

---

## 📊 Database Architecture

The application uses PostgreSQL with Prisma ORM. Below is an overview of the core entity relationships:

```mermaid
erDiagram
    User ||--o{ Assessment : "completes"
    User ||--o| Resume : "has"
    User ||--o{ CoverLetter : "generates"
    User ||--o| ResumeAnalysis : "receives"
    User ||--o{ Roadmap : "tracks"
    User }o--o| IndustryInsight : "belongs to"

    User {
        String id PK
        String clerkUserId UK
        String email UK
        String name
        String industry FK
        Boolean isUploaded
        DateTime createdAt
    }

    Assessment {
        String id PK
        String userId FK
        Float quizScore
        Json questions
        String category
        String improvementTip
        DateTime createdAt
    }

    Roadmap {
        String id PK
        String userId FK
        String roadmapTitle
        String description
        String duration
        Json initialNodes
        Json initialEdges
    }

    ResumeAnalysis {
        String id PK
        String userId FK
        Float overallScore
        Float atsScore
        String[] keywordMatches
        String[] keywordGaps
        String[] tipsForImprovement
    }

    Resume {
        String id PK
        String userId FK
        String content
        String fileUrl
    }

    CoverLetter {
        String id PK
        String userId FK
        String companyName
        String jobTitle
        String content
        String status
    }

    IndustryInsight {
        String id PK
        String industry UK
        Float growthRate
        String demandLevel
        Json salaryRanges
        String[] topSkills
        DateTime lastUpdated
    }
```

---

## 📁 Project Structure

```bash
CareerWise-AI/
├── 📁 actions/                 # Next.js Server Actions
│   ├── cover-letter.js         # Cover letter AI generation actions
│   ├── dashboard.js            # Dashboard & industry analytics actions
│   ├── interview.js            # Mock interview quiz & scoring actions
│   ├── resume-analysis.js      # ATS resume analysis & scoring
│   ├── resume.js               # Resume creation, edit & storage
│   ├── road-map.js             # Visual career roadmap actions
│   └── user.js                 # User profile & onboarding sync
├── 📁 app/                     # Next.js App Router
│   ├── 📁 (auth)/              # Clerk Sign-In / Sign-Up pages
│   ├── 📁 (main)/              # Protected application workspace
│   │   ├── 📁 ai-cover-letter/ # AI Cover Letter generator tool
│   │   ├── 📁 dashboard/       # Industry insights & analytics hub
│   │   ├── 📁 interview/       # AI interview quiz & assessment prep
│   │   ├── 📁 onboarding/      # User industry & preference onboarding
│   │   ├── 📁 resume/          # ATS resume scanner & editor
│   │   └── 📁 roadmap/         # Interactive React Flow career roadmap
│   ├── 📁 api/inngest/         # Inngest webhook route handler
│   ├── 📁 data/                # Static configuration & landing data
│   ├── globals.css             # Design tokens, variables & dark mode
│   ├── layout.js               # Root layout & providers
│   └── page.jsx                # Landing page
├── 📁 components/              # Reusable UI components & layouts
│   ├── 📁 ui/                  # Shadcn & Radix UI primitives
│   ├── header.jsx              # Navigation header with Clerk Auth
│   ├── hero.jsx                # Interactive hero section
│   └── theme-provider.jsx      # Dark / light theme provider
├── 📁 hooks/                   # Custom React hooks (use-fetch, etc.)
├── 📁 lib/                     # Utilities & integrations
│   ├── 📁 inngest/             # Inngest background functions & client
│   ├── checkUser.js            # Clerk user verification helper
│   ├── prisma.js               # Prisma client singleton instance
│   └── utils.js                # Tailwind & class merge utilities
├── 📁 prisma/                  # Database schema & migrations
│   └── schema.prisma           # Prisma schema definition
├── 📁 public/                  # Static assets & banner
├── .env.example                # Environment variable template
├── middleware.js               # Clerk authentication route middleware
├── package.json                # Project dependencies & scripts
└── tailwind.config.mjs         # Tailwind configuration & design tokens
```

---

## 🚀 Getting Started

Follow these instructions to set up and run CareerWise AI locally on your machine.

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v18.17 or higher / recommended v20+)
- **npm**, **yarn**, **pnpm**, or **bun**
- A **PostgreSQL** database (e.g., [Neon DB](https://neon.tech), [Supabase](https://supabase.com), or Local Postgres)
- Accounts for API keys:
  - [Google AI Studio](https://aistudio.google.com/) (Gemini API Key)
  - [Clerk Dashboard](https://dashboard.clerk.com/) (Authentication Keys)

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/careerwise-ai.git
   cd careerwise-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

---

### Environment Variables

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Populate the required credentials:

```env
# 🐘 Database Connection (PostgreSQL / Neon / Supabase)
DATABASE_URL="postgresql://username:password@ep-sample-pooler.us-east-2.aws.neon.tech/careerwise_ai?sslmode=require"

# 🔐 Clerk Authentication (https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# 🔄 Clerk Route Configuration
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# 🧠 Google Gemini AI Key (https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key
```

---

### Database Setup

Initialize and sync your Prisma schema with your PostgreSQL database:

```bash
# Generate Prisma Client
npx prisma generate

# Push the schema state to your database
npx prisma db push
```

*(Optional)* Open Prisma Studio to view and manage your database GUI:
```bash
npx prisma studio
```

---

### Background Job Setup (Inngest)

CareerWise AI uses **Inngest** to execute automated industry insight updates and cron jobs.

In a separate terminal, launch the local Inngest Dev Server:
```bash
npx inngest-cli@latest dev
```
Access the Inngest Dev Dashboard at [http://localhost:8288](http://localhost:8288).

---

### Run Application

Start the Next.js development server with Turbopack:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚡ Scripts & Commands

| Command | Description |
| :--- | :--- |
| `npm run dev` | Generates Prisma client and runs the Next.js development server with Turbopack |
| `npm run build` | Generates Prisma client and creates an optimized production build |
| `npm run start` | Runs the compiled Next.js production server |
| `npm run lint` | Runs ESLint to check for code quality and syntax issues |
| `npm run fix` | Resets the Prisma database migration state and applies migrations |
| `npx inngest-cli@latest dev` | Starts the Inngest local development server on port 8288 |
| `npx prisma studio` | Opens an interactive web interface for your PostgreSQL database |

---

## 🔒 Security & Best Practices

- 🛡️ **Protected Route Middleware:** Seamless authentication boundary via `@clerk/nextjs` middleware preventing unauthorized access to workspace tools.
- ⚡ **Server Actions:** Secure server-side mutations using Next.js Server Actions with user validation.
- 🎯 **Prompt Engineering & Schema Enforcement:** Gemini AI generation steps strictly enforce structured JSON and Markdown formats for zero hallucination.

---

## 🤝 Contributing

Contributions make the open-source community an inspiring place to learn, inspire, and create! Any contributions you make are **greatly appreciated**.

1. **Fork the Project**
2. **Create your Feature Branch:** `git checkout -b feature/AmazingFeature`
3. **Commit your Changes:** `git commit -m "Add some AmazingFeature"`
4. **Push to the Branch:** `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Built with ❤️ using <b>Next.js 15</b>, <b>Google Gemini AI</b>, <b>Prisma</b>, and <b>Tailwind CSS</b></p>
  <p>⭐ Star this repository if you find it helpful!</p>
</div>
