import Papa from "papaparse";
import * as XLSX from "xlsx";

export type InferredDataType =
  | "integer"
  | "decimal"
  | "currency"
  | "date"
  | "datetime"
  | "boolean"
  | "categorical"
  | "text"
  | "identifier";

export type SemanticRole = "metric" | "dimension" | "temporal" | "identifier";

export interface ColumnProfile {
  name: string;
  originalName: string;
  dataType: InferredDataType;
  role: SemanticRole;
  sampleValues: (string | number | boolean | null)[];
  totalCount: number;
  nullCount: number;
  nullPercentage: number;
  distinctCount: number;
  isUnique: boolean;
  // Numeric statistics (if applicable)
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  sum?: number;
  // Categorical statistics
  topValues?: { value: string; count: number }[];
  // Date statistics
  minDate?: string;
  maxDate?: string;
}

export interface DataQualityReport {
  totalRows: number;
  totalColumns: number;
  duplicateRows: number;
  duplicatePercentage: number;
  totalMissingValues: number;
  overallCompleteness: number; // 0 - 100
  qualityScore: number; // 0 - 100
  status: "Excellent" | "Good" | "Needs Review";
  warnings: string[];
  recommendations: string[];
  columns: ColumnProfile[];
}

export interface ParsedDataset {
  headers: string[];
  normalizedHeaders: string[];
  rows: Record<string, any>[];
  rawRows: any[][];
  qualityReport: DataQualityReport;
  inferredDomain: "sales" | "finance" | "hr" | "marketing" | "general";
}

/**
 * Normalizes a column name for consistent programmatic access.
 */
export function normalizeColumnName(name: string): string {
  if (!name || typeof name !== "string") return "column";
  return name
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .toLowerCase();
}

/**
 * Determines if a value is effectively null or empty.
 */
export function isNullOrEmpty(val: any): boolean {
  if (val === null || val === undefined) return true;
  if (typeof val === "string") {
    const trimmed = val.trim().toLowerCase();
    return trimmed === "" || trimmed === "null" || trimmed === "undefined" || trimmed === "n/a" || trimmed === "nan";
  }
  return false;
}

/**
 * Clean and parse numeric values, stripping currency symbols and commas.
 */
