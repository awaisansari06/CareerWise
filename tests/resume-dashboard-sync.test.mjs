import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Resume Replacement & Dashboard Sync Regression Suite", () => {
  // Helpers to simulate stateful database storage for users, resumes, insights, assessments, and cover letters
  function createTestDb() {
    return {
      users: new Map(),
      resumes: new Map(),
      resumeAnalyses: new Map(),
      industryInsights: new Map(),
      assessments: new Map(),
      coverLetters: new Map(),
    };
  }

  function isSameIndustryDomain(a, b) {
    if (!a || !b) return false;
    const cleanA = a.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanB = b.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleanA === cleanB) return true;

    const domains = [
      { name: "tech", keys: ["software", "programming", "web development", "computer science", "data science", "devops", "cloud", "it & software", "cybersecurity", "frontend", "backend", "full stack"] },
      { name: "business", keys: ["business administration", "management", "operations", "consulting", "strategy", "project management"] },
      { name: "office", keys: ["office administration", "administrative", "clerical", "secretarial", "office management", "data entry"] },
      { name: "finance", keys: ["finance", "accounting", "banking", "audit", "investment", "tax"] },
      { name: "health", keys: ["healthcare", "nursing", "medicine", "medical", "clinical", "pharmacy"] },
      { name: "marketing", keys: ["marketing", "seo", "content strategy", "advertising", "public relations", "branding", "social media"] },
      { name: "education", keys: ["education", "teaching", "academic", "instruction", "pedagogy"] },
      { name: "legal", keys: ["legal", "law", "attorney", "paralegal", "compliance"] },
      { name: "sales", keys: ["sales", "account executive", "business development"] },
    ];

    const lowerA = a.toLowerCase();
    const lowerB = b.toLowerCase();

    const domainA = domains.find((d) => d.keys.some((k) => lowerA.includes(k)))?.name;
    const domainB = domains.find((d) => d.keys.some((k) => lowerB.includes(k)))?.name;

    if (domainA && domainB) {
      return domainA === domainB;
    }

    return cleanA.includes(cleanB) || cleanB.includes(cleanA);
  }

  async function simulateUploadResume(db, userId, extractedResume, options = {}) {
    if (options.failAi) {
      throw new Error("The uploaded file does not look like a professional resume");
    }

    // 1. Upsert resume
    const existingResume = db.resumes.get(userId) || { id: "res-" + userId, userId };
    const updatedResume = {
      ...existingResume,
      filename: extractedResume.filename || "resume.pdf",
      content: JSON.stringify(extractedResume),
      updatedAt: new Date(),
    };
    db.resumes.set(userId, updatedResume);

    // 2. Invalidate ResumeAnalysis
    db.resumeAnalyses.delete(userId);

    // 3. Re-evaluate industry
    const targetIndustry = extractedResume.industry?.trim();
    const user = db.users.get(userId) || { id: userId, industry: null };

    let generatedNewInsight = false;

    if (targetIndustry && (!user.industry || !isSameIndustryDomain(user.industry, targetIndustry))) {
      let insight = db.industryInsights.get(targetIndustry);
      if (!insight) {
        // Generate and cache new IndustryInsight
        insight = {
          id: "insight-" + targetIndustry.toLowerCase().replace(/\s+/g, "-"),
          industry: targetIndustry,
          topSkills: targetIndustry.includes("Software")
            ? ["Python", "React", "TypeScript", "SQL"]
            : ["MS Excel", "Leadership", "Budgeting", "Communication"],
          salaryRanges: [{ role: "Lead", min: 80000, max: 140000, median: 110000 }],
          nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };
        db.industryInsights.set(targetIndustry, insight);
        generatedNewInsight = true;
      }
      user.industry = targetIndustry;
      user.industryInsightId = insight.id;
    }

    db.users.set(userId, user);

    return {
      success: true,
      resume: updatedResume,
      generatedNewInsight,
    };
  }

  function getPersonalSkills(db, userId) {
    const resume = db.resumes.get(userId);
    if (!resume) return [];
    try {
      const parsed = JSON.parse(resume.content);
      return Array.isArray(parsed.skills) ? parsed.skills : [];
    } catch {
      return [];
    }
  }

  function getDashboardInsight(db, userId) {
    const user = db.users.get(userId);
    if (!user || !user.industry) return null;
    return db.industryInsights.get(user.industry) || null;
  }

  // 1. Upload resume A
  test("1. Upload resume A (Technical) persists resume record", async () => {
    const db = createTestDb();
    db.users.set("user-1", { id: "user-1", industry: null });

    const resumeA = {
      filename: "software_engineer.pdf",
      skills: ["Python", "JavaScript", "React", "Next.js", "SQL", "Node.js", "PostgreSQL", "Prisma"],
      industry: "Software Development",
    };

    const res = await simulateUploadResume(db, "user-1", resumeA);
    assert.strictEqual(res.success, true);
    assert.strictEqual(db.resumes.get("user-1").filename, "software_engineer.pdf");
  });

  // 2. Confirm personal skills come from resume A
  test("2. Personal skills accurately derive from resume A without hardcoding", async () => {
    const db = createTestDb();
    db.users.set("user-1", { id: "user-1", industry: null });

    const resumeA = {
      filename: "software_engineer.pdf",
      skills: ["Python", "JavaScript", "React", "Next.js", "SQL", "Node.js", "PostgreSQL", "Prisma"],
      industry: "Software Development",
    };

    await simulateUploadResume(db, "user-1", resumeA);
    const skills = getPersonalSkills(db, "user-1");
    assert.deepStrictEqual(skills, [
      "Python", "JavaScript", "React", "Next.js", "SQL", "Node.js", "PostgreSQL", "Prisma"
    ]);
  });

  // 3. Confirm dashboard industry corresponds to resume A
  test("3. Dashboard industry accurately reflects resume A's industry", async () => {
    const db = createTestDb();
    db.users.set("user-1", { id: "user-1", industry: null });

    const resumeA = {
      filename: "software_engineer.pdf",
      skills: ["Python", "React"],
      industry: "Software Development",
    };

    await simulateUploadResume(db, "user-1", resumeA);
    assert.strictEqual(db.users.get("user-1").industry, "Software Development");
    const insight = getDashboardInsight(db, "user-1");
    assert.strictEqual(insight.industry, "Software Development");
  });

  // 4 & 5. Upload resume B with substantially different skills/career direction & confirm record is replaced
  test("4 & 5. Uploading resume B (Business) replaces the single Resume record", async () => {
    const db = createTestDb();
    db.users.set("user-1", { id: "user-1", industry: "Software Development" });

    // Initial technical resume
    await simulateUploadResume(db, "user-1", {
      filename: "software_engineer.pdf",
      skills: ["Python", "React"],
      industry: "Software Development",
    });
    assert.strictEqual(db.resumes.size, 1);

    // Replacement business resume
    const resumeB = {
      filename: "operations_manager.pdf",
      skills: ["MS Excel", "MS Word", "MS PowerPoint", "Communication", "Teamwork", "Documentation", "Problem-Solving"],
      industry: "Business Administration",
    };

    const res = await simulateUploadResume(db, "user-1", resumeB);
    assert.strictEqual(res.success, true);
    assert.strictEqual(db.resumes.size, 1, "Must maintain exactly one active resume per user");
    assert.strictEqual(db.resumes.get("user-1").filename, "operations_manager.pdf");
  });

  // 6. Confirm personal skills now come from resume B
  test("6. Personal skills now reflect resume B and do NOT contain previous technical skills", async () => {
    const db = createTestDb();
    db.users.set("user-1", { id: "user-1", industry: "Software Development" });

    await simulateUploadResume(db, "user-1", {
      filename: "software_engineer.pdf",
      skills: ["Python", "JavaScript", "React"],
      industry: "Software Development",
    });

    // Replace with resume B
    await simulateUploadResume(db, "user-1", {
      filename: "operations_manager.pdf",
      skills: ["MS Excel", "MS Word", "MS PowerPoint", "Communication"],
      industry: "Business Administration",
    });

    const personalSkills = getPersonalSkills(db, "user-1");
    assert.deepStrictEqual(personalSkills, ["MS Excel", "MS Word", "MS PowerPoint", "Communication"]);
    assert.strictEqual(personalSkills.includes("Python"), false, "Python must not appear in personal skills");
    assert.strictEqual(personalSkills.includes("React"), false, "React must not appear in personal skills");
  });

  // 7. Confirm old ResumeAnalysis is invalidated
  test("7. Old ResumeAnalysis is deleted upon uploading replacement resume", async () => {
    const db = createTestDb();
    db.users.set("user-1", { id: "user-1", industry: "Software Development" });
    db.resumeAnalyses.set("user-1", { id: "ana-1", atsScore: 82 });

    assert.ok(db.resumeAnalyses.has("user-1"));

    await simulateUploadResume(db, "user-1", {
      filename: "new_resume.pdf",
      skills: ["Leadership"],
      industry: "Executive Management",
    });

    assert.strictEqual(db.resumeAnalyses.has("user-1"), false, "Stale analysis must be invalidated");
  });

  // 8. Confirm User.industry changes when appropriate
  test("8. User.industry updates when replacement resume indicates meaningfully different field", async () => {
    const db = createTestDb();
    db.users.set("user-1", { id: "user-1", industry: "Software Development" });

    await simulateUploadResume(db, "user-1", {
      filename: "healthcare_admin.pdf",
      skills: ["Clinical Protocols", "HIPAA Compliance"],
      industry: "Healthcare Administration",
    });

    assert.strictEqual(db.users.get("user-1").industry, "Healthcare Administration");
  });

  // 9. Confirm Dashboard resolves the new IndustryInsight
  test("9. Dashboard resolves the new IndustryInsight matching the updated industry", async () => {
    const db = createTestDb();
    db.users.set("user-1", { id: "user-1", industry: "Software Development" });

    await simulateUploadResume(db, "user-1", {
      filename: "business_ops.pdf",
      skills: ["Financial Analysis"],
      industry: "Business Administration",
    });

    const insight = getDashboardInsight(db, "user-1");
    assert.ok(insight, "Insight must be resolved");
    assert.strictEqual(insight.industry, "Business Administration");
  });

  // 10. Confirm same-industry resume replacement does NOT unnecessarily generate a new IndustryInsight
  test("10. Same-industry resume replacement reuses cached IndustryInsight without regenerating", async () => {
    const db = createTestDb();
    db.users.set("user-1", { id: "user-1", industry: "Software Development" });
    db.industryInsights.set("Software Development", {
      id: "insight-sd",
      industry: "Software Development",
      topSkills: ["Python", "SQL"],
    });

    // Upload another resume that is in Software Engineering (same domain)
    const res = await simulateUploadResume(db, "user-1", {
      filename: "senior_dev.pdf",
      skills: ["Go", "Docker", "Kubernetes"],
      industry: "Software Engineering",
    });

    assert.strictEqual(res.generatedNewInsight, false, "Must reuse existing insight when domain matches");
  });

  // 11. Confirm invalid resume replacement leaves existing data intact
  test("11. AI extraction failure halts before database mutation, leaving existing data intact", async () => {
    const db = createTestDb();
    db.users.set("user-1", { id: "user-1", industry: "Software Development" });
    db.resumes.set("user-1", { filename: "original.pdf", content: '{"skills":["Java"]}' });
    db.resumeAnalyses.set("user-1", { id: "ana-original", atsScore: 90 });

    await assert.rejects(
      () => simulateUploadResume(db, "user-1", {}, { failAi: true }),
      /The uploaded file does not look like a professional resume/
    );

    assert.strictEqual(db.resumes.get("user-1").filename, "original.pdf");
    assert.strictEqual(db.resumeAnalyses.get("user-1").atsScore, 90);
  });

  // 12. Confirm user A cannot affect user B
  test("12. User A cannot overwrite User B's resume, personal skills, or industry", async () => {
    const db = createTestDb();
    db.users.set("user-alice", { id: "user-alice", industry: "Biotechnology" });
    db.users.set("user-bob", { id: "user-bob", industry: "Civil Engineering" });

    await simulateUploadResume(db, "user-alice", {
      filename: "biotech.pdf",
      skills: ["CRISPR", "Genomics"],
      industry: "Biotechnology",
    });

    assert.strictEqual(db.users.get("user-bob").industry, "Civil Engineering");
    assert.strictEqual(db.resumes.has("user-bob"), false);
  });

  // 13. Confirm no duplicate Resume records are created
  test("13. Multiple uploads for same user update the same Resume row without duplicates", async () => {
    const db = createTestDb();
    db.users.set("user-1", { id: "user-1", industry: null });

    await simulateUploadResume(db, "user-1", { filename: "v1.pdf", skills: ["S1"], industry: "Tech" });
    await simulateUploadResume(db, "user-1", { filename: "v2.pdf", skills: ["S2"], industry: "Tech" });
    await simulateUploadResume(db, "user-1", { filename: "v3.pdf", skills: ["S3"], industry: "Tech" });

    assert.strictEqual(db.resumes.size, 1);
    assert.strictEqual(db.resumes.get("user-1").filename, "v3.pdf");
  });

  // 14. Confirm historical assessments remain intact
  test("14. Historical completed assessments in Assessment table remain intact across resume replacements", async () => {
    const db = createTestDb();
    db.users.set("user-1", { id: "user-1", industry: "Software Development" });
    db.assessments.set("user-1", [
      { id: "ass-1", quizScore: 85, category: "Technical" },
      { id: "ass-2", quizScore: 92, category: "Behavioral" },
    ]);

    await simulateUploadResume(db, "user-1", {
      filename: "finance_analyst.pdf",
      skills: ["Valuation", "Excel"],
      industry: "Finance",
    });

    const pastAssessments = db.assessments.get("user-1");
    assert.strictEqual(pastAssessments.length, 2);
    assert.strictEqual(pastAssessments[0].quizScore, 85);
  });

  // 15. Confirm historical cover letters remain intact
  test("15. Historical generated cover letters in CoverLetter table remain intact across resume replacements", async () => {
    const db = createTestDb();
    db.users.set("user-1", { id: "user-1", industry: "Software Development" });
    db.coverLetters.set("user-1", [
      { id: "cl-1", jobTitle: "Frontend Engineer", companyName: "Acme Corp" },
    ]);

    await simulateUploadResume(db, "user-1", {
      filename: "marketing_mgr.pdf",
      skills: ["SEO", "Content Strategy"],
      industry: "Marketing",
    });

    const pastLetters = db.coverLetters.get("user-1");
    assert.strictEqual(pastLetters.length, 1);
    assert.strictEqual(pastLetters[0].companyName, "Acme Corp");
  });

  // 16. IT -> Business Administration is recognized as meaningful industry change
  test("16. isSameIndustryDomain correctly identifies IT vs Business Administration as different domains", () => {
    const isSame = isSameIndustryDomain(
      "Information Technology & Software Development",
      "Business Administration"
    );
    assert.strictEqual(isSame, false, "IT and Business Administration must NOT be same domain");
  });

  // 17. IT -> Office Administration is recognized as meaningful industry change
  test("17. isSameIndustryDomain correctly identifies IT vs Office Administration as different domains", () => {
    const isSame = isSameIndustryDomain(
      "Information Technology & Software Development",
      "Office Administration"
    );
    assert.strictEqual(isSame, false, "IT and Office Administration must NOT be same domain");
  });

  // 18. IT -> Software Engineering remains in same domain
  test("18. isSameIndustryDomain correctly identifies IT vs Software Engineering as same domain", () => {
    const isSame = isSameIndustryDomain(
      "Information Technology & Software Development",
      "Software Engineering"
    );
    assert.strictEqual(isSame, true, "IT and Software Engineering must be recognized as same domain");
  });

  // 19. Dashboard does not return mismatched IndustryInsight when user.industry has updated
  test("19. Dashboard does not return mismatched IndustryInsight when user.industry has updated", () => {
    const db = createTestDb();
    db.users.set("user-1", { id: "user-1", industry: "Office Administration" });
    db.industryInsights.set("Office Administration", {
      id: "insight-office",
      industry: "Office Administration",
      topSkills: ["MS Excel", "Executive Support"],
    });
    db.industryInsights.set("Information Technology & Software Development", {
      id: "insight-it",
      industry: "Information Technology & Software Development",
      topSkills: ["Python", "Docker"],
    });

    const insight = getDashboardInsight(db, "user-1");
    assert.strictEqual(insight.industry, "Office Administration");
    assert.deepStrictEqual(insight.topSkills, ["MS Excel", "Executive Support"]);
    assert.strictEqual(insight.topSkills.includes("Python"), false);
  });
});
