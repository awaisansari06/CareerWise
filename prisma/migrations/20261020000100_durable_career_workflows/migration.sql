-- Additive only: retain all existing user, assessment, resume and roadmap data.
ALTER TABLE "Assessment" ADD COLUMN "selectedAnswers" JSONB NOT NULL DEFAULT '[]', ADD COLUMN "progressVersion" INTEGER NOT NULL DEFAULT 0;
CREATE TABLE "CareerJob" (
 "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "kind" TEXT NOT NULL,
 "status" TEXT NOT NULL DEFAULT 'QUEUED', "activeKey" TEXT, "input" JSONB NOT NULL, "result" JSONB,
 "resumeVersion" TIMESTAMP(3), "attempt" INTEGER NOT NULL DEFAULT 0, "error" TEXT,
 "dismissed" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL, "startedAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3),
 CONSTRAINT "CareerJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
 CONSTRAINT "CareerJob_status_check" CHECK ("status" IN ('QUEUED','RUNNING','COMPLETED','FAILED')),
 CONSTRAINT "CareerJob_kind_check" CHECK ("kind" IN ('RESUME_PARSE','RESUME_ANALYSIS','INSIGHTS','INTERVIEW_QUIZ','COVER_LETTER','ROADMAP'))
);
CREATE UNIQUE INDEX "CareerJob_activeKey_key" ON "CareerJob"("activeKey");
CREATE INDEX "CareerJob_userId_status_createdAt_idx" ON "CareerJob"("userId","status","createdAt");
CREATE INDEX "CareerJob_status_updatedAt_idx" ON "CareerJob"("status","updatedAt");
CREATE TABLE "ResumeWorkspace" (
 "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "resumeVersion" TIMESTAMP(3) NOT NULL,
 "draft" TEXT NOT NULL, "addressed" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[], "version" INTEGER NOT NULL DEFAULT 0,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "ResumeWorkspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ResumeWorkspace_userId_key" ON "ResumeWorkspace"("userId");
CREATE TABLE "CareerExploration" (
 "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "selectedRole" TEXT, "comparison" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
 "version" INTEGER NOT NULL DEFAULT 0, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "CareerExploration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "CareerExploration_userId_key" ON "CareerExploration"("userId");
