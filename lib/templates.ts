import { ColumnProfile, ParsedDataset } from "./data-profiler";
import {
  calculateAggregation,
  groupAndAggregate,
  groupTimeSeries,
  generateScatterData,
  formatMetricValue,
  safeDivide,
  MetricCardValue,
  GroupedBarDataPoint,
  TimeSeriesDataPoint,
  ScatterDataPoint,
} from "./analytics-engine";

export type TemplateType =
  | "sales"
  | "finance"
  | "hr"
  | "marketing"
  | "executive";

export interface VisualConfig {
  id: string;
  title: string;
  description: string;
  type: "kpi" | "bar" | "horizontal_bar" | "line" | "area" | "donut" | "scatter" | "table";
  dimensionCol?: string;
  measureCol?: string;
  secondaryMeasureCol?: string;
  dateCol?: string;
  aggregationFn?: "sum" | "avg" | "count" | "min" | "max";
  data: any;
  notes?: string;
  missingFieldWarning?: string;
}

export interface GeneratedDashboard {
  templateId: TemplateType;
  title: string;
  subtitle: string;
  summaryText: string;
  kpis: MetricCardValue[];
  visuals: VisualConfig[];
  availableDimensions: { key: string; label: string }[];
  availableMetrics: { key: string; label: string }[];
  availableDates: { key: string; label: string }[];
  missingFields: string[];
}

export interface TemplateDefinition {
  id: TemplateType;
  name: string;
  category: string;
  description: string;
  iconName: string;
  suitableDomain: string[];
  requiredRoleTypes: {
    metric?: number;
    dimension?: number;
    temporal?: number;
  };
}

export const TEMPLATE_DEFINITIONS: TemplateDefinition[] = [
  {
    id: "sales",
    name: "Sales Analytics",
    category: "Commercial",
    description: "Revenue trajectory, order volume, Average Order Value, and product/regional performance breakdowns.",
    iconName: "TrendingUp",
    suitableDomain: ["sales", "general"],
    requiredRoleTypes: { metric: 1, dimension: 1 },
  },
  {
    id: "finance",
    name: "Finance Analytics",
    category: "Financial Management",
    description: "Revenue vs. expenses, gross profit, margin trends, cost centers, and cash outflow breakdowns.",
    iconName: "DollarSign",
    suitableDomain: ["finance", "general"],
    requiredRoleTypes: { metric: 1, dimension: 1 },
  },
  {
    id: "hr",
    name: "HR Analytics",
    category: "People & Talent",
    description: "Workforce headcount, department distribution, hiring velocity, and tenure or compensation metrics.",
    iconName: "Users",
    suitableDomain: ["hr", "general"],
    requiredRoleTypes: { dimension: 1 },
  },
  {
    id: "marketing",
    name: "Marketing Analytics",
    category: "Growth & Acquisition",
    description: "Campaign performance, channel conversions, lead volume, CTR/CPA efficiency, and spend attribution.",
    iconName: "Target",
    suitableDomain: ["marketing", "general"],
    requiredRoleTypes: { metric: 1, dimension: 1 },
  },
  {
    id: "executive",
    name: "Executive Overview",
    category: "Leadership & C-Suite",
    description: "High-level summary KPIs, key performance trends, top category contribution, and evidence-based briefing.",
    iconName: "Briefcase",
    suitableDomain: ["sales", "finance", "hr", "marketing", "general"],
    requiredRoleTypes: { metric: 1 },
  },
];

/**
 * Finds columns matching any of the candidate regex names.
 */
function findColumn(
  columns: ColumnProfile[],
  patterns: RegExp[],
  roleFilter?: "metric" | "dimension" | "temporal" | "identifier"
): ColumnProfile | undefined {
  return columns.find((c) => {
    if (roleFilter && c.role !== roleFilter) return false;
    return patterns.some((p) => p.test(c.name) || p.test(c.originalName));
  });
}

/**
 * Generates a tailored business dashboard from parsed dataset.
 */
