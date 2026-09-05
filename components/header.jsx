import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from './ui/button'
import { GraduationCap, LayoutDashboard, ChevronDown, PenBox, Route, ScanText } from 'lucide-react'
import { CareerWiseLogo } from '@/components/careerwise-logo'
import { checkUser } from '@/lib/checkUser'
import { ThemeToggle } from '@/components/theme-toggle'

export default async function Header() {
  const check = await checkUser();
  const isSignedIn = check !== null;

  return (
    <header className="fixed top-0 w-full border-b border-border/80 bg-background/85 backdrop-blur-md z-50 transition-colors duration-200">
      <nav className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <CareerWiseLogo
            className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 transition-transform group-hover:scale-105 duration-200"
          />
          <div className="flex items-center">
            <span className="font-extrabold text-base sm:text-lg md:text-xl font-serif italic tracking-tight text-foreground">
              CareerWise
            </span>
          </div>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          <SignedIn>
            <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex gap-2">
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </Button>
            <Button asChild variant="outline" size="icon" className="sm:hidden h-8 w-8" title="Dashboard">
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                <span className="sr-only">Dashboard</span>
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" className="gap-1 sm:gap-1.5 text-xs sm:text-sm px-2.5 sm:px-3">
                  <span className="hidden sm:inline">AI Tools</span>
                  <span className="sm:hidden">Tools</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem asChild>
                  <Link href="/resume" className="flex items-center gap-2.5 py-2 cursor-pointer">
                    <ScanText className="h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">Resume Analysis</span>
                      <span className="text-[11px] text-muted-foreground">AI score & improvements</span>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/ai-cover-letter" className="flex items-center gap-2.5 py-2 cursor-pointer">
                    <PenBox className="h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">Cover Letter</span>
                      <span className="text-[11px] text-muted-foreground">Tailored applications</span>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/interview" className="flex items-center gap-2.5 py-2 cursor-pointer">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">Interview Prep</span>
                      <span className="text-[11px] text-muted-foreground">Mock Q&A with AI feedback</span>
                    </div>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/roadmap" className="flex items-center gap-2.5 py-2 cursor-pointer">
                    <Route className="h-4 w-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">Career Roadmap</span>
                      <span className="text-[11px] text-muted-foreground">Skill growth milestones</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SignedIn>

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Auth Controls */}
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "!w-8 !h-8 sm:!w-9 sm:!h-9 border border-border/80",
                  userButtonPopoverCard: "shadow-xl p-4 bg-popover text-popover-foreground rounded-xl border border-border",
                  userPreviewMainIdentifier: "text-sm font-semibold text-foreground",
                  userButtonTrigger: "hover:scale-105 transition-transform duration-200",
                },
              }}
              afterSignInUrl="/dashboard"
              afterSignOutUrl="/"
            />
          </SignedIn>

          <SignedOut>
            <SignInButton asChild>
              <Button variant="outline" size="sm" className="px-2.5 sm:px-3 text-xs sm:text-sm">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton asChild>
              <Button variant="default" size="sm" className="px-2.5 sm:px-3 text-xs sm:text-sm">
                Sign Up
              </Button>
            </SignUpButton>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
}
