import "server-only";
import { getSafeResourceUrl } from "@/lib/resource-url";
import { getGeminiModel, safeGenerateContent, safeParseAiResponse, ResumeParserResponseSchema, ResumeAnalysisResponseSchema, RoadmapResponseSchema, QuizResponseSchema, generateAIInsights, formatUntrustedData, PROMPT_SAFETY_DIRECTIVE } from "@/lib/gemini";
const generateResumeAnalysis = async (resumeData) => {
  const model = getGeminiModel();

  const prompt = `
    You are an advanced AI Resume Analyzer Agent.

    ${PROMPT_SAFETY_DIRECTIVE}

    Analyze the following resume reference data and return ONLY a JSON object in this format:

    UNTRUSTED RESUME REFERENCE DATA:
    ${formatUntrustedData("resume_data", resumeData)}

    {
      "overall_score": number (0–100),
      "overall_feedback": "string",
      "summary_comment": "string",
      "sections": {
        "contact_info": {
          "score": number,
          "comment": "string"
        },
        "experience": {
          "score": number,
          "comment": "string"
        },
        "education": {
          "score": number,
          "comment": "string"
        },
        "skills": {
          "score": number,
          "comment": "string"
        }
      },
      "tips_for_improvement": ["string", "string", "string"],
      "whats_good": ["string", "string", "string"],
      "needs_improvement": ["string", "string", "string"],
      "ats_analysis": {
        "ats_score": number (0–100),
        "ats_comment": "string",
        "keyword_matches": ["string", "string"],
        "keyword_gaps": ["string", "string"]
      }
    }

    RULES:
    - Provide at least 3 tips_for_improvement, 3 whats_good, and 3 needs_improvement.
    - ats_score must be between 0 and 100.
    - JSON only. No extra text.
  `;

  try {
    const result = await safeGenerateContent(model, prompt);
    const text = result.response.text();
    return safeParseAiResponse(text, ResumeAnalysisResponseSchema);
  } catch (err) {
    console.error("[Resume Analysis Error]:", err.message);
    throw new Error(err.message || "Failed to analyze resume structure");
  }
};


async function generateCareerRoadmap(resumeJson, targetRole) {
  const model = getGeminiModel();

  let resumeData = resumeJson;
  if (typeof resumeJson === "string") {
    try {
      resumeData = JSON.parse(resumeJson);
    } catch {
      resumeData = resumeJson;
    }
  }

  const prompt = `
You are an expert career mentor and curriculum designer.

${PROMPT_SAFETY_DIRECTIVE}

Analyze the following resume reference data and infer the most likely career field/industry 
(e.g., Software Development, Medicine, Civil Engineering, Teaching, Law, Business, etc.).

UNTRUSTED RESUME REFERENCE DATA:
${formatUntrustedData("resume_data", resumeData)}

Now generate a career learning and growth roadmap SPECIFICALLY for this field.
If a target role is provided, build realistic steps from the candidate's background toward that role: ${formatUntrustedData("target_role", targetRole || "Explore growth in the current field")}

Guidelines:
- First, identify the industry from the resume (doctor, teacher, civil engineer, web developer, etc.).
- Then create a roadmap with 20–25 nodes that reflect realistic skills, milestones, or knowledge progression in that industry.
- The roadmap must follow a progression: Fundamentals → Core → Advanced → Specialization.
- Nodes format:
  {id, type:"turbo", data:{title, description, link, level}}
- Edges format:
  {id, source, target, type:"smoothstep"}

Output ONLY valid JSON with the following structure:
{
  "industry": "Inferred industry from resume",
  "roadmapTitle": "Custom roadmap title",
  "description": "Brief description of roadmap",
  "duration": "Suggested time frame",
  "initialNodes": [...],
  "initialEdges": [...]
}
`;

  try {
    const result = await safeGenerateContent(model, prompt);
    const text = result.response.text();
    return safeParseAiResponse(text, RoadmapResponseSchema);
  } catch (err) {
    console.error("[Roadmap Generation Error]:", err.message);
    throw new Error(err.message || "Failed to generate valid roadmap structure");
  }
}