export function generateDashboard(
  dataset: ParsedDataset,
  templateId: TemplateType = "executive"
): GeneratedDashboard {
  const { rows, qualityReport } = dataset;
  const cols = qualityReport.columns;

  const metrics = cols.filter((c) => c.role === "metric");
  const dimensions = cols.filter((c) => c.role === "dimension" || c.dataType === "categorical");
  const dates = cols.filter((c) => c.role === "temporal");

  const availableMetrics = metrics.map((m) => ({ key: m.name, label: m.originalName }));
  const availableDimensions = dimensions.map((d) => ({ key: d.name, label: d.originalName }));
  const availableDates = dates.map((d) => ({ key: d.name, label: d.originalName }));

  switch (templateId) {
    case "sales":
      return buildSalesDashboard(rows, cols, availableMetrics, availableDimensions, availableDates);
    case "finance":
      return buildFinanceDashboard(rows, cols, availableMetrics, availableDimensions, availableDates);
    case "hr":
      return buildHRDashboard(rows, cols, availableMetrics, availableDimensions, availableDates);
    case "marketing":
      return buildMarketingDashboard(rows, cols, availableMetrics, availableDimensions, availableDates);
    case "executive":
    default:
      return buildExecutiveDashboard(rows, cols, availableMetrics, availableDimensions, availableDates);
  }
}

// -------------------------------------------------------------
// SALES ANALYTICS BUILDER
// -------------------------------------------------------------
function buildSalesDashboard(
  rows: Record<string, any>[],
  cols: ColumnProfile[],
  availableMetrics: { key: string; label: string }[],
  availableDimensions: { key: string; label: string }[],
  availableDates: { key: string; label: string }[]
): GeneratedDashboard {
  const missingFields: string[] = [];

  const revenueCol =
    findColumn(cols, [/revenue/i, /sales/i, /amount/i, /total/i, /price/i], "metric") || cols.find((c) => c.role === "metric");
  const orderIdCol =
    findColumn(cols, [/order.*id/i, /invoice/i, /transaction/i], "identifier") || cols.find((c) => c.role === "identifier");
  const quantityCol = findColumn(cols, [/quantity/i, /units/i, /volume/i, /qty/i], "metric");
  const categoryCol =
    findColumn(cols, [/category/i, /segment/i, /type/i, /department/i], "dimension") || cols.find((c) => c.role === "dimension");
  const regionCol = findColumn(cols, [/region/i, /country/i, /state/i, /city/i, /territory/i], "dimension");
  const productCol = findColumn(cols, [/product/i, /item/i, /sku/i, /name/i], "dimension");
  const dateCol = cols.find((c) => c.role === "temporal");

  if (!revenueCol) missingFields.push("Primary Revenue / Sales measure");
  if (!categoryCol) missingFields.push("Product / Category dimension");

  const totalRev = revenueCol ? calculateAggregation(rows, revenueCol.name, "sum") : 0;
  const totalOrders = orderIdCol
    ? calculateAggregation(rows, orderIdCol.name, "distinctCount")
    : rows.length;
  const aov = safeDivide(totalRev, totalOrders);
  const totalUnits = quantityCol ? calculateAggregation(rows, quantityCol.name, "sum") : null;

  const kpis: MetricCardValue[] = [
    {
      id: "total_revenue",
      title: "Total Revenue",
      value: totalRev,
      formattedValue: formatMetricValue(totalRev, "currency"),
      subtitle: revenueCol ? `Aggregated from ${revenueCol.originalName}` : "No revenue column detected",
    },
    {
      id: "total_orders",
      title: "Total Orders",
      value: totalOrders,
      formattedValue: formatMetricValue(totalOrders, "integer"),
      subtitle: orderIdCol ? `Distinct ${orderIdCol.originalName}` : "Total transaction rows",
    },
    {
      id: "average_order_value",
      title: "Average Order Value (AOV)",
      value: aov,
      formattedValue: formatMetricValue(aov, "currency"),
      subtitle: "Calculated: Revenue / Orders",
      isCalculated: true,
    },
  ];

  if (totalUnits !== null && quantityCol) {
    kpis.push({
      id: "units_sold",
      title: "Units Sold",
      value: totalUnits,
      formattedValue: formatMetricValue(totalUnits, "integer"),
      subtitle: `Aggregated from ${quantityCol.originalName}`,
    });
  }

  const visuals: VisualConfig[] = [];

  // Visual 1: Time Series Revenue
  if (dateCol && revenueCol) {
    visuals.push({
      id: "revenue_trend",
      title: "Revenue Trajectory Over Time",
      description: `Monthly aggregated ${revenueCol.originalName} by ${dateCol.originalName}`,
      type: "area",
      dateCol: dateCol.name,
      measureCol: revenueCol.name,
      aggregationFn: "sum",
      data: groupTimeSeries(rows, dateCol.name, revenueCol.name, "sum", "month"),
    });
  }

  // Visual 2: Category Breakdown
  if (categoryCol && revenueCol) {
    visuals.push({
      id: "revenue_by_category",
      title: `Revenue by ${categoryCol.originalName}`,
      description: `Distribution of sales across ${categoryCol.originalName}`,
      type: "bar",
      dimensionCol: categoryCol.name,
      measureCol: revenueCol.name,
      aggregationFn: "sum",
      data: groupAndAggregate(rows, categoryCol.name, revenueCol.name, "sum", 7),
    });
  }

  // Visual 3: Regional Share
  if (regionCol && revenueCol) {
    visuals.push({
      id: "revenue_by_region",
      title: `Regional Share (${regionCol.originalName})`,
      description: `Share of wallet by geographic ${regionCol.originalName}`,
      type: "donut",
      dimensionCol: regionCol.name,
      measureCol: revenueCol.name,
      aggregationFn: "sum",
      data: groupAndAggregate(rows, regionCol.name, revenueCol.name, "sum", 6),
    });
  }

  // Visual 4: Top Products / Performers
  const topDim = productCol || categoryCol;
  if (topDim && revenueCol) {
    visuals.push({
      id: "top_performers",
      title: `Top 5 ${topDim.originalName} by Sales`,
      description: `Highest grossing ${topDim.originalName}`,
      type: "horizontal_bar",
      dimensionCol: topDim.name,
      measureCol: revenueCol.name,
      aggregationFn: "sum",
      data: groupAndAggregate(rows, topDim.name, revenueCol.name, "sum", 5),
    });
  }

  return {
    templateId: "sales",
    title: "Sales & Commercial Analytics",
    subtitle: `Generated from ${rows.length.toLocaleString()} transaction rows`,
    summaryText: `Analyzed ${rows.length.toLocaleString()} rows. Generated ${formatMetricValue(
      totalRev,
      "currency"
    )} in total revenue across ${totalOrders.toLocaleString()} orders, yielding an Average Order Value of ${formatMetricValue(
      aov,
      "currency"
    )}.`,
    kpis,
    visuals,
    availableMetrics,
    availableDimensions,
    availableDates,
    missingFields,
  };
}

