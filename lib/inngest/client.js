import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "careerwise-ai", // Unique app ID
  name: "CareerWise AI",
  credentials: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    },
  },
});