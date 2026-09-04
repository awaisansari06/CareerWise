import { siteConfig } from "@/lib/site-config";

export default function robots() {
  const baseUrl = siteConfig.url.replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/sign-in", "/sign-up", "/privacy", "/terms", "/security"],
        disallow: [
          "/dashboard",
          "/dashboard/*",
          "/resume",
          "/resume/*",
          "/interview",
          "/interview/*",
          "/roadmap",
          "/roadmap/*",
          "/ai-cover-letter",
          "/ai-cover-letter/*",
          "/onboarding",
          "/onboarding/*",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