// -------------------------------------------------------------
// FINANCE ANALYTICS BUILDER
// -------------------------------------------------------------
function buildFinanceDashboard(
  rows: Record<string, any>[],
  cols: ColumnProfile[],
  availableMetrics: { key: string; label: string }[],
  availableDimensions: { key: string; label: string }[],
  availableDates: { key: string; label: string }[]
): GeneratedDashboard {
  const missingFields: string[] = [];

  const revenueCol =
    findColumn(cols, [/revenue/i, /income/i, /sales/i, /inflow/i], "metric") || cols.find((c) => c.role === "metric");
  const expenseCol = findColumn(cols, [/expense/i, /cost/i, /cogs/i, /spend/i, /outflow/i], "metric");
  const profitCol = findColumn(cols, [/profit/i, /margin/i, /net/i], "metric");
  const categoryCol =
    findColumn(cols, [/category/i, /account/i, /cost_center/i, /department/i], "dimension") || cols.find((c) => c.role === "dimension");
  const dateCol = cols.find((c) => c.role === "temporal");

  if (!revenueCol) missingFields.push("Revenue / Income measure");
  if (!expenseCol) missingFields.push("Expense / Cost measure (optional)");

  const totalRev = revenueCol ? calculateAggregation(rows, revenueCol.name, "sum") : 0;
  const totalExp = expenseCol ? calculateAggregation(rows, expenseCol.name, "sum") : 0;

  let netProfit = 0;
  let isCalculatedProfit = false;
  if (profitCol) {
    netProfit = calculateAggregation(rows, profitCol.name, "sum");
  } else if (expenseCol && revenueCol) {
    netProfit = totalRev - totalExp;
    isCalculatedProfit = true;
  }

  const profitMargin = totalRev > 0 ? safeDivide(netProfit, totalRev) * 100 : 0;

  const kpis: MetricCardValue[] = [
    {
      id: "total_revenue",
      title: "Total Revenue",
      value: totalRev,
      formattedValue: formatMetricValue(totalRev, "currency"),
      subtitle: revenueCol ? `Source: ${revenueCol.originalName}` : "Unavailable",
      isCalculated: false,
    },
  ];

  if (expenseCol) {
    kpis.push({
      id: "total_expense",
      title: "Total Expenses",
      value: totalExp,
      formattedValue: formatMetricValue(totalExp, "currency"),
      subtitle: `Source: ${expenseCol.originalName}`,
      isCalculated: false,
    });
  }

  if (profitCol || expenseCol) {
    kpis.push(
      {
        id: "net_profit",
        title: "Net Operating Profit",
        value: netProfit,
        formattedValue: formatMetricValue(netProfit, "currency"),
        subtitle: isCalculatedProfit ? "Calculated: Revenue - Expenses" : `Source: ${profitCol?.originalName}`,
        isCalculated: isCalculatedProfit,
        changeType: netProfit >= 0 ? "positive" : "negative",
      },
      {
        id: "profit_margin",
        title: "Profit Margin",
        value: profitMargin,
        formattedValue: `${profitMargin.toFixed(1)}%`,
        subtitle: "Calculated: (Profit / Revenue) × 100",
        isCalculated: true,
        changeType: profitMargin >= 15 ? "positive" : "neutral",
      }
    );
  }

  const visuals: VisualConfig[] = [];

  // Monthly Financial Trend (Dual-series if both exist)
  if (dateCol && revenueCol) {
    visuals.push({
      id: "financial_trajectory",
      title: expenseCol ? "Revenue vs. Expense Trajectory" : "Revenue Trend",
      description: "Monthly financial performance over time",
      type: "line",
      dateCol: dateCol.name,
      measureCol: revenueCol.name,
      secondaryMeasureCol: expenseCol?.name,
      data: groupTimeSeries(rows, dateCol.name, revenueCol.name, "sum", "month", expenseCol?.name),
    });
  }

  // Cost / Expense Breakdown
  const catMeasure = expenseCol || revenueCol;
  if (categoryCol && catMeasure) {
    visuals.push({
      id: "category_breakdown",
      title: `${categoryCol.originalName} Financial Breakdown`,
      description: `Distribution of ${catMeasure.originalName} by ${categoryCol.originalName}`,
      type: "donut",
      dimensionCol: categoryCol.name,
      measureCol: catMeasure.name,
      data: groupAndAggregate(rows, categoryCol.name, catMeasure.name, "sum", 6),
    });
  }

  // Major Cost Centers or Revenue Streams
  if (categoryCol && catMeasure) {
    visuals.push({
      id: "cost_ranking",
      title: `Top ${categoryCol.originalName} by Volume`,
      description: `Ranked contribution by ${categoryCol.originalName}`,
      type: "bar",
      dimensionCol: categoryCol.name,
      measureCol: catMeasure.name,
      data: groupAndAggregate(rows, categoryCol.name, catMeasure.name, "sum", 7),
    });
  }

  return {
    templateId: "finance",
    title: "Financial Analytics & Operating Health",
    subtitle: `Synthesized financial summary from ${rows.length.toLocaleString()} entries`,
    summaryText: `Recorded ${formatMetricValue(totalRev, "currency")} in total revenue${
      expenseCol ? ` and ${formatMetricValue(totalExp, "currency")} in expenses` : ""
    }.${
      profitCol || expenseCol
        ? ` Net profit stands at ${formatMetricValue(netProfit, "currency")} (${profitMargin.toFixed(1)}% margin).`
        : ""
    }`,
    kpis,
    visuals,
    availableMetrics,
    availableDimensions,
    availableDates,
    missingFields,
  };
}

