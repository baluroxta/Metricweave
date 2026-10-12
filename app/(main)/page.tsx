"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Zap,
  CheckCircle2,
  DollarSign,
  Users,
  Target,
  Briefcase,
  Layers,
  Database,
  Cpu,
  Download,
} from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { TEMPLATE_DEFINITIONS } from "@/lib/templates";
import { SAMPLE_DATASETS } from "@/lib/sample-datasets";

export default function LandingPage() {
  const [activePreviewTemplate, setActivePreviewTemplate] = useState("sales");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 space-y-24 pb-20">
        {/* Hero Section */}
        <section className="relative px-4 pt-16 pb-20 lg:pt-24 lg:pb-28 max-w-7xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-xs font-semibold text-blue-500 shadow-sm animate-in fade-in">
            <Sparkles className="size-3.5" />
            <span>AI-Powered Analytics & Native Power BI Desktop Export</span>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground leading-[1.08]">
              From raw data to <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">clear decisions.</span>
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
              Upload any CSV or Excel dataset. MetricWeave AI instantly profiles data health, recommends tailored business dashboards, calculates deterministic KPIs, and exports genuine Microsoft Power BI Desktop (<span className="text-foreground font-semibold">.pbip</span>) projects.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/create"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <BarChart3 className="size-4" />
              <span>Launch Studio (Upload Data)</span>
              <ArrowRight className="size-4" />
            </Link>

            <Link
              href="/create?sample=sample-sales"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm border border-border bg-card/80 hover:bg-muted text-foreground transition-colors"
            >
              <Zap className="size-4 text-amber-500" />
              <span>Test with Retail Sample</span>
            </Link>
          </div>

          {/* Guarantee Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" /> 100% Deterministic Calculations
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" /> Genuine Power BI Project (.pbip)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" /> Offline Capable (No AI Key Needed)
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" /> Zero Data Hallucination
            </span>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Built for Enterprise Analytics & Executive Speed
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              A comprehensive pipeline that bridges the gap between raw spreadsheet data and executive-ready Power BI reporting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm space-y-3 relative overflow-hidden group hover:border-blue-500/50 transition-all">
              <div className="size-11 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <ShieldCheck className="size-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">Comprehensive Data Health Check</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automatic column inference across 8 data types, duplicate row detection, missing value distribution, and data quality scoring. Never build charts on corrupt or misclassified data.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm space-y-3 relative overflow-hidden group hover:border-indigo-500/50 transition-all">
              <div className="size-11 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Layers className="size-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">5 Adaptive Business Templates</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Specialized templates for Sales, Finance, HR, Marketing, and Executive Overview that automatically bind to your columns. If a field is missing, it dynamically remaps without fabricating metrics.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm space-y-3 relative overflow-hidden group hover:border-amber-500/50 transition-all">
              <div className="size-11 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <FileSpreadsheet className="size-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">Real Power BI Project (.pbip) Export</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Exports complete, native Power BI Desktop projects including <span className="font-semibold text-foreground">.pbip</span>, Tabular Object Model (<span className="font-semibold text-foreground">model.bim</span>), DAX measures, and Power Query M transformations.
              </p>
            </div>
          </div>
        </section>

        {/* Business Templates Section */}
        <section id="templates" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className="p-8 sm:p-12 rounded-3xl border border-border/60 bg-card/50 backdrop-blur-sm space-y-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Business Intelligence</span>
                <h2 className="text-2xl sm:text-3xl font-black text-foreground mt-1 tracking-tight">
                  Tailored Business Templates
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Each template calculates deterministic aggregates and renders interactive Recharts visuals
                </p>
              </div>

              <Link
                href="/create"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors"
              >
                <span>Upload your dataset to test</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {TEMPLATE_DEFINITIONS.map((tmpl) => (
                <Link
                  key={tmpl.id}
                  href={`/create?sample=sample-${tmpl.id === "executive" ? "sales" : tmpl.id}&template=${tmpl.id}`}
                  className="p-5 rounded-2xl border border-border/60 bg-card hover:border-blue-500 text-left transition-all flex flex-col justify-between space-y-4 group hover:shadow-lg hover:shadow-blue-500/5"
                >
                  <div className="space-y-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {tmpl.category}
                    </span>
                    <h3 className="font-bold text-sm text-foreground group-hover:text-blue-500 transition-colors">
                      {tmpl.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-blue-500 group-hover:translate-x-0.5 transition-transform">
                    <span>Test template</span>
                    <ArrowRight className="size-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Microsoft Power BI Export Architecture Deep Dive */}
        <section id="powerbi" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className="p-8 sm:p-12 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.03] to-transparent space-y-8">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                <FileSpreadsheet className="size-4" /> Power BI Desktop Compatibility
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Why PBIP is the Gold Standard for Power BI Export
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Rather than attempting fragile binary hacks on the legacy proprietary PBIX format, MetricWeave AI generates Microsoft&apos;s official, fully documented <span className="text-foreground font-semibold">Power BI Project (.pbip)</span> standard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="p-5 rounded-xl border border-border/60 bg-card space-y-2">
                <h4 className="font-bold text-sm text-foreground">1. Native Tabular Model (model.bim)</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Generates official Microsoft TMSL 1567 compatibility schema with full type mappings, partitions, and pre-computed DAX business measures.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border/60 bg-card space-y-2">
                <h4 className="font-bold text-sm text-foreground">2. Visual Layouts (report.json)</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Packages exact canvas visual containers for KPI cards, column charts, line trends, and donut charts aligned on a 1280x720 canvas.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-border/60 bg-card space-y-2">
                <h4 className="font-bold text-sm text-foreground">3. Double-Click to Open</h4>
                <p className="text-muted-foreground leading-relaxed">
                  Power BI Desktop December 2023 or newer natively opens the generated <span className="font-mono text-foreground font-semibold">.pbip</span> file with zero import errors or schema corruption.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Developer Attribution Section */}
        <section id="developer" className="max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
          <div className="p-8 sm:p-10 rounded-2xl border border-border/60 bg-card/40 space-y-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Developer Attribution</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Engineering, data analytics architecture, and product development
              </p>
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed space-y-2 max-w-3xl">
              <p>
                <strong>MetricWeave AI</strong> has been designed, transformed, and developed by <strong>Kandala Guru Balaji</strong>.
                This includes the deterministic analytics engine, the 5-domain business template system, the comprehensive data profiler & quality auditor, the real Microsoft Power BI Project (.pbip) export generator, and the unified user experience.
              </p>
              <p>
                Built for high accuracy, zero data hallucination, and seamless Microsoft Power BI Desktop integration.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
