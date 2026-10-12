import Together from "together-ai";
import { DataQualityReport } from "./data-profiler";
import { GeneratedDashboard } from "./templates";

export interface AiInsightResponse {
  mode: "ai" | "deterministic";
  provider?: string;
  summary: string;
  keyFindings: string[];
  recommendedActions: string[];
  answer?: string;
}

/**
 * Generates rule-based deterministic insights based on computed KPIs and quality report.
 */
export function generateDeterministicInsights(
  dashboard: GeneratedDashboard,
  quality: DataQualityReport
): AiInsightResponse {
  const findings: string[] = [];
  const actions: string[] = [];

  // Summary statement
  findings.push(dashboard.summaryText);

  // Quality findings
  if (quality.qualityScore >= 90) {
    findings.push(
      `Dataset quality is excellent (${quality.qualityScore}/100) with ${quality.overallCompleteness}% completeness across ${quality.totalRows.toLocaleString()} rows.`
    );
  } else {
    findings.push(
      `Dataset quality is scored at ${quality.qualityScore}/100 with ${quality.totalMissingValues} missing values and ${quality.duplicateRows} duplicate rows detected.`
    );
    actions.push("Review null columns in the data preview to consider default imputation or filtering.");
  }

  // Visual specific findings
  dashboard.visuals.forEach((v) => {
    if (v.data && Array.isArray(v.data) && v.data.length > 0) {
      if (v.type === "bar" || v.type === "horizontal_bar" || v.type === "donut") {
        const topItem = v.data[0];
        if (topItem && topItem.label && topItem.value !== undefined) {
          findings.push(
            `Leading contributor in ${v.title} is '${topItem.label}' with ${topItem.formattedValue}${
              topItem.percentage ? ` (${topItem.percentage}% share)` : ""
            }.`
          );
        }
      } else if (v.type === "line" || v.type === "area") {
        const first = v.data[0];
        const last = v.data[v.data.length - 1];
        if (first && last && first.value !== undefined && last.value !== undefined) {
          const diff = last.value - first.value;
          const trendDir = diff > 0 ? "growth" : diff < 0 ? "contraction" : "flat performance";
          findings.push(
            `${v.title} demonstrates overall ${trendDir} between ${first.date} and ${last.date} (${last.formattedValue}).`
          );
        }
      }
    }
  });

  actions.push("Export to Power BI Desktop (.pbip) to enable interactive slicers and deeper drill-throughs.");
  actions.push("Share dashboard insights or publish the Power BI project to Power BI Service.");

  return {
    mode: "deterministic",
    summary: dashboard.summaryText,
    keyFindings: findings.slice(0, 5),
    recommendedActions: actions,
  };
}

/**
 * Queries AI or falls back gracefully to deterministic intelligence.
 */
export async function queryDashboardIntelligence(
  dashboard: GeneratedDashboard,
  quality: DataQualityReport,
  userQuery?: string
): Promise<AiInsightResponse> {
  const apiKey = process.env.TOGETHER_API_KEY;

  if (!apiKey) {
    const fallback = generateDeterministicInsights(dashboard, quality);
    if (userQuery) {
      // Deterministic search matching against dashboard kpis and visuals
      const lowerQ = userQuery.toLowerCase();
      const matchedKpi = dashboard.kpis.find((k) => lowerQ.includes(k.title.toLowerCase()));
      const matchedVisual = dashboard.visuals.find((v) => lowerQ.includes(v.title.toLowerCase()));

      if (matchedKpi) {
        fallback.answer = `Based on your calculated data, ${matchedKpi.title} is currently ${matchedKpi.formattedValue} (${matchedKpi.subtitle || "direct measure"}).`;
      } else if (matchedVisual) {
        fallback.answer = `For '${matchedVisual.title}', the leading item is '${matchedVisual.data[0]?.label}' with a value of ${matchedVisual.data[0]?.formattedValue}.`;
      } else {
        fallback.answer = `Offline Analysis (AI key not configured): ${dashboard.summaryText}`;
      }
    }
    return fallback;
  }

  // AI-assisted path via Together AI
  try {
    const together = new Together({ apiKey });

    // Build privacy-safe summary context (NO raw individual rows or PII!)
    const contextPrompt = `
You are MetricWeave AI's Senior Analytics Copilot.
Analyze this pre-aggregated dashboard metadata and computed KPIs:
Dashboard Title: ${dashboard.title}
Data Domain: ${dashboard.templateId}
Total Rows: ${quality.totalRows}
Completeness: ${quality.overallCompleteness}%
KPIs: ${JSON.stringify(dashboard.kpis.map((k) => ({ name: k.title, value: k.formattedValue, subtitle: k.subtitle })))}
Visuals: ${JSON.stringify(
      dashboard.visuals.map((v) => ({
        title: v.title,
        topEntries: Array.isArray(v.data) ? v.data.slice(0, 3) : [],
      }))
    )}

${userQuery ? `User Question: "${userQuery}"` : "Provide executive findings and actionable next steps."}

Respond in concise JSON format with keys:
{
  "summary": "1-2 sentence executive briefing",
  "keyFindings": ["3 distinct evidence-based bullet points"],
  "recommendedActions": ["2 actionable recommendations"],
  "answer": "Direct answer to the user question if provided"
}
`;

    const completion = await together.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional business intelligence copilot. Only respond with valid JSON.",
        },
        {
          role: "user",
          content: contextPrompt,
        },
      ],
      temperature: 0.2,
      max_tokens: 600,
    });

    const content = completion.choices[0].message?.content || "";
    const cleanJson = content.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanJson);

    return {
      mode: "ai",
      provider: "Together AI (Llama 3.1 8B)",
      summary: parsed.summary || dashboard.summaryText,
      keyFindings: parsed.keyFindings || [],
      recommendedActions: parsed.recommendedActions || [],
      answer: parsed.answer,
    };
  } catch (err) {
    console.warn("AI generation failed, falling back to deterministic insights:", err);
    return generateDeterministicInsights(dashboard, quality);
  }
}