// -------------------------------------------------------------
// HR ANALYTICS BUILDER
// -------------------------------------------------------------
function buildHRDashboard(
  rows: Record<string, any>[],
  cols: ColumnProfile[],
  availableMetrics: { key: string; label: string }[],
  availableDimensions: { key: string; label: string }[],
  availableDates: { key: string; label: string }[]
): GeneratedDashboard {
  const missingFields: string[] = [];

  const empIdCol = findColumn(cols, [/emp.*id/i, /employee/i, /staff/i, /id$/i], "identifier");
  const deptCol =
    findColumn(cols, [/department/i, /dept/i, /division/i, /team/i], "dimension") || cols.find((c) => c.role === "dimension");
  const salaryCol = findColumn(cols, [/salary/i, /compensation/i, /pay/i, /wage/i], "metric");
  const tenureCol = findColumn(cols, [/tenure/i, /experience/i, /years/i], "metric");
  const attritionCol = findColumn(cols, [/attrition/i, /status/i, /active/i, /terminated/i, /exit/i], "dimension");
  const hireDateCol = findColumn(cols, [/hire.*date/i, /start.*date/i, /date/i], "temporal") || cols.find((c) => c.role === "temporal");

  if (!deptCol) missingFields.push("Department / Team dimension");

  const totalHeadcount = empIdCol
    ? calculateAggregation(rows, empIdCol.name, "distinctCount")
    : rows.length;
  const avgSalary = salaryCol ? calculateAggregation(rows, salaryCol.name, "avg") : null;
  const avgTenure = tenureCol ? calculateAggregation(rows, tenureCol.name, "avg") : null;
  const totalDepts = deptCol ? calculateAggregation(rows, deptCol.name, "distinctCount") : 0;

  const kpis: MetricCardValue[] = [
    {
      id: "headcount",
      title: "Total Headcount",
      value: totalHeadcount,
      formattedValue: totalHeadcount.toLocaleString(),
      subtitle: empIdCol ? `Active employee count from ${empIdCol.originalName}` : "Total employee records",
    },
    {
      id: "department_count",
      title: "Active Departments",
      value: totalDepts,
      formattedValue: totalDepts.toLocaleString(),
      subtitle: deptCol ? `Distinct ${deptCol.originalName}` : "Departments",
    },
  ];

  if (avgSalary !== null && salaryCol) {
    kpis.push({
      id: "avg_salary",
      title: "Average Compensation",
      value: avgSalary,
      formattedValue: formatMetricValue(avgSalary, "currency"),
      subtitle: `Mean from ${salaryCol.originalName}`,
    });
  }

  if (avgTenure !== null && tenureCol) {
    kpis.push({
      id: "avg_tenure",
      title: "Average Tenure",
      value: avgTenure,
      formattedValue: `${avgTenure.toFixed(1)} yrs`,
      subtitle: `Mean tenure from ${tenureCol.originalName}`,
    });
  }

  const visuals: VisualConfig[] = [];

  // Department Distribution
  if (deptCol) {
    visuals.push({
      id: "headcount_by_dept",
      title: `Headcount by ${deptCol.originalName}`,
      description: `Staff allocation across ${deptCol.originalName}`,
      type: "bar",
      dimensionCol: deptCol.name,
      aggregationFn: "count",
      data: groupAndAggregate(rows, deptCol.name, "", "count", 8),
    });
  }

  // Hiring Velocity Over Time
  if (hireDateCol) {
    visuals.push({
      id: "hiring_trends",
      title: "Hiring Velocity Over Time",
      description: `Onboarding velocity tracked by ${hireDateCol.originalName}`,
      type: "line",
      dateCol: hireDateCol.name,
      aggregationFn: "count",
      data: groupTimeSeries(rows, hireDateCol.name, "", "count", "quarter"),
    });
  }

  // Salary by Department
  if (deptCol && salaryCol) {
    visuals.push({
      id: "salary_by_dept",
      title: `Average Compensation by ${deptCol.originalName}`,
      description: `Average ${salaryCol.originalName} by department`,
      type: "horizontal_bar",
      dimensionCol: deptCol.name,
      measureCol: salaryCol.name,
      aggregationFn: "avg",
      data: groupAndAggregate(rows, deptCol.name, salaryCol.name, "avg", 7),
    });
  }

  return {
    templateId: "hr",
    title: "HR Workforce & Talent Analytics",
    subtitle: `Tracking ${totalHeadcount.toLocaleString()} employees across ${totalDepts} departments`,
    summaryText: `Total workforce comprises ${totalHeadcount.toLocaleString()} employees across ${totalDepts} departments.${
      avgSalary ? ` Average salary is ${formatMetricValue(avgSalary, "currency")}.` : ""
    }`,
    kpis,
    visuals,
    availableMetrics,
    availableDimensions,
    availableDates,
    missingFields,
  };
}

