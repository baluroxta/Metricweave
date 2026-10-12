"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  Hash,
  Calendar,
  Layers,
  DollarSign,
  Key,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { DataQualityReport, ColumnProfile, ParsedDataset } from "@/lib/data-profiler";

interface DataQualityStudioProps {
  dataset: ParsedDataset;
  onProceedToDashboard?: () => void;
}

export default function DataQualityStudio({ dataset, onProceedToDashboard }: DataQualityStudioProps) {
  const { qualityReport, headers, rows } = dataset;
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Filter rows based on search
  const filteredRows = rows.filter((r) => {
    if (!searchTerm) return true;
    return Object.values(r).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
  const paginatedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const getRoleBadge = (role: string, type: string) => {
    switch (role) {
      case "metric":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
            {type === "currency" ? <DollarSign className="size-3" /> : <Hash className="size-3" />}
            {type} (measure)
          </span>
        );
      case "temporal":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20">
            <Calendar className="size-3" />
            date
          </span>
        );
      case "identifier":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Key className="size-3" />
            id
          </span>
        );
      case "dimension":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Layers className="size-3" />
            {type} (dimension)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Quality Score Card */}
        <div className="p-5 rounded-xl border border-border/60 bg-card shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quality Score</span>
            <div className="text-3xl font-black text-foreground mt-1 flex items-baseline gap-1.5">
              <span>{qualityReport.qualityScore}</span>
              <span className="text-xs font-normal text-muted-foreground">/ 100</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              {qualityReport.qualityScore >= 80 ? (
                <CheckCircle2 className="size-3.5 text-emerald-500" />
              ) : (
                <AlertCircle className="size-3.5 text-amber-500" />
              )}
              <span className={qualityReport.qualityScore >= 80 ? "text-emerald-500 font-medium" : "text-amber-500 font-medium"}>
                {qualityReport.status} Status
              </span>
            </div>
          </div>
          <div className="size-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <ShieldCheck className="size-6" />
          </div>
        </div>

        {/* Rows Card */}
        <div className="p-5 rounded-xl border border-border/60 bg-card shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Records</span>
          <div className="text-2xl font-black text-foreground mt-1">{qualityReport.totalRows.toLocaleString()}</div>
          <span className="text-xs text-muted-foreground">{qualityReport.totalColumns} structured columns</span>
        </div>

        {/* Completeness Card */}
        <div className="p-5 rounded-xl border border-border/60 bg-card shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completeness</span>
          <div className="text-2xl font-black text-foreground mt-1">{qualityReport.overallCompleteness}%</div>
          <span className="text-xs text-muted-foreground">
            {qualityReport.totalMissingValues === 0 ? "No null cells" : `${qualityReport.totalMissingValues} missing values`}
          </span>
        </div>

        {/* Duplicates Card */}
        <div className="p-5 rounded-xl border border-border/60 bg-card shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Duplicate Rows</span>
          <div className="text-2xl font-black text-foreground mt-1">{qualityReport.duplicateRows.toLocaleString()}</div>
          <span className="text-xs text-muted-foreground">{qualityReport.duplicatePercentage}% duplicate rate</span>
        </div>
      </div>

      {/* Warnings & Recommendations */}
      {qualityReport.warnings.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-4" />
            <span>Data Health Observations</span>
          </div>
          <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
            {qualityReport.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Column Schema & Role Inspector */}
      <div className="p-5 rounded-xl border border-border/60 bg-card shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-sm text-foreground">Inferred Schema & Semantic Roles</h3>
          <p className="text-xs text-muted-foreground">
            Automatic role classification for KPI measures, dimensions, and temporal hierarchies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {qualityReport.columns.map((col) => (
            <div key={col.name} className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-foreground line-clamp-1">{col.originalName}</span>
                {getRoleBadge(col.role, col.dataType)}
              </div>

              <div className="text-[11px] text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Null Values:</span>
                  <span className={col.nullCount > 0 ? "text-amber-500 font-medium" : "text-foreground"}>
                    {col.nullCount} ({col.nullPercentage}%)
                  </span>
                </div>

                {col.role === "metric" && col.mean !== undefined && (
                  <div className="flex justify-between">
                    <span>Mean / Max:</span>
                    <span className="text-foreground font-medium">
                      {col.mean} / {col.max}
                    </span>
                  </div>
                )}

                {col.role === "temporal" && col.minDate && (
                  <div className="flex justify-between">
                    <span>Range:</span>
                    <span className="text-foreground font-medium">
                      {col.minDate} → {col.maxDate}
                    </span>
                  </div>
                )}

                {(col.role === "dimension" || col.role === "identifier") && col.distinctCount && (
                  <div className="flex justify-between">
                    <span>Distinct:</span>
                    <span className="text-foreground font-medium">{col.distinctCount} unique</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset Preview Table */}
      <div className="p-5 rounded-xl border border-border/60 bg-card shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-foreground">Data Preview</h3>
            <p className="text-xs text-muted-foreground">
              Showing {filteredRows.length.toLocaleString()} matching records
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="size-3.5 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search table rows..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-border/60 rounded-lg">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground uppercase text-[10px]">
              <tr>
                {dataset.normalizedHeaders.map((normKey, i) => (
                  <th key={normKey} className="px-3 py-2.5 font-bold tracking-wider whitespace-nowrap">
                    {dataset.headers[i]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {paginatedRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-muted/30 transition-colors">
                  {dataset.normalizedHeaders.map((normKey) => (
                    <td key={normKey} className="px-3 py-2 text-foreground whitespace-nowrap max-w-[200px] truncate">
                      {row[normKey] !== null && row[normKey] !== undefined ? String(row[normKey]) : <span className="text-muted-foreground italic">null</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md border border-border hover:bg-muted disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md border border-border hover:bg-muted disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
