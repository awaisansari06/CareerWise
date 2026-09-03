import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "careerwise-ai", // Unique app ID
  name: "CareerWise",
  isDev: process.env.NODE_ENV === "development",
});