// -------------------------------------------------------------
// MARKETING ANALYTICS BUILDER
// -------------------------------------------------------------
function buildMarketingDashboard(
  rows: Record<string, any>[],
  cols: ColumnProfile[],
  availableMetrics: { key: string; label: string }[],
  availableDimensions: { key: string; label: string }[],
  availableDates: { key: string; label: string }[]
): GeneratedDashboard {
  const missingFields: string[] = [];

  const spendCol = findColumn(cols, [/spend/i, /cost/i, /budget/i, /ad_spend/i], "metric");
  const conversionCol = findColumn(cols, [/conversion/i, /lead/i, /acquisition/i, /order/i], "metric");
  const clickCol = findColumn(cols, [/click/i, /visit/i, /session/i], "metric");
  const channelCol =
    findColumn(cols, [/channel/i, /source/i, /campaign/i, /platform/i], "dimension") || cols.find((c) => c.role === "dimension");
  const revenueCol = findColumn(cols, [/revenue/i, /sales/i], "metric");
  const dateCol = cols.find((c) => c.role === "temporal");

  if (!channelCol) missingFields.push("Campaign / Channel dimension");

  const totalSpend = spendCol ? calculateAggregation(rows, spendCol.name, "sum") : 0;
  const totalConversions = conversionCol
    ? calculateAggregation(rows, conversionCol.name, "sum")
    : rows.length;
  const totalClicks = clickCol ? calculateAggregation(rows, clickCol.name, "sum") : 0;
  const convRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
  const cpa = totalConversions > 0 && totalSpend > 0 ? safeDivide(totalSpend, totalConversions) : 0;

  const kpis: MetricCardValue[] = [];

  if (spendCol) {
    kpis.push({
      id: "ad_spend",
      title: "Total Ad Spend",
      value: totalSpend,
      formattedValue: formatMetricValue(totalSpend, "currency"),
      subtitle: `Aggregated from ${spendCol.originalName}`,
    });
  }

  kpis.push({
    id: "conversions",
    title: conversionCol ? "Total Conversions" : "Tracked Events",
    value: totalConversions,
    formattedValue: formatMetricValue(totalConversions, "integer"),
    subtitle: conversionCol ? `Source: ${conversionCol.originalName}` : "Total campaign rows",
  });

  if (totalClicks > 0) {
    kpis.push({
      id: "conversion_rate",
      title: "Conversion Rate",
      value: convRate,
      formattedValue: `${convRate.toFixed(1)}%`,
      subtitle: "Calculated: Conversions / Clicks",
      isCalculated: true,
    });
  }

  if (cpa > 0) {
    kpis.push({
      id: "cpa",
      title: "Cost Per Acquisition (CPA)",
      value: cpa,
      formattedValue: formatMetricValue(cpa, "currency"),
      subtitle: "Calculated: Spend / Conversions",
      isCalculated: true,
    });
  }

  const visuals: VisualConfig[] = [];

  // Channel Performance
  if (channelCol) {
    const measure = conversionCol || spendCol || revenueCol;
    visuals.push({
      id: "channel_performance",
      title: `Performance by ${channelCol.originalName}`,
      description: `Volume generated across ${channelCol.originalName}`,
      type: "bar",
      dimensionCol: channelCol.name,
      measureCol: measure?.name,
      aggregationFn: measure ? "sum" : "count",
      data: groupAndAggregate(rows, channelCol.name, measure?.name || "", measure ? "sum" : "count", 7),
    });
  }

  // Spend Share
  if (channelCol && spendCol) {
    visuals.push({
      id: "spend_share",
      title: `Spend Allocation by ${channelCol.originalName}`,
      description: `Budget share across ${channelCol.originalName}`,
      type: "donut",
      dimensionCol: channelCol.name,
      measureCol: spendCol.name,
      aggregationFn: "sum",
      data: groupAndAggregate(rows, channelCol.name, spendCol.name, "sum", 6),
    });
  }

  // Campaign Timeline
  if (dateCol) {
    const timeMeasure = conversionCol || spendCol || revenueCol;
    visuals.push({
      id: "marketing_timeline",
      title: "Acquisition Timeline",
      description: `Campaign momentum over time by ${dateCol.originalName}`,
      type: "area",
      dateCol: dateCol.name,
      measureCol: timeMeasure?.name,
      data: groupTimeSeries(rows, dateCol.name, timeMeasure?.name || "", timeMeasure ? "sum" : "count", "month"),
    });
  }

  return {
    templateId: "marketing",
    title: "Marketing Campaign Performance",
    subtitle: `Campaign intelligence across ${rows.length.toLocaleString()} interactions`,
    summaryText: `Acquired ${totalConversions.toLocaleString()} conversions${
      spendCol ? ` on an ad investment of ${formatMetricValue(totalSpend, "currency")}` : ""
    }.${cpa > 0 ? ` Cost per acquisition averaged ${formatMetricValue(cpa, "currency")}.` : ""}`,
    kpis,
    visuals,
    availableMetrics,
    availableDimensions,
    availableDates,
    missingFields,
  };
}

