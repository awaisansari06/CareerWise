import { inngest } from "./client";
import { db } from "@/lib/prisma";
import {
  getGeminiModel,
  safeGenerateContent,
  safeParseAiResponse,
  DashboardInsightsResponseSchema,
} from "@/lib/gemini";

export const generateIndustryInsights = inngest.createFunction(
  {
    id: "generate-industry-insights",
    name: "Generate Industry Insights",
    triggers: [{ cron: "0 0 * * 0" }], // Run every Sunday at midnight
  },
  async ({ event, step }) => {
    const industries = await step.run("Fetch industries", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    const model = getGeminiModel();

    for (const { industry } of industries) {
      const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "industry": "${industry}",
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          All salary figures in "salaryRanges" must be expressed in Indian Rupees (INR) appropriate for the Indian job market (e.g. 400000 to 3500000 annual CTC). Do not use USD, $, or other currencies.
          Include at least 5 common roles for salary ranges with locations set to relevant Indian cities or "India".
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

      try {
        const insights = await step.run(`Generate insights for ${industry}`, async () => {
          const res = await safeGenerateContent(model, prompt);
          const text = res.response.text();
          return safeParseAiResponse(text, DashboardInsightsResponseSchema);
        });

        if (insights) {
          await step.run(`Update ${industry} insights`, async () => {
            await db.industryInsight.update({
              where: { industry },
              data: {
                ...insights,
                lastUpdated: new Date(),
                nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              },
            });
          });
        }
      } catch (indErr) {
        console.error(`[Inngest Industry Insights Error for ${industry}]:`, indErr.message);
      }
    }
  }
);