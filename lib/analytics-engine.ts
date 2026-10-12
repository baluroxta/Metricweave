import { parseNumericValue, parseDateValue, isNullOrEmpty } from "./data-profiler";

export type AggregationFunction = "sum" | "avg" | "count" | "distinctCount" | "min" | "max";

export interface AggregationResult {
  value: number;
  formatted: string;
  count: number;
}

export interface GroupedBarDataPoint {
  label: string;
  value: number;
  formattedValue: string;
  percentage?: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  timestamp: number;
  value: number;
  formattedValue: string;
  secondaryValue?: number;
  formattedSecondaryValue?: string;
}

export interface ScatterDataPoint {
  x: number;
  y: number;
  label: string;
  formattedX: string;
  formattedY: string;
}

export interface MetricCardValue {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  change?: number; // e.g. +12.4%
  changeType?: "positive" | "negative" | "neutral";
  subtitle?: string;
  isCalculated?: boolean;
}

/**
 * Safe division preventing NaN and Infinity.
 */
export function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  if (denominator === 0 || isNaN(denominator) || isNaN(numerator) || !isFinite(denominator)) {
    return fallback;
  }
  const result = numerator / denominator;
  return isFinite(result) ? result : fallback;
}

/**
 * Format numbers cleanly as currency, percentage, or compact integers.
 */
export function formatMetricValue(
  value: number,
  format: "currency" | "percentage" | "compact" | "integer" | "decimal" = "compact"
): string {
  if (value === null || value === undefined || isNaN(value)) return "—";

  switch (format) {
    case "currency": {
      if (Math.abs(value) >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(2)}M`;
      }
      if (Math.abs(value) >= 1_000) {
        return `$${(value / 1_000).toFixed(1)}k`;
      }
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    case "percentage": {
      return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
    }
    case "compact": {
      if (Math.abs(value) >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(2)}M`;
      }
      if (Math.abs(value) >= 1_000) {
        return `${(value / 1_000).toFixed(1)}k`;
      }
      return value % 1 === 0 ? value.toLocaleString() : value.toFixed(2);
    }
    case "integer": {
      return Math.round(value).toLocaleString();
    }
    case "decimal": {
      return value.toFixed(2);
    }
    default:
      return String(value);
  }
}

/**
 * Computes an aggregate measure over an array of row objects.
 */
export function calculateAggregation(
  rows: Record<string, any>[],
  columnName: string,
  fn: AggregationFunction = "sum"
): number {
  if (!rows || rows.length === 0) return 0;

  if (fn === "count") {
    return rows.filter((r) => !isNullOrEmpty(r[columnName])).length;
  }

  if (fn === "distinctCount") {
    const set = new Set();
    rows.forEach((r) => {
      const v = r[columnName];
      if (!isNullOrEmpty(v)) set.add(String(v).trim().toLowerCase());
    });
    return set.size;
  }

  const numericVals: number[] = [];
  for (const r of rows) {
    const parsed = parseNumericValue(r[columnName]);
    if (parsed !== null && !isNaN(parsed)) {
      numericVals.push(parsed);
    }
  }

  if (numericVals.length === 0) return 0;

  switch (fn) {
    case "sum":
      return numericVals.reduce((acc, curr) => acc + curr, 0);
    case "avg": {
      const total = numericVals.reduce((acc, curr) => acc + curr, 0);
      return safeDivide(total, numericVals.length);
    }
    case "min":
      return Math.min(...numericVals);
    case "max":
      return Math.max(...numericVals);
    default:
      return 0;
  }
}

/**
 * Group records by a dimension and calculate an aggregated measure.
 */
export function groupAndAggregate(
  rows: Record<string, any>[],
  dimensionCol: string,
  measureCol: string,
  aggregationFn: AggregationFunction = "sum",
  topN = 8,
  sortOrder: "desc" | "asc" = "desc"
): GroupedBarDataPoint[] {
  if (!rows || rows.length === 0 || !dimensionCol) return [];

  const groups = new Map<string, number[]>();

  for (const row of rows) {
    const rawDim = row[dimensionCol];
    const dimLabel = isNullOrEmpty(rawDim) ? "Unknown" : String(rawDim).trim();

    const val = measureCol ? parseNumericValue(row[measureCol]) : 1;
    if (!groups.has(dimLabel)) {
      groups.set(dimLabel, []);
    }
    if (val !== null && !isNaN(val)) {
      groups.get(dimLabel)!.push(val);
    }
  }

  const aggregatedList: { label: string; value: number }[] = [];
  let grandTotal = 0;

  groups.forEach((nums, label) => {
    let aggValue = 0;
    if (aggregationFn === "count") {
      aggValue = nums.length;
    } else if (nums.length > 0) {
      if (aggregationFn === "sum") {
        aggValue = nums.reduce((a, b) => a + b, 0);
      } else if (aggregationFn === "avg") {
        aggValue = safeDivide(nums.reduce((a, b) => a + b, 0), nums.length);
      } else if (aggregationFn === "min") {
        aggValue = Math.min(...nums);
      } else if (aggregationFn === "max") {
        aggValue = Math.max(...nums);
      }
    }
    aggValue = Math.round(aggValue * 100) / 100;
    grandTotal += aggValue;
    aggregatedList.push({ label, value: aggValue });
  });

  aggregatedList.sort((a, b) =>
    sortOrder === "desc" ? b.value - a.value : a.value - b.value
  );

  let finalItems = aggregatedList;
  if (aggregatedList.length > topN) {
    const top = aggregatedList.slice(0, topN);
    const others = aggregatedList.slice(topN);
    const otherSum = others.reduce((acc, curr) => acc + curr.value, 0);
    if (otherSum > 0) {
      top.push({
        label: "Other",
        value: Math.round(otherSum * 100) / 100,
      });
    }
    finalItems = top;
  }

  return finalItems.map((item) => ({
    label: item.label,
    value: item.value,
    formattedValue: formatMetricValue(item.value, "compact"),
    percentage: grandTotal > 0 ? Math.round(safeDivide(item.value, grandTotal) * 1000) / 10 : 0,
  }));
}