export function parseNumericValue(val: any): number | null {
  if (isNullOrEmpty(val)) return null;
  if (typeof val === "number") return isNaN(val) ? null : val;
  if (typeof val === "string") {
    let cleaned = val.trim();
    if (/^\(.*\)$/.test(cleaned)) {
      cleaned = "-" + cleaned.slice(1, -1);
    }
    cleaned = cleaned.replace(/[$€£₹, %]/g, "");
    const num = Number(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
}

/**
 * Check if a string or value is a valid date.
 */
export function parseDateValue(val: any): Date | null {
  if (isNullOrEmpty(val)) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  
  if (typeof val === "number") {
    if (val > 25569 && val < 60000) {
      const utcDays = Math.floor(val - 25569);
      const utcValue = utcDays * 86400;
      const dateInfo = new Date(utcValue * 1000);
      return isNaN(dateInfo.getTime()) ? null : dateInfo;
    }
    return null;
  }

  if (typeof val === "string") {
    const s = val.trim();
    if (/^\d{1,4}$/.test(s)) return null;
    
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}/,
      /^\d{1,2}\/\d{1,2}\/\d{2,4}/,
      /^\d{1,2}-\d{1,2}-\d{2,4}/,
      /^[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{4}/,
    ];
    if (datePatterns.some(p => p.test(s))) {
      const parsed = new Date(s);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
  }
  return null;
}

/**
 * Check if a string is a boolean representation.
 */
export function isBooleanValue(val: any): boolean {
  if (typeof val === "boolean") return true;
  if (typeof val === "string") {
    const s = val.trim().toLowerCase();
    return ["true", "false", "yes", "no", "y", "n"].includes(s);
  }
  return false;
}

/**
 * Infer the specific data type and role for a column.
 */
export function inferColumnTypeAndRole(
  colName: string,
  values: any[]
): { dataType: InferredDataType; role: SemanticRole } {
  const nonNullValues = values.filter((v) => !isNullOrEmpty(v));
  const total = nonNullValues.length;

  const lowerName = colName.toLowerCase();

  if (
    /(_id|id$|^id|uuid|guid|code$|key$|sku)/i.test(lowerName) &&
    !/(price|cost|amount|revenue|rate|discount)/i.test(lowerName)
  ) {
    return { dataType: "identifier", role: "identifier" };
  }

  if (total === 0) {
    return { dataType: "text", role: "dimension" };
  }

  const sample = nonNullValues.slice(0, 200);

  const currencySymbolCount = sample.filter(
    (v) => typeof v === "string" && /[$€£₹]/.test(v)
  ).length;
  const isCurrencyName = /(revenue|sales|price|cost|amount|salary|budget|profit|spend|fee|arr|mrr|cpa|clv)/i.test(
    lowerName
  );

  const numericCount = sample.filter((v) => parseNumericValue(v) !== null).length;
  const numericRatio = numericCount / sample.length;

  if (numericRatio >= 0.85) {
    const parsedNums = sample
      .map(parseNumericValue)
      .filter((n): n is number => n !== null);
    const hasDecimals = parsedNums.some((n) => n % 1 !== 0);

    if (currencySymbolCount / sample.length > 0.3 || isCurrencyName) {
      return { dataType: "currency", role: "metric" };
    }
    if (hasDecimals) {
      return { dataType: "decimal", role: "metric" };
    }
    return { dataType: "integer", role: "metric" };
  }

  const dateCount = sample.filter((v) => parseDateValue(v) !== null).length;
  if (dateCount / sample.length >= 0.8) {
    const hasTime = sample.some(
      (v) => typeof v === "string" && /\d{2}:\d{2}/.test(v)
    );
    return {
      dataType: hasTime ? "datetime" : "date",
      role: "temporal",
    };
  }

  const boolCount = sample.filter(isBooleanValue).length;
  if (boolCount / sample.length >= 0.9) {
    return { dataType: "boolean", role: "dimension" };
  }

  const distinctSet = new Set(sample.map((v) => String(v).trim().toLowerCase()));
  const distinctRatio = distinctSet.size / sample.length;

  if (distinctRatio < 0.4 || distinctSet.size <= 25) {
    return { dataType: "categorical", role: "dimension" };
  }

  return { dataType: "text", role: "dimension" };
}

/**
 * Infer business domain / context from column names.
 */
export function inferBusinessDomain(
  headers: string[]
): "sales" | "finance" | "hr" | "marketing" | "general" {
  const text = headers.join(" ").toLowerCase();

  const domainScores = {
    sales: 0,
    finance: 0,
    hr: 0,
    marketing: 0,
  };

  if (/(revenue|order|sales|customer|product|quantity|ship|discount|retail|store|inventory)/.test(text)) {
    domainScores.sales += 3;
  }
  if (/(expense|budget|cost|profit|margin|asset|liability|accounting|ebitda|tax|financial|cash)/.test(text)) {
    domainScores.finance += 3;
  }
  if (/(employee|salary|department|hire|attrition|headcount|turnover|job|tenure|leave|performance|staff)/.test(text)) {
    domainScores.hr += 4;
  }
  if (/(campaign|clicks|impressions|ctr|conversion|leads|ad|spend|cpa|channel|roas|source|traffic)/.test(text)) {
    domainScores.marketing += 4;
  }

  const sorted = Object.entries(domainScores).sort((a, b) => b[1] - a[1]);
  if (sorted[0][1] >= 3) {
    return sorted[0][0] as any;
  }
  return "general";
}

/**
 * Generates statistical profile and data quality assessment for the dataset.
 */
export function profileDataset(
  headers: string[],
  normalizedHeaders: string[],
  rows: Record<string, any>[]
): DataQualityReport {
  const totalRows = rows.length;
  const totalColumns = headers.length;

  if (totalRows === 0) {
    return {
      totalRows: 0,
      totalColumns: 0,
      duplicateRows: 0,
      duplicatePercentage: 0,
      totalMissingValues: 0,
      overallCompleteness: 100,
      qualityScore: 100,
      status: "Excellent",
      warnings: ["Dataset contains no rows."],
      recommendations: ["Upload a dataset containing rows to analyze."],
      columns: [],
    };
  }

  const rowSignatures = new Set<string>();
  let duplicateCount = 0;
  for (const row of rows) {
    const sig = JSON.stringify(row);
    if (rowSignatures.has(sig)) {
      duplicateCount++;
    } else {
      rowSignatures.add(sig);
    }
  }
  const duplicatePercentage = Math.round((duplicateCount / totalRows) * 1000) / 10;

  let totalNullsAcrossAll = 0;
  const columnProfiles: ColumnProfile[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  normalizedHeaders.forEach((normKey, idx) => {
    const originalName = headers[idx];
    const values = rows.map((r) => r[normKey]);
    const { dataType, role } = inferColumnTypeAndRole(originalName, values);

    let nullCount = 0;
    const valueFrequencies = new Map<any, number>();
    const numericValues: number[] = [];
    const dateValues: Date[] = [];

    values.forEach((v) => {
      if (isNullOrEmpty(v)) {
        nullCount++;
      } else {
        const valStr = String(v).trim();
        valueFrequencies.set(valStr, (valueFrequencies.get(valStr) || 0) + 1);

        if (role === "metric") {
          const num = parseNumericValue(v);
          if (num !== null) numericValues.push(num);
        } else if (role === "temporal") {
          const d = parseDateValue(v);
          if (d !== null) dateValues.push(d);
        }
      }
    });

    totalNullsAcrossAll += nullCount;
    const nullPercentage = Math.round((nullCount / totalRows) * 1000) / 10;
    const distinctCount = valueFrequencies.size;
    const isUnique = distinctCount === totalRows;

    const profile: ColumnProfile = {
      name: normKey,
      originalName,
      dataType,
      role,
      sampleValues: values.slice(0, 5),
      totalCount: totalRows,
      nullCount,
      nullPercentage,
      distinctCount,
      isUnique,
    };

    if (role === "metric" && numericValues.length > 0) {
      numericValues.sort((a, b) => a - b);
      const sum = numericValues.reduce((acc, curr) => acc + curr, 0);
      const mean = sum / numericValues.length;
      const min = numericValues[0];
      const max = numericValues[numericValues.length - 1];
      const mid = Math.floor(numericValues.length / 2);
      const median =
        numericValues.length % 2 !== 0
          ? numericValues[mid]
          : (numericValues[mid - 1] + numericValues[mid]) / 2;

      profile.min = Math.round(min * 100) / 100;
      profile.max = Math.round(max * 100) / 100;
      profile.mean = Math.round(mean * 100) / 100;
      profile.median = Math.round(median * 100) / 100;
      profile.sum = Math.round(sum * 100) / 100;
    }

    if (role === "dimension" || role === "identifier") {
      const sorted = Array.from(valueFrequencies.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([value, count]) => ({ value, count }));
      profile.topValues = sorted;
    }

    if (role === "temporal" && dateValues.length > 0) {
      dateValues.sort((a, b) => a.getTime() - b.getTime());
      profile.minDate = dateValues[0].toISOString().split("T")[0];
      profile.maxDate = dateValues[dateValues.length - 1].toISOString().split("T")[0];
    }

    if (nullPercentage > 25) {
      warnings.push(`Column '${originalName}' has ${nullPercentage}% missing values.`);
    }

    columnProfiles.push(profile);
  });

  if (duplicateCount > 0) {
    warnings.push(`Detected ${duplicateCount} duplicate row(s) (${duplicatePercentage}%).`);
    recommendations.push("Consider deduplicating records to ensure exact metric calculations.");
  }

  const totalCells = totalRows * totalColumns;
  const overallCompleteness =
    Math.round(((totalCells - totalNullsAcrossAll) / totalCells) * 1000) / 10;

  let qualityScore = Math.round(
    overallCompleteness * 0.6 +
      (100 - Math.min(duplicatePercentage * 2, 100)) * 0.3 +
      10
  );
  qualityScore = Math.max(0, Math.min(100, qualityScore));

  let status: "Excellent" | "Good" | "Needs Review" = "Good";
  if (qualityScore >= 90) status = "Excellent";
  else if (qualityScore < 75) status = "Needs Review";

  if (recommendations.length === 0) {
    recommendations.push("Data structure is healthy and ready for multi-dimensional dashboard generation.");
  }

  return {
    totalRows,
    totalColumns,
    duplicateRows: duplicateCount,
    duplicatePercentage,
    totalMissingValues: totalNullsAcrossAll,
    overallCompleteness,
    qualityScore,
    status,
    warnings,
    recommendations,
    columns: columnProfiles,
  };
}

/**
 * Main parser entry point supporting CSV string, Buffer, or XLSX file data.
 */
export function parseAndProfileData(
  input: string | Buffer | ArrayBuffer,
  fileType: "csv" | "xlsx" | "json" = "csv"
): ParsedDataset {
  let headers: string[] = [];
  let rawRows: any[][] = [];

  if (fileType === "csv") {
    const text = typeof input === "string" ? input : Buffer.from(input).toString("utf-8");
    const parsed = Papa.parse(text, {
      header: false,
      skipEmptyLines: "greedy",
    });

    if (parsed.data.length < 2) {
      throw new Error("CSV dataset must contain at least a header row and one data row.");
    }

    headers = (parsed.data[0] as string[]).map((h) => (h ? String(h).trim() : "unnamed"));
    rawRows = parsed.data.slice(1) as any[][];
  } else if (fileType === "xlsx") {
    const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input as ArrayBuffer);
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error("Excel workbook contains no sheets.");
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

    if (data.length < 2) {
      throw new Error("Excel dataset must contain at least a header row and one data row.");
    }

    headers = (data[0] as any[]).map((h) => (h ? String(h).trim() : "unnamed"));
    rawRows = data.slice(1);
  } else {
    const text = typeof input === "string" ? input : Buffer.from(input).toString("utf-8");
    const json = JSON.parse(text);
    const arr = Array.isArray(json) ? json : json.data || [];
    if (!Array.isArray(arr) || arr.length === 0) {
      throw new Error("JSON must contain an array of row objects.");
    }
    headers = Object.keys(arr[0]);
    rawRows = arr.map((item) => headers.map((h) => item[h]));
  }

  const seenNorms = new Set<string>();
  const normalizedHeaders = headers.map((h, i) => {
    let norm = normalizeColumnName(h);
    if (!norm) norm = `col_${i + 1}`;
    let finalNorm = norm;
    let counter = 1;
    while (seenNorms.has(finalNorm)) {
      finalNorm = `${norm}_${counter++}`;
    }
    seenNorms.add(finalNorm);
    return finalNorm;
  });

  const rows: Record<string, any>[] = rawRows.map((rawRow) => {
    const obj: Record<string, any> = {};
    normalizedHeaders.forEach((normKey, colIdx) => {
      obj[normKey] = rawRow[colIdx] !== undefined ? rawRow[colIdx] : null;
    });
    return obj;
  });

  const qualityReport = profileDataset(headers, normalizedHeaders, rows);
  const inferredDomain = inferBusinessDomain(headers);

  return {
    headers,
    normalizedHeaders,
    rows,
    rawRows,
    qualityReport,
    inferredDomain,
  };
}
