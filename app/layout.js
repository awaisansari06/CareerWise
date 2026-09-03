import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "@/components/ui/sonner";
import { BodyScrollFix } from "@/components/body-scroll-fix";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

import { siteConfig } from "@/lib/site-config";

export const metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1280,
        height: 720,
        alt: `${siteConfig.name} — AI-Powered Career Intelligence Platform`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@careerwise",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default async function RootLayout({ children }) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#0ea5e9",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning className={inter.variable}>
        <body className={`${inter.className} ${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20`}>
          <BodyScrollFix />
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={true}
            disableTransitionOnChange={false}
          >
            {/* Header */}
            <Header />

            <main className="flex-1 w-full">{children}</main>
            <Toaster richColors />

            {/* Footer */}
            <footer className="border-t border-border/80 bg-card/30 backdrop-blur-sm mt-auto">
              <div className="container mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-medium text-foreground">CareerWise</span>
                  <span>• AI-Powered Career Intelligence Platform</span>
                </div>
                <p>© {new Date().getFullYear()} CareerWise. All rights reserved.</p>
                <div className="flex items-center gap-4">
                  <span className="hover:text-foreground transition-colors cursor-pointer">Privacy</span>
                  <span className="hover:text-foreground transition-colors cursor-pointer">Terms</span>
                  <span className="hover:text-foreground transition-colors cursor-pointer">Security</span>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