/**
 * Group records by a date column into chronological monthly, quarterly, or daily periods.
 */
export function groupTimeSeries(
  rows: Record<string, any>[],
  dateCol: string,
  measureCol: string,
  aggregationFn: AggregationFunction = "sum",
  granularity: "month" | "quarter" | "day" = "month",
  secondaryMeasureCol?: string
): TimeSeriesDataPoint[] {
  if (!rows || rows.length === 0 || !dateCol) return [];

  const periodMap = new Map<
    string,
    { timestamp: number; values: number[]; secondaryValues: number[] }
  >();

  for (const row of rows) {
    const dateVal = parseDateValue(row[dateCol]);
    if (!dateVal) continue;

    let periodKey: string;
    const year = dateVal.getFullYear();
    const month = String(dateVal.getMonth() + 1).padStart(2, "0");
    const day = String(dateVal.getDate()).padStart(2, "0");

    if (granularity === "day") {
      periodKey = `${year}-${month}-${day}`;
    } else if (granularity === "quarter") {
      const q = Math.floor(dateVal.getMonth() / 3) + 1;
      periodKey = `${year}-Q${q}`;
    } else {
      // Month
      periodKey = `${year}-${month}`;
    }

    if (!periodMap.has(periodKey)) {
      const periodDate = new Date(year, dateVal.getMonth(), granularity === "day" ? dateVal.getDate() : 1);
      periodMap.set(periodKey, {
        timestamp: periodDate.getTime(),
        values: [],
        secondaryValues: [],
      });
    }

    const val = measureCol ? parseNumericValue(row[measureCol]) : 1;
    if (val !== null && !isNaN(val)) {
      periodMap.get(periodKey)!.values.push(val);
    }

    if (secondaryMeasureCol) {
      const secVal = parseNumericValue(row[secondaryMeasureCol]);
      if (secVal !== null && !isNaN(secVal)) {
        periodMap.get(periodKey)!.secondaryValues.push(secVal);
      }
    }
  }

  const sortedPeriods = Array.from(periodMap.entries()).sort(
    (a, b) => a[1].timestamp - b[1].timestamp
  );

  return sortedPeriods.map(([periodKey, data]) => {
    let mainVal = 0;
    if (aggregationFn === "count") {
      mainVal = data.values.length;
    } else if (data.values.length > 0) {
      if (aggregationFn === "sum") {
        mainVal = data.values.reduce((a, b) => a + b, 0);
      } else if (aggregationFn === "avg") {
        mainVal = safeDivide(data.values.reduce((a, b) => a + b, 0), data.values.length);
      }
    }
    mainVal = Math.round(mainVal * 100) / 100;

    let secVal: number | undefined = undefined;
    if (secondaryMeasureCol && data.secondaryValues.length > 0) {
      secVal =
        aggregationFn === "sum"
          ? data.secondaryValues.reduce((a, b) => a + b, 0)
          : safeDivide(data.secondaryValues.reduce((a, b) => a + b, 0), data.secondaryValues.length);
      secVal = Math.round(secVal * 100) / 100;
    }

    return {
      date: periodKey,
      timestamp: data.timestamp,
      value: mainVal,
      formattedValue: formatMetricValue(mainVal, "compact"),
      secondaryValue: secVal,
      formattedSecondaryValue: secVal !== undefined ? formatMetricValue(secVal, "compact") : undefined,
    };
  });
}

/**
 * Create scatter data points for two numeric columns.
 */
export function generateScatterData(
  rows: Record<string, any>[],
  xCol: string,
  yCol: string,
  labelCol?: string,
  maxPoints = 100
): ScatterDataPoint[] {
  if (!rows || rows.length === 0 || !xCol || !yCol) return [];

  const points: ScatterDataPoint[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const x = parseNumericValue(row[xCol]);
    const y = parseNumericValue(row[yCol]);

    if (x !== null && y !== null) {
      const label = labelCol && row[labelCol] ? String(row[labelCol]) : `Row ${i + 1}`;
      points.push({
        x: Math.round(x * 100) / 100,
        y: Math.round(y * 100) / 100,
        label,
        formattedX: formatMetricValue(x, "compact"),
        formattedY: formatMetricValue(y, "compact"),
      });
      if (points.length >= maxPoints) break;
    }
  }

  return points;
}