export async function generateTask(kind, input, user) {
 if(kind === "RESUME_ANALYSIS") { const analysis=await generateResumeAnalysis(user.resume.content);   const analysisData = {
    overallScore: analysis.overall_score,
    overallFeedback: analysis.overall_feedback,
    summaryComment: analysis.summary_comment || "",
    contactScore: analysis.sections.contact_info.score,
    experienceScore: analysis.sections.experience.score,
    educationScore: analysis.sections.education.score,
    skillsScore: analysis.sections.skills.score,
    tipsForImprovement: analysis.tips_for_improvement,
    whatsGood: analysis.whats_good,
    needsImprovement: analysis.needs_improvement,
    atsScore: analysis.ats_analysis.ats_score,
    atsComment: analysis.ats_analysis.ats_comment || "",
    keywordMatches: analysis.ats_analysis.keyword_matches,
    keywordGaps: analysis.ats_analysis.keyword_gaps,
  };

 return analysisData; }
 if(kind === "ROADMAP") { const targetRole=input.targetRole; const roadmap=await generateCareerRoadmap(user.resume.content,targetRole);   const safeRoadmap = {
    roadmapTitle: targetRole.trim() ? `Your path to ${targetRole.trim()}` : roadmap.roadmapTitle || "Your career roadmap",
    description: roadmap.description || "No description provided.",
    duration: roadmap.duration || "Flexible",
    industry: roadmap.industry || "General",
    initialNodes: Array.isArray(roadmap.initialNodes)
      ? roadmap.initialNodes.map((n, i) => ({
        id: n.id?.toString() || `node-${i}`,
        type: "default",
        data: {
          label: n.data?.title || n.data?.label || `Node ${i + 1}`,
          description: n.data?.description || "",
          link: getSafeResourceUrl(n.data?.link),
          level: n.data?.level || "Fundamentals",
        },
        position: n.position || { x: i * 250, y: 100 },
      }))
      : [],
    initialEdges: Array.isArray(roadmap.initialEdges)
      ? roadmap.initialEdges.map((e, i) => ({
        id: e.id?.toString() || `edge-${i}`,
        source: e.source?.toString(),
        target: e.target?.toString(),
        type: "smoothstep",
        animated: e.animated ?? false,
      }))
      : [],
  };

 return safeRoadmap; }
 if(kind === "COVER_LETTER") { const {jobTitle,companyName,jobDescription}=input;   let resume;
  try {
    resume = typeof user.resume.content === "string" ? JSON.parse(user.resume.content) : user.resume.content;
  } catch {
    resume = { background: user.resume.content };
  }
  if (!resume || typeof resume !== "object" || Array.isArray(resume)) resume = { background: user.resume.content };

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  const candidateInfo = {
    name: resume.name || "",
    email: resume.email || "",
    phone: resume.phone || "",
    education: resume.education || [],
    experience: resume.experience || [],
    skills: resume.skills || [],
    projects: resume.projects || [],
    languages: resume.languages || [],
    background: resume.background || "",
  };

  const model = getGeminiModel();

  const prompt = `
You are a professional executive career coach.

${PROMPT_SAFETY_DIRECTIVE}

Write a professional cover letter for the specified target role and company based on the candidate's background.

TARGET ROLE & COMPANY:
${formatUntrustedData("target_job_title", jobTitle)}
${formatUntrustedData("target_company_name", companyName)}

TARGET JOB DESCRIPTION:
${formatUntrustedData("job_description", jobDescription)}

CANDIDATE PROFILE DATA:
${formatUntrustedData("candidate_resume", candidateInfo)}

Date:
${currentDate}

Requirements:
1. Use a professional, enthusiastic tone
2. Highlight relevant skills and experience
3. Show understanding of the company's needs
4. Keep it concise (max 400 words)
5. Use proper business letter formatting in markdown with the exact date "${currentDate}" placed below the candidate header
6. Include specific examples of achievements or projects
7. Relate candidate's background to job requirements
8. Use only facts present in the candidate profile. Never invent metrics, employers, qualifications, or achievements. Omit missing contact details.

Format the letter in markdown. The date of the letter must be "${currentDate}". Do not insert placeholder text like [Your Name] or [Your Address].
`;

  const result = await safeGenerateContent(model, prompt);
    const content = result.response.text().trim();

    if (!content) {
      throw new Error("AI returned empty cover letter");
    }

 if(!content || content.length>30000) throw new Error("Invalid letter output"); return {content,jobTitle,companyName,jobDescription,status:"draft"}; }
 if(kind === "INTERVIEW_QUIZ") {   const resumeContent = user.resume?.content || 'No resume available';
  const model = getGeminiModel();

  const prompt = `
You are an expert interviewer and professional curriculum assessor.

${PROMPT_SAFETY_DIRECTIVE}

Your task is to generate **10 multiple-choice interview questions** personalized to this candidate’s resume and industry.

UNTRUSTED RESUME REFERENCE DATA:
${formatUntrustedData("resume_data", resumeContent)}

Intelligent Behavior Rules:
1. Analyze the resume to detect:
   - Primary domain or profession (e.g., Software Engineering, Medicine, Teaching, Marketing, Finance, etc.)
   - Technical and non-technical skills listed.
   - Education background (degree, specialization, academic focus).
   - Experience (roles, years, responsibilities, projects, achievements).

2. Generate interview questions reflecting these aspects:
   - Skill-based questions related to tools, technologies, or techniques mentioned.
   - Conceptual or theoretical questions based on their education.
   - Experience-based situational questions (“How would you handle...”, “In your previous role...”).
   - 1–2 questions testing general reasoning, ethics, or communication in that field.

3. If the resume lacks enough data, infer the likely field from what is given.
   If nothing can be inferred, ask general professional or problem-solving questions.

Each question must include:
  • Question text  
  • 4 options (A, B, C, D)  
  • Correct answer (the exact text matching one of the options)  
  • A short explanation (1–2 sentences)

Output Format:
Return only valid JSON:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string"
    }
  ]
}
`;

  const result = await safeGenerateContent(model, prompt);
    const text = result.response.text();

    // Validate structured output with Zod schema
    const quiz = safeParseAiResponse(text, QuizResponseSchema);

 return {questions:quiz.questions.map((q,i)=>({id:i+1,question:q.question,options:q.options,answer:q.correctAnswer,explanation:q.explanation||""}))}; }
 if(kind === "RESUME_PARSE") { const buffer=Buffer.from(input.pdf,"base64"); const goal=input.careerGoal;     const model = getGeminiModel();

    // 4. Invoke Gemini with verified PDF payload
    const result = await safeGenerateContent(model, {
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: buffer.toString("base64"),
              },
            },
            {
              text: `You are a professional resume parser and career analyst.
1. If not a resume → return {"error":"Not a resume"}.
2. Extract the candidate's resume information and CLASSIFY their primary career industry/field based on their skills, experience, and education.
You MUST provide the "industry" field in the output JSON (e.g., "Software Development", "Office Administration", "Business Administration", "Healthcare", "Finance & Accounting", "Marketing", "Education", etc.).
JSON format:
{
  "name": "string",
  "email": "string",
  "phone": "string or empty string if not available",
  "education": ["string"],
  "experience": ["string"],
  "skills": ["string"],
  "projects": ["string"],
  "languages": ["string"],
  "hobbies": ["string"],
  "industry": "string"
}
Return only valid JSON.`,
            },
          ],
        },
      ],
      generationConfig: { responseMimeType: "application/json" },
    });

    const text = result.response.text();
    const extractedData = safeParseAiResponse(text, ResumeParserResponseSchema);

    if (extractedData.error) {
      throw new Error("The uploaded file does not look like a professional resume");
    }

    // Normalize skills to strings if Gemini returns an array of skill objects
    if (Array.isArray(extractedData.skills)) {
      extractedData.skills = extractedData.skills.map((s) =>
        typeof s === "string" ? s : s?.name || s?.skill || s?.title || JSON.stringify(s)
      );
    }

    // 5. Ensure industry is classified; infer from structured profile if not present
    const targetIndustry = extractedData.industry?.trim() || 'General';
    extractedData.industry = targetIndustry;
    if (goal) extractedData.careerGoal = goal;

 return {content:JSON.stringify(extractedData,null,2),filename:input.filename,fileUrl:null}; }
 if(kind === "INSIGHTS") { return generateAIInsights(input.industry); }
 throw new Error("Unsupported job type");
}