// -------------------------------------------------------------
// EXECUTIVE OVERVIEW BUILDER
// -------------------------------------------------------------
function buildExecutiveDashboard(
  rows: Record<string, any>[],
  cols: ColumnProfile[],
  availableMetrics: { key: string; label: string }[],
  availableDimensions: { key: string; label: string }[],
  availableDates: { key: string; label: string }[]
): GeneratedDashboard {
  const missingFields: string[] = [];

  const primaryMetric =
    cols.find((c) => c.role === "metric" && /revenue|sales|total|amount/i.test(c.name)) ||
    cols.find((c) => c.role === "metric");
  const secondaryMetric = cols.filter((c) => c.role === "metric" && c.name !== primaryMetric?.name)[0];
  const primaryDim =
    cols.find((c) => c.role === "dimension" && /category|segment|region|department/i.test(c.name)) ||
    cols.find((c) => c.role === "dimension" || c.dataType === "categorical");
  const secondaryDim = cols.filter(
    (c) => (c.role === "dimension" || c.dataType === "categorical") && c.name !== primaryDim?.name
  )[0];
  const dateCol = cols.find((c) => c.role === "temporal");

  const totalPrimary = primaryMetric ? calculateAggregation(rows, primaryMetric.name, "sum") : 0;
  const avgPrimary = primaryMetric ? calculateAggregation(rows, primaryMetric.name, "avg") : 0;
  const totalVolume = rows.length;

  const kpis: MetricCardValue[] = [];

  if (primaryMetric) {
    kpis.push({
      id: "primary_total",
      title: `Total ${primaryMetric.originalName}`,
      value: totalPrimary,
      formattedValue:
        primaryMetric.dataType === "currency"
          ? formatMetricValue(totalPrimary, "currency")
          : formatMetricValue(totalPrimary, "compact"),
      subtitle: `Sum of ${primaryMetric.originalName}`,
    });
  }

  kpis.push({
    id: "total_records",
    title: "Total Records",
    value: totalVolume,
    formattedValue: totalVolume.toLocaleString(),
    subtitle: "Complete analyzed sample size",
  });

  if (primaryMetric && avgPrimary > 0) {
    kpis.push({
      id: "primary_average",
      title: `Average ${primaryMetric.originalName}`,
      value: avgPrimary,
      formattedValue:
        primaryMetric.dataType === "currency"
          ? formatMetricValue(avgPrimary, "currency")
          : formatMetricValue(avgPrimary, "compact"),
      subtitle: "Mean per transaction/record",
      isCalculated: true,
    });
  }

  if (secondaryMetric) {
    const totalSec = calculateAggregation(rows, secondaryMetric.name, "sum");
    kpis.push({
      id: "secondary_total",
      title: `Total ${secondaryMetric.originalName}`,
      value: totalSec,
      formattedValue: formatMetricValue(totalSec, "compact"),
      subtitle: `Sum of ${secondaryMetric.originalName}`,
    });
  }

  const visuals: VisualConfig[] = [];

  // Trajectory over time
  if (dateCol) {
    visuals.push({
      id: "executive_trend",
      title: primaryMetric ? `${primaryMetric.originalName} Trajectory` : "Activity Trend",
      description: `Chronological trend by ${dateCol.originalName}`,
      type: "line",
      dateCol: dateCol.name,
      measureCol: primaryMetric?.name,
      aggregationFn: primaryMetric ? "sum" : "count",
      data: groupTimeSeries(rows, dateCol.name, primaryMetric?.name || "", primaryMetric ? "sum" : "count", "month"),
    });
  }

  // Key Category Contribution
  if (primaryDim) {
    visuals.push({
      id: "category_contribution",
      title: `Performance by ${primaryDim.originalName}`,
      description: `Contribution breakdown across ${primaryDim.originalName}`,
      type: "bar",
      dimensionCol: primaryDim.name,
      measureCol: primaryMetric?.name,
      aggregationFn: primaryMetric ? "sum" : "count",
      data: groupAndAggregate(rows, primaryDim.name, primaryMetric?.name || "", primaryMetric ? "sum" : "count", 7),
    });
  }

  // Distribution Share
  const donutDim = secondaryDim || primaryDim;
  if (donutDim) {
    visuals.push({
      id: "share_breakdown",
      title: `Share of Total (${donutDim.originalName})`,
      description: `Percentage share distribution`,
      type: "donut",
      dimensionCol: donutDim.name,
      measureCol: primaryMetric?.name,
      aggregationFn: primaryMetric ? "sum" : "count",
      data: groupAndAggregate(rows, donutDim.name, primaryMetric?.name || "", primaryMetric ? "sum" : "count", 5),
    });
  }

  // Top Performers Table
  if (primaryDim && primaryMetric) {
    visuals.push({
      id: "top_contributors",
      title: `Top Contributing ${primaryDim.originalName}`,
      description: `Ranked table of key performers`,
      type: "horizontal_bar",
      dimensionCol: primaryDim.name,
      measureCol: primaryMetric.name,
      aggregationFn: "sum",
      data: groupAndAggregate(rows, primaryDim.name, primaryMetric.name, "sum", 6),
    });
  }

  // Multi-metric fallback for datasets without a categorical dimension (e.g. stock prices, currencies)
  if (!primaryDim && dateCol) {
    const otherMetrics = cols.filter((c) => c.role === "metric" && c.name !== primaryMetric?.name);
    otherMetrics.slice(0, 3).forEach((m, idx) => {
      visuals.push({
        id: `trend_${m.name || idx}`,
        title: `${m.originalName} Trajectory`,
        description: `Chronological trend for ${m.originalName}`,
        type: idx % 2 === 0 ? "line" : "area",
        dateCol: dateCol.name,
        measureCol: m.name,
        aggregationFn: "sum",
        data: groupTimeSeries(rows, dateCol.name, m.name, "sum", "month"),
      });
    });
  }

  return {
    templateId: "executive",
    title: "Executive Decision Overview",
    subtitle: `Synthesized leadership dashboard from ${totalVolume.toLocaleString()} dataset records`,
    summaryText: `Analyzed ${totalVolume.toLocaleString()} entries.${
      primaryMetric
        ? ` Total ${primaryMetric.originalName} reached ${formatMetricValue(
            totalPrimary,
            primaryMetric.dataType === "currency" ? "currency" : "compact"
          )}, averaging ${formatMetricValue(
            avgPrimary,
            primaryMetric.dataType === "currency" ? "currency" : "compact"
          )} per record.`
        : ""
    }`,
    kpis,
    visuals,
    availableMetrics,
    availableDimensions,
    availableDates,
    missingFields,
  };
}
