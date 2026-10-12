"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { BarChart3, ArrowRight, Sparkles, FileSpreadsheet, LayoutDashboard } from "lucide-react";

export default function Header() {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="size-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <BarChart3 className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight leading-none text-foreground">
                MetricWeave <span className="text-blue-500">AI</span>
              </span>
              <span className="text-[10px] text-muted-foreground tracking-wide font-medium">
                From raw data to clear decisions
              </span>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/create" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <LayoutDashboard className="size-4 text-blue-500" /> Studio
            </Link>
            <Link href="/#templates" className="hover:text-foreground transition-colors">
              Templates
            </Link>
            <Link href="/#powerbi" className="hover:text-foreground transition-colors flex items-center gap-1.5">
              <FileSpreadsheet className="size-4 text-amber-500" /> Power BI Export
            </Link>
            <Link href="/#developer" className="hover:text-foreground transition-colors">
              Developer
            </Link>
          </nav>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            href="/create"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
          >
            <Sparkles className="size-4" />
            <span>Launch Studio</span>
            <ArrowRight className="size-3.5 hidden sm:inline" />
          </Link>
        </div>
      </div>
    </header>
  );
}
