import { describe, it, expect } from "vitest";
import {
  parseAndProfileData,
  inferColumnTypeAndRole,
  parseNumericValue,
  parseDateValue,
} from "../lib/data-profiler";
import {
  calculateAggregation,
  groupAndAggregate,
  groupTimeSeries,
  safeDivide,
} from "../lib/analytics-engine";
import { generateDashboard, TEMPLATE_DEFINITIONS } from "../lib/templates";
import { SAMPLE_DATASETS } from "../lib/sample-datasets";

describe("Data Profiler & Type Inference", () => {
  it("correctly parses currency and accounting negative numbers", () => {
    expect(parseNumericValue("$1,234.50")).toBe(1234.5);
    expect(parseNumericValue("(500)")).toBe(-500);
    expect(parseNumericValue("€45.99")).toBe(45.99);
    expect(parseNumericValue("  -12.4% ")).toBe(-12.4);
    expect(parseNumericValue("N/A")).toBeNull();
    expect(parseNumericValue("")).toBeNull();
  });

  it("correctly parses standard and ISO dates", () => {
    expect(parseDateValue("2024-01-15")).not.toBeNull();
    expect(parseDateValue("01/15/2024")).not.toBeNull();
    expect(parseDateValue("2024")).toBeNull(); // Single year integer shouldn't be misidentified as date
    expect(parseDateValue("not a date")).toBeNull();
  });

  it("infers metric, temporal, and dimension roles correctly", () => {
    const revenueType = inferColumnTypeAndRole("Revenue", ["$100", "$200", "$300"]);
    expect(revenueType.role).toBe("metric");
    expect(revenueType.dataType).toBe("currency");

    const dateType = inferColumnTypeAndRole("Order_Date", ["2024-01-01", "2024-01-02", "2024-01-03"]);
    expect(dateType.role).toBe("temporal");
    expect(dateType.dataType).toBe("date");

    const categoryType = inferColumnTypeAndRole("Category", ["Tech", "Office", "Furniture", "Tech"]);
    expect(categoryType.role).toBe("dimension");
    expect(categoryType.dataType).toBe("categorical");

    const idType = inferColumnTypeAndRole("Order_ID", ["ORD-1", "ORD-2", "ORD-3"]);
    expect(idType.role).toBe("identifier");
  });

  it("profiles CSV dataset and computes quality score & duplicate detection", () => {
    const csvData = `id,name,amount,category
1,Item A,100,Widgets
2,Item B,200,Gadgets
3,Item C,,Widgets
1,Item A,100,Widgets`;

    const result = parseAndProfileData(csvData, "csv");
    expect(result.headers).toEqual(["id", "name", "amount", "category"]);
    expect(result.rows.length).toBe(4);
    expect(result.qualityReport.duplicateRows).toBe(1);
    expect(result.qualityReport.totalMissingValues).toBe(1);
    expect(result.qualityReport.columns.find((c) => c.name === "amount")?.nullCount).toBe(1);
  });
});

describe("Analytics Engine & Aggregations", () => {
  const sampleRows = [
    { region: "North", revenue: 100, orders: 2, date: "2024-01-05" },
    { region: "North", revenue: 200, orders: 3, date: "2024-01-10" },
    { region: "South", revenue: 150, orders: 1, date: "2024-02-15" },
    { region: "South", revenue: 250, orders: 4, date: "2024-02-20" },
  ];

  it("calculates deterministic sum, avg, min, max, count", () => {
    expect(calculateAggregation(sampleRows, "revenue", "sum")).toBe(700);
    expect(calculateAggregation(sampleRows, "revenue", "avg")).toBe(175);
    expect(calculateAggregation(sampleRows, "revenue", "min")).toBe(100);
    expect(calculateAggregation(sampleRows, "revenue", "max")).toBe(250);
    expect(calculateAggregation(sampleRows, "revenue", "count")).toBe(4);
    expect(calculateAggregation(sampleRows, "region", "distinctCount")).toBe(2);
  });

  it("groups by dimension with accurate totals", () => {
    const grouped = groupAndAggregate(sampleRows, "region", "revenue", "sum");
    expect(grouped.length).toBe(2);
    expect(grouped[0].label).toBe("South");
    expect(grouped[0].value).toBe(400);
    expect(grouped[1].label).toBe("North");
    expect(grouped[1].value).toBe(300);
  });

  it("groups chronological time series correctly", () => {
    const series = groupTimeSeries(sampleRows, "date", "revenue", "sum", "month");
    expect(series.length).toBe(2);
    expect(series[0].date).toBe("2024-01");
    expect(series[0].value).toBe(300);
    expect(series[1].date).toBe("2024-02");
    expect(series[1].value).toBe(400);
  });
});

describe("Dashboard Templates Generation", () => {
  it("successfully generates dashboards for all 5 business domains", () => {
    for (const sample of SAMPLE_DATASETS) {
      const parsed = parseAndProfileData(sample.csvContent, "csv");
      const dashboard = generateDashboard(parsed, sample.domain);

      expect(dashboard.title).toBeDefined();
      expect(dashboard.kpis.length).toBeGreaterThanOrEqual(2);
      expect(dashboard.visuals.length).toBeGreaterThanOrEqual(2);
      expect(dashboard.summaryText).toBeDefined();

      // Check all KPIs have formatted values and valid numbers
      dashboard.kpis.forEach((kpi) => {
        expect(typeof kpi.value).toBe("number");
        expect(isNaN(kpi.value)).toBe(false);
        expect(kpi.formattedValue).toBeDefined();
      });

      // Check visuals have data arrays
      dashboard.visuals.forEach((vis) => {
        expect(Array.isArray(vis.data)).toBe(true);
        expect(vis.data.length).toBeGreaterThan(0);
      });
    }
  });

  it("generates an Executive Overview dashboard without errors", () => {
    const sample = SAMPLE_DATASETS[0];
    const parsed = parseAndProfileData(sample.csvContent, "csv");
    const execDashboard = generateDashboard(parsed, "executive");

    expect(execDashboard.templateId).toBe("executive");
    expect(execDashboard.kpis.length).toBeGreaterThanOrEqual(3);
    expect(execDashboard.visuals.length).toBeGreaterThanOrEqual(2);
  });
});
