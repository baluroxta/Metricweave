"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileSpreadsheet,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Eye,
  Sliders,
} from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import DataQualityStudio from "@/components/data-quality-studio";
import TemplateSelector from "@/components/template-selector";
import DashboardVisualizer from "@/components/dashboard-visualizer";
import { SAMPLE_DATASETS } from "@/lib/sample-datasets";
import { TemplateType } from "@/lib/templates";

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<"upload" | "quality" | "templates" | "dashboard">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto load sample if query param is set
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sampleParam = params.get("sample");
    const templateParam = params.get("template") as TemplateType | null;

    if (sampleParam) {
      handleLoadSample(sampleParam, templateParam || undefined);
    }
  }, []);

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/datasets/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process dataset");
      }

      setProject(data.project);
      setActiveTab("dashboard");
    } catch (err: any) {
      setUploadError(err.message || "Failed to process uploaded file");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle one-click sample dataset
  const handleLoadSample = async (sampleId: string, templateOverride?: TemplateType) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await fetch(`/api/datasets/sample?id=${encodeURIComponent(sampleId)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load sample dataset");
      }

      let loadedProject = data.project;

      // If a template override was requested
      if (templateOverride && templateOverride !== loadedProject.selectedTemplate) {
        const updateRes = await fetch(`/api/projects/${loadedProject.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ template: templateOverride }),
        });
        const updateData = await updateRes.json();
        if (updateData.project) {
          loadedProject = updateData.project;
        }
      }

      setProject(loadedProject);
      setActiveTab("dashboard");
    } catch (err: any) {
      setUploadError(err.message || "Failed to load sample dataset");
    } finally {
      setIsUploading(false);
    }
  };

  // Switch template
  const handleSelectTemplate = async (templateId: TemplateType) => {
    if (!project) return;
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: templateId }),
      });
      const data = await res.json();
      if (data.project) {
        setProject(data.project);
        setActiveTab("dashboard");
      }
    } catch (err) {
      console.error("Failed to switch template:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Navigation Tabs Bar (Visible once a dataset is loaded) */}
        {project && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === "dashboard"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <BarChart3 className="size-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab("templates")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === "templates"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Layers className="size-3.5" />
                <span>Templates</span>
              </button>

              <button
                onClick={() => setActiveTab("quality")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === "quality"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <ShieldCheck className="size-3.5" />
                <span>Data Health & Schema</span>
              </button>

              <button
                onClick={() => setActiveTab("upload")}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                  activeTab === "upload"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Upload className="size-3.5" />
                <span>Upload New</span>
              </button>
            </div>

            <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-2 pr-2">
              <span className="font-semibold text-foreground">{project.name}</span>
              <span>•</span>
              <span>{project.dataset.rows.length.toLocaleString()} rows</span>
            </div>
          </div>
        )}

        {/* Tab 1: Upload / Ingestion View */}
        {(!project || activeTab === "upload") && (
          <div className="space-y-8 max-w-4xl mx-auto py-6">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20 inline-flex items-center gap-1.5">
                <Sparkles className="size-3.5" /> Step 1: Ingest Dataset
              </span>
              <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                Upload Data. Get Instant Dashboards.
              </h1>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                Drag and drop your CSV or Excel file. MetricWeave AI profiles your data quality, identifies key metrics, and generates Power BI ready analytics.
              </p>
            </div>

            {/* Error Message */}
            {uploadError && (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs">
                <AlertCircle className="size-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className="relative p-10 sm:p-14 rounded-2xl border-2 border-dashed border-border hover:border-blue-500 bg-card/60 hover:bg-blue-500/[0.02] transition-all cursor-pointer text-center group space-y-4"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div className="size-16 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-md shadow-blue-500/10">
                {isUploading ? (
                  <RefreshCw className="size-8 animate-spin" />
                ) : (
                  <Upload className="size-8" />
                )}
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">
                  {isUploading ? "Profiling & Generating Dashboard..." : "Drop your dataset here, or browse files"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Supports CSV (.csv), Excel (.xlsx / .xls), and JSON • Maximum 25MB
                </p>
              </div>

              <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground pt-2">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-emerald-500" /> Client privacy guaranteed
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-emerald-500" /> Automatic type inference
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="size-3 text-emerald-500" /> Power BI export ready
                </span>
              </div>
            </div>

            {/* Quick Sample Datasets Selection */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground">Or test with realistic enterprise samples</h3>
                  <p className="text-xs text-muted-foreground">
                    Instantly load verified datasets with real numbers and pre-configured templates
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SAMPLE_DATASETS.map((sample) => (
                  <button
                    key={sample.id}
                    onClick={() => handleLoadSample(sample.id)}
                    disabled={isUploading}
                    className="p-4 rounded-xl border border-border/60 bg-card hover:border-blue-500 hover:bg-muted/30 text-left transition-all flex items-start justify-between gap-3 group disabled:opacity-50"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-foreground uppercase tracking-wider">
                          {sample.domain}
                        </span>
                        <h4 className="font-bold text-xs text-foreground group-hover:text-blue-500 transition-colors">
                          {sample.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {sample.description}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Quality & Profiling Studio */}
        {project && activeTab === "quality" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Dataset Quality & Health Report</h2>
                <p className="text-xs text-muted-foreground">
                  In-depth audit of completeness, duplicates, and semantic role inference
                </p>
              </div>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
              >
                <span>View Dashboard</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>

            <DataQualityStudio dataset={project.dataset} onProceedToDashboard={() => setActiveTab("dashboard")} />
          </div>
        )}

        {/* Tab 3: Template Selector */}
        {project && activeTab === "templates" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Choose Business Template</h2>
                <p className="text-xs text-muted-foreground">
                  Switch the lens through which your dataset metrics are visualized
                </p>
              </div>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
              >
                <span>Back to Dashboard</span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>

            <TemplateSelector
              selectedTemplate={project.selectedTemplate}
              recommendedDomain={project.inferredDomain}
              onSelectTemplate={handleSelectTemplate}
            />
          </div>
        )}

        {/* Tab 4: Interactive Dashboard & Power BI Export */}
        {project && activeTab === "dashboard" && (
          <DashboardVisualizer
            projectId={project.id}
            projectName={project.name}
            dashboard={project.dashboard}
            qualityReport={project.dataset.qualityReport}
            onUpdateDashboard={(updated) => setProject({ ...project, dashboard: updated })}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
