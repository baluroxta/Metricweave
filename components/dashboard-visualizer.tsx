"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Download,
  Share2,
  Sparkles,
  Edit3,
  Check,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  RefreshCw,
  Info,
  Layers,
  ChevronDown,
  X,
  FileCode,
  FolderArchive,
  FileText,
  Database,
} from "lucide-react";
import { GeneratedDashboard, VisualConfig } from "@/lib/templates";
import { DataQualityReport } from "@/lib/data-profiler";

interface DashboardVisualizerProps {
  projectId: string;
  projectName: string;
  dashboard: GeneratedDashboard;
  qualityReport: DataQualityReport;
  onUpdateDashboard?: (updated: GeneratedDashboard) => void;
}

const PALETTE = [
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
];

export default function DashboardVisualizer({
  projectId,
  projectName,
  dashboard,
  qualityReport,
  onUpdateDashboard,
}: DashboardVisualizerProps) {
  const [activeVisuals, setActiveVisuals] = useState<VisualConfig[]>(dashboard.visuals);
  const [editingVisual, setEditingVisual] = useState<VisualConfig | null>(null);
  const [showPowerBiModal, setShowPowerBiModal] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const cleanProjectName =
    (projectName || "MetricWeave_Report")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "_") || "MetricWeave_Report";

  const zipFilename = `${cleanProjectName}_PowerBI_Project.zip`;
  const pbipFilename = `${cleanProjectName}.pbip`;
  const bimFilename = `${cleanProjectName}_model.bim`;
  const daxFilename = `${cleanProjectName}_measures.dax`;
  const mFilename = `${cleanProjectName}_transform.m`;
  const csvFilename = `${cleanProjectName}_dataset.csv`;

  // AI Copilot state
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<{
    mode: "ai" | "deterministic";
    summary: string;
    keyFindings: string[];
    recommendedActions: string[];
    answer?: string;
  } | null>(null);

  // Trigger AI query
  const handleAskAi = async (customQ?: string) => {
    const q = customQ || aiQuery;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, query: q }),
      });
      const data = await res.json();
      if (data.intelligence) {
        setAiInsights(data.intelligence);
      }
    } catch (err) {
      console.error("AI query failed:", err);
    } finally {
      setAiLoading(false);
    }
  };

  const [isSavingLocal, setIsSavingLocal] = useState(false);
  const [localSavedPath, setLocalSavedPath] = useState<string | null>(null);

  const handleSaveLocal = async () => {
    setIsSavingLocal(true);
    setExportError(null);
    try {
      const res = await fetch("/api/export/save-local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, openExplorer: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save locally");
      }
      setLocalSavedPath(data.folderPath);
      setExportStatus(`Saved directly to: ${data.folderPath}! Opened in Windows Explorer.`);
    } catch (err: any) {
      console.error("Save local error:", err);
      setExportError(err.message || "Failed to save locally");
    } finally {
      setIsSavingLocal(false);
    }
  };

  // Save modified visual title or type
  const handleSaveVisualEdit = (updated: VisualConfig) => {
    const updatedList = activeVisuals.map((v) => (v.id === updated.id ? updated : v));
    setActiveVisuals(updatedList);
    setEditingVisual(null);
    if (onUpdateDashboard) {
      onUpdateDashboard({ ...dashboard, visuals: updatedList });
    }
  };

  // Download Power BI Export handler with client-side blob download
  const handleDownloadPowerBi = async (format: "zip" | "pbip" | "bim" | "dax" | "csv" | "m" = "zip") => {
    setExportingFormat(format);
    setExportError(null);
    setExportStatus(null);
    try {
      const cleanName = (projectName || "MetricWeave_Report")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "_") || "MetricWeave_Report";

      let defaultFilename = `${cleanName}_PowerBI_Project.zip`;
      if (format === "pbip") defaultFilename = `${cleanName}.pbip`;
      else if (format === "bim") defaultFilename = `${cleanName}_model.bim`;
      else if (format === "dax") defaultFilename = `${cleanName}_measures.dax`;
      else if (format === "csv") defaultFilename = `${cleanName}_dataset.csv`;
      else if (format === "m") defaultFilename = `${cleanName}_transform.m`;

      const res = await fetch(`/api/export/powerbi?projectId=${encodeURIComponent(projectId)}&format=${format}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || `Export failed with HTTP ${res.status}`);
      }

      let filename = defaultFilename;
      const disposition = res.headers.get("content-disposition");
      if (disposition) {
        const utfMatch = disposition.match(/filename\*=UTF-8''([^;\s]+)/i);
        if (utfMatch && utfMatch[1]) {
          filename = decodeURIComponent(utfMatch[1]);
        } else {
          const normalMatch = disposition.match(/filename="?([^";]+)"?/i);
          if (normalMatch && normalMatch[1]) {
            filename = normalMatch[1].trim();
          }
        }
      }

      const expectedExt =
        format === "zip"
          ? ".zip"
          : format === "pbip"
          ? ".pbip"
          : format === "bim"
          ? ".bim"
          : format === "dax"
          ? ".dax"
          : format === "csv"
          ? ".csv"
          : ".m";

      if (!filename.toLowerCase().endsWith(expectedExt)) {
        filename = `${filename}${expectedExt}`;
      }

      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 3000);

      setExportStatus(`Saved "${filename}" to your device! Extract or open in Power BI Desktop to edit manually.`);
    } catch (err: any) {
      console.error("Power BI download failed:", err);
      setExportError(err.message || "Failed to download Power BI export package.");
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-wider">
              {dashboard.templateId} Analytics
            </span>
            <span className="text-xs text-muted-foreground">
              {qualityReport.totalRows.toLocaleString()} rows • {qualityReport.totalColumns} columns
            </span>
          </div>
          <h2 className="text-xl font-bold text-foreground mt-1 tracking-tight">{dashboard.title}</h2>
          <p className="text-xs text-muted-foreground">{dashboard.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setShowAiDrawer(true);
              if (!aiInsights) handleAskAi();
            }}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors"
          >
            <Sparkles className="size-3.5" />
            <span>AI Copilot</span>
          </button>

          <button
            id="export-to-powerbi-btn"
            onClick={() => setShowPowerBiModal(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileSpreadsheet className="size-4" />
            <span>Export to Power BI</span>
          </button>
        </div>
      </div>

      {/* Missing Field Warnings (if any) */}
      {dashboard.missingFields && dashboard.missingFields.length > 0 && (
        <div className="flex items-start gap-3 p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Dataset Adaptation Notice</p>
            <p className="text-muted-foreground">
              The selected template noticed missing fields:{" "}
              <span className="font-medium text-foreground">{dashboard.missingFields.join(", ")}</span>. Alternative
              available columns were dynamically mapped without inventing synthetic data.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboard.kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="relative p-5 rounded-xl border border-border/60 bg-card hover:border-border transition-all shadow-sm group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground line-clamp-1">{kpi.title}</span>
              {kpi.isCalculated && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Formula
                </span>
              )}
            </div>
            <div className="text-2xl font-black tracking-tight text-foreground">{kpi.formattedValue}</div>
            {kpi.subtitle && (
              <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{kpi.subtitle}</p>
            )}
          </div>
        ))}
      </div>

      {/* Visual Containers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeVisuals.map((vis, idx) => (
          <div
            key={vis.id}
            className="p-5 rounded-xl border border-border/60 bg-card shadow-sm flex flex-col justify-between"
          >
            {/* Chart Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <span>{vis.title}</span>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{vis.description}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingVisual(vis)}
                  title="Customize visual type or title"
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Edit3 className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Chart Body */}
            <div className="h-[280px] w-full mt-2">
              {vis.type === "bar" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vis.data} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="label"
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {vis.type === "horizontal_bar" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={vis.data}
                    margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis type="number" stroke="#888888" fontSize={11} tickLine={false} />
                    <YAxis
                      dataKey="label"
                      type="category"
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="value" fill="#6366F1" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {vis.type === "line" && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vis.data} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3B82F6"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#3B82F6" }}
                    />
                    {vis.secondaryMeasureCol && (
                      <Line
                        type="monotone"
                        dataKey="secondaryValue"
                        stroke="#F59E0B"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#F59E0B" }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              )}

              {vis.type === "area" && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={vis.data} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                    <defs>
                      <linearGradient id={`grad_${vis.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis
                      dataKey="date"
                      stroke="#888888"
                      fontSize={11}
                      tickLine={false}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill={`url(#grad_${vis.id})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {vis.type === "donut" && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.95)",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Pie
                      data={vis.data}
                      dataKey="value"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {vis.data.map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Visual Footnote */}
            <div className="pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{vis.aggregationFn ? `${vis.aggregationFn.toUpperCase()} aggregation` : "Direct calculation"}</span>
              <span className="font-medium text-foreground">{vis.data?.length || 0} segments</span>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Customization Modal */}
      {editingVisual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl border border-border bg-card shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-foreground">Customize Visual</h3>
              <button
                onClick={() => setEditingVisual(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Visual Title</label>
                <input
                  type="text"
                  value={editingVisual.title}
                  onChange={(e) => setEditingVisual({ ...editingVisual, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground block mb-1">Chart Type</label>
                <select
                  value={editingVisual.type}
                  onChange={(e) => setEditingVisual({ ...editingVisual, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bar">Vertical Bar Chart</option>
                  <option value="horizontal_bar">Horizontal Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="area">Area Chart</option>
                  <option value="donut">Donut Chart</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingVisual(null)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveVisualEdit(editingVisual)}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Copilot Slide-Over Drawer */}
      {showAiDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg h-full border-l border-border bg-card p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Analytics Copilot</h3>
                    <span className="text-[10px] text-muted-foreground">
                      {aiInsights?.mode === "ai" ? "Powered by Together AI" : "Deterministic Offline Mode"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowAiDrawer(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Natural Language Query Box */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Ask anything about this dataset</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAskAi()}
                    placeholder="e.g. What is the total revenue? Top performers?"
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => handleAskAi()}
                    disabled={aiLoading}
                    className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                  >
                    {aiLoading ? <RefreshCw className="size-3.5 animate-spin" /> : "Ask"}
                  </button>
                </div>
              </div>

              {/* Response Card */}
              {aiInsights && (
                <div className="space-y-4">
                  {aiInsights.answer && (
                    <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-xs text-foreground space-y-1">
                      <span className="font-bold text-purple-600 dark:text-purple-400">Direct Answer:</span>
                      <p className="leading-relaxed">{aiInsights.answer}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Executive Findings</h4>
                    <div className="space-y-2">
                      {aiInsights.keyFindings.map((finding, i) => (
                        <div key={i} className="p-3 rounded-lg border border-border/60 bg-muted/40 text-xs leading-relaxed text-foreground">
                          {finding}
                        </div>
                      ))}
                    </div>
                  </div>

                  {aiInsights.recommendedActions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Recommended Next Steps</h4>
                      <ul className="space-y-1.5 text-xs text-muted-foreground list-disc list-inside">
                        {aiInsights.recommendedActions.map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border text-[11px] text-muted-foreground flex items-center justify-between">
              <span>MetricWeave AI Privacy Protocol</span>
              <span>100% Deterministic Base</span>
            </div>
          </div>
        </div>
      )}

      {/* Power BI Export Studio Modal */}
      {showPowerBiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-sm">
                  <FileSpreadsheet className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-foreground">Microsoft Power BI Desktop Export</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      PBIP Native
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Download genuine Power BI Project files to extract, open, and edit manually on your device.
                  </p>
                </div>
              </div>
              <button
                id="close-powerbi-modal-btn"
                onClick={() => setShowPowerBiModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Success Notification */}
            {exportStatus && (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs animate-in fade-in">
                <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-emerald-700 dark:text-emerald-300">Download Complete!</p>
                  <p className="leading-relaxed">{exportStatus}</p>
                </div>
              </div>
            )}

            {/* Error Notification */}
            {exportError && (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs animate-in fade-in">
                <AlertTriangle className="size-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Export Notice</p>
                  <p className="leading-relaxed">{exportError}</p>
                </div>
              </div>
            )}

            {/* Included Artifacts Card */}
            <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
              <span className="text-[11px] font-bold text-foreground uppercase tracking-wider block">
                What is packaged in this export:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="flex items-center gap-2 text-foreground">
                  <Check className="size-3.5 text-emerald-500 shrink-0" />
                  <span><strong>{projectName}.pbip</strong> (Power BI Project descriptor)</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Check className="size-3.5 text-emerald-500 shrink-0" />
                  <span><strong>report.json</strong> (Visual containers & canvas layout)</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Check className="size-3.5 text-emerald-500 shrink-0" />
                  <span><strong>model.bim</strong> (TMSL Tabular Semantic Model)</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Check className="size-3.5 text-emerald-500 shrink-0" />
                  <span><strong>data/dataset.csv</strong> (Cleaned data source)</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Check className="size-3.5 text-emerald-500 shrink-0" />
                  <span><strong>measures.dax</strong> (Ready-to-paste DAX formulas)</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Check className="size-3.5 text-emerald-500 shrink-0" />
                  <span><strong>transform.m</strong> (Power Query transformation script)</span>
                </div>
              </div>
            </div>

            {/* 1-Click Direct Local PC Save & Extract */}
            <div className="p-4 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-amber-600/5 space-y-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">Save Directly to Windows PC</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      Guaranteed Direct Delivery
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Saves <strong>{zipFilename}</strong> and extracts the ready-to-open <strong>{cleanProjectName}_PowerBI</strong> folder directly into your Windows <strong>Downloads</strong> folder.
                  </p>
                </div>
              </div>

              <button
                id="save-direct-to-downloads-btn"
                onClick={handleSaveLocal}
                disabled={isSavingLocal}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {isSavingLocal ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    <span>Writing Directly to PC Downloads Folder...</span>
                  </>
                ) : (
                  <>
                    <FolderArchive className="size-4" />
                    <span>⚡ Save Directly to My PC Downloads & Open File Explorer</span>
                  </>
                )}
              </button>

              {localSavedPath && (
                <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-600 dark:text-emerald-400 space-y-1.5 animate-in fade-in">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="size-4 text-emerald-500" />
                    <span>Power BI Project Ready in Windows Downloads!</span>
                  </div>
                  <p className="font-mono text-[11px] text-foreground select-all bg-card/60 p-2 rounded border border-border/40 break-all">
                    {localSavedPath}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Double-click <strong>{cleanProjectName}.pbip</strong> in that folder to launch Microsoft Power BI Desktop!
                  </p>
                </div>
              )}
            </div>

            {/* Primary Download: Complete Zip Bundle */}
            <div className="space-y-2 pt-1 border-t border-border/40">
              <span className="text-xs font-bold text-foreground block">
                Or Download via Browser:
              </span>
              <button
                id="download-complete-zip-btn"
                onClick={() => handleDownloadPowerBi("zip")}
                disabled={exportingFormat === "zip"}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs border border-border bg-card hover:bg-muted text-foreground flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer text-center"
              >
                {exportingFormat === "zip" ? (
                  <>
                    <RefreshCw className="size-4 animate-spin text-amber-500" />
                    <span>Preparing Download Package...</span>
                  </>
                ) : (
                  <>
                    <Download className="size-4 text-amber-500" />
                    <span>Browser Download (.zip Project Archive)</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-muted-foreground">
                Contains the full .pbip project folder, live TMSL model, visual layouts, cleaned data CSV, and launch guide.
              </p>
            </div>

            {/* Crucial Instructions Banner */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-700 dark:text-amber-300">
              <Info className="size-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong>How to Open & View Data in Power BI Desktop:</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-muted-foreground">
                  <li>If using <strong>1-Click Save</strong>, the folder is already extracted in Downloads—just double-click <code>{cleanProjectName}.pbip</code>!</li>
                  <li>If downloading the <strong>ZIP</strong>, right-click and choose <strong>Extract All</strong> before opening.</li>
                  <li><strong className="text-foreground">To load chart data:</strong> Click the <strong className="text-amber-600 dark:text-amber-400">Refresh</strong> button on Power BI's <strong>Home</strong> ribbon (under Data) to populate all cards and charts with live data!</li>
                </ul>
              </div>
            </div>

            {/* Individual File Export Options */}
            <div className="space-y-2.5 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">
                  Or Download Individual Files to Device:
                </span>
                <span className="text-[10px] text-muted-foreground">Click any file to download</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <button
                  id="download-pbip-btn"
                  onClick={() => handleDownloadPowerBi("zip")}
                  className="p-2.5 rounded-lg border border-border bg-card hover:border-amber-500/50 hover:bg-amber-500/5 transition-all flex flex-col items-start gap-1 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <FileCode className="size-3 text-amber-500" />
                    <span>.pbip Project</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Complete project package</span>
                </button>

                <a
                  id="download-bim-btn"
                  href={`/api/export/powerbi/${encodeURIComponent(bimFilename)}?projectId=${encodeURIComponent(projectId)}&format=bim`}
                  download={bimFilename}
                  onClick={() => setExportStatus(`Downloading "${bimFilename}" to your device!`)}
                  className="p-2.5 rounded-lg border border-border bg-card hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex flex-col items-start gap-1 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <Database className="size-3 text-blue-500" />
                    <span>model.bim</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">TMSL Semantic Model</span>
                </a>

                <a
                  id="download-dax-btn"
                  href={`/api/export/powerbi/${encodeURIComponent(daxFilename)}?projectId=${encodeURIComponent(projectId)}&format=dax`}
                  download={daxFilename}
                  onClick={() => setExportStatus(`Downloading "${daxFilename}" to your device!`)}
                  className="p-2.5 rounded-lg border border-border bg-card hover:border-purple-500/50 hover:bg-purple-500/5 transition-all flex flex-col items-start gap-1 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <FileText className="size-3 text-purple-500" />
                    <span>measures.dax</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">DAX KPI Formulas</span>
                </a>

                <a
                  id="download-m-btn"
                  href={`/api/export/powerbi/${encodeURIComponent(mFilename)}?projectId=${encodeURIComponent(projectId)}&format=m`}
                  download={mFilename}
                  onClick={() => setExportStatus(`Downloading "${mFilename}" to your device!`)}
                  className="p-2.5 rounded-lg border border-border bg-card hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex flex-col items-start gap-1 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <FileCode className="size-3 text-indigo-500" />
                    <span>transform.m</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Power Query script</span>
                </a>

                <a
                  id="download-csv-btn"
                  href={`/api/export/powerbi/${encodeURIComponent(csvFilename)}?projectId=${encodeURIComponent(projectId)}&format=csv`}
                  download={csvFilename}
                  onClick={() => setExportStatus(`Downloading "${csvFilename}" to your device!`)}
                  className="p-2.5 rounded-lg border border-border bg-card hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all flex flex-col items-start gap-1 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <FileSpreadsheet className="size-3 text-emerald-500" />
                    <span>dataset.csv</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Cleaned data table</span>
                </a>
              </div>
            </div>

            {/* Quick Rename Helper for Users with Existing Files */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl border border-blue-500/20 bg-blue-500/5 text-[11px] text-muted-foreground">
              <Info className="size-4 text-blue-500 shrink-0 mt-0.5" />
              <p>
                <strong>Got a file without an extension earlier?</strong> You can simply rename that file in your Downloads folder by appending <strong>.zip</strong> (e.g. rename to <code>Project.zip</code>) or <strong>.pbip</strong> to open it immediately in Microsoft Power BI Desktop.
              </p>
            </div>

            {/* How to Open & Edit in Power BI Desktop */}
            <div className="pt-2 border-t border-border/40 space-y-2.5">
              <span className="text-xs font-bold text-foreground block">
                Two Ways to Use & Edit in Microsoft Power BI Desktop:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Method 1 */}
                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <span className="size-4 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-black flex items-center justify-center">1</span>
                    <span>Method A: Instant Project (.pbip)</span>
                  </div>
                  <ul className="text-[11px] text-muted-foreground leading-relaxed list-disc list-inside space-y-0.5">
                    <li>Extract the downloaded ZIP (or use <strong>1-Click Save</strong>).</li>
                    <li>Double-click <strong>{cleanProjectName}.pbip</strong> or run <strong>OPEN_IN_POWER_BI.cmd</strong>.</li>
                    <li>All charts, live KPI cards, and data render immediately!</li>
                    <li>Add new charts or measures directly in the Power BI canvas.</li>
                  </ul>
                </div>

                {/* Method 2 */}
                <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <span className="size-4 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black flex items-center justify-center">2</span>
                    <span>Method B: Manual Import & Direct Edit</span>
                  </div>
                  <ul className="text-[11px] text-muted-foreground leading-relaxed list-disc list-inside space-y-0.5">
                    <li>Open Power BI Desktop → <strong>Home → Get Data → Text/CSV</strong>.</li>
                    <li>Select <strong>dataset.csv</strong> (or paste <strong>transform.m</strong> in Advanced Editor).</li>
                    <li>In Modeling tab, click <strong>New Measure</strong> & copy from <strong>measures.dax</strong>.</li>
                    <li>Build custom visuals freely and save as standard <strong>.pbix</strong>!</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
