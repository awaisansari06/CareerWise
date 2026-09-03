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

export const metadata = {
  title: "CareerWise AI — Intelligent Career Acceleration",
  description: "AI-powered career guidance, resume analysis, cover letters, and interview preparation.",
};

export default async function RootLayout({ children }) {
  return (
    <ClerkProvider
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
                  <span className="font-medium text-foreground">CareerWise AI</span>
                  <span>• Intelligent Career Platform</span>
                </div>
                <p>© {new Date().getFullYear()} CareerWise AI. All rights reserved.</p>
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
