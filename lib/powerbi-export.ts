import JSZip from "jszip";
import Papa from "papaparse";
import { ParsedDataset, ColumnProfile } from "./data-profiler";
import { GeneratedDashboard, VisualConfig } from "./templates";

function getUuid(): string {
  if (typeof globalThis !== "undefined" && globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface PowerBiExportResult {
  zipBuffer: Uint8Array;
  zipBlob?: Blob;
  fileName: string;
  pbipFileName: string;
  daxScript: string;
  powerQueryM: string;
  modelBim: string;
  cleanedCsv: string;
}

/**
 * Maps inferred data types to Microsoft Tabular Model / DAX data types.
 */
function mapToPowerBiDataType(dataType: string): string {
  switch (dataType) {
    case "integer":
      return "int64";
    case "decimal":
    case "currency":
      return "double";
    case "date":
    case "datetime":
      return "dateTime";
    case "boolean":
      return "boolean";
    case "categorical":
    case "text":
    case "identifier":
    default:
      return "string";
  }
}

/**
 * Maps inferred data types to Power Query (M) types.
 */
function mapToPowerQueryType(dataType: string): string {
  switch (dataType) {
    case "integer":
      return "Int64.Type";
    case "decimal":
    case "currency":
      return "type number";
    case "date":
      return "type date";
    case "datetime":
      return "type datetime";
    case "boolean":
      return "type logical";
    case "categorical":
    case "text":
    case "identifier":
    default:
      return "type text";
  }
}

/**
 * Derives the measure name and aggregation expression for a visual chart.
 */
export function getVisualMeasureDetails(
  vis: VisualConfig,
  columns: ColumnProfile[]
): { name: string; expression: string; formatString: string } {
  const col = vis.measureCol
    ? columns.find((c) => c.name === vis.measureCol || c.originalName === vis.measureCol)
    : undefined;

  if (col) {
    const orig = col.originalName;
    const isCurrency = col.dataType === "currency" || /price|cost|revenue|sales|spend|salary|amount|val/i.test(orig);
    const formatString = isCurrency ? "\\$#,0.00;(\\$#,0.00);\\$#,0.00" : "#,0";

    if (vis.aggregationFn === "avg") {
      return {
        name: `Average ${orig}`,
        expression: `AVERAGE('Data'[${orig}])`,
        formatString,
      };
    } else if (vis.aggregationFn === "count") {
      return {
        name: `Count of ${orig}`,
        expression: `COUNT('Data'[${orig}])`,
        formatString: "#,0",
      };
    } else {
      return {
        name: `Total ${orig}`,
        expression: `SUM('Data'[${orig}])`,
        formatString,
      };
    }
  }

  return {
    name: "Total Records",
    expression: "COUNTROWS('Data')",
    formatString: "#,0",
  };
}

/**
 * Generates DAX measures from the dashboard KPIs and visuals.
 */
export function generateDaxMeasures(
  dashboard: GeneratedDashboard,
  columns: ColumnProfile[]
): { name: string; expression: string; formatString?: string }[] {
  const measures: { name: string; expression: string; formatString?: string }[] = [];

  // Default record count
  measures.push({
    name: "Total Records",
    expression: "COUNTROWS('Data')",
    formatString: "#,0",
  });

  const findCol = (regex: RegExp, role?: string) =>
    columns.find((c) => (!role || c.role === role) && (regex.test(c.name) || regex.test(c.originalName)));

  const revenueCol = findCol(/revenue|sales|amount|price|total/i, "metric") || columns.find((c) => c.role === "metric");
  const orderIdCol = findCol(/order.*id|invoice|transaction/i, "identifier") || columns.find((c) => c.role === "identifier");
  const qtyCol = findCol(/quantity|units|volume|qty/i, "metric");
  const expenseCol = findCol(/expense|cost|cogs|spend|outflow/i, "metric");
  const salaryCol = findCol(/salary|compensation|pay|wage/i, "metric");
  const spendCol = findCol(/ad.*spend|marketing.*spend|spend/i, "metric");
  const convCol = findCol(/conversion|leads|acquisition/i, "metric");
  const deptCol = findCol(/department|dept|division/i, "dimension");

  if (revenueCol) {
    measures.push({
      name: "Total Revenue",
      expression: `SUM('Data'[${revenueCol.originalName}])`,
      formatString: "\\$#,0.00;(\\$#,0.00);\\$#,0.00",
    });
  }

  if (orderIdCol) {
    measures.push({
      name: "Total Orders",
      expression: `DISTINCTCOUNT('Data'[${orderIdCol.originalName}])`,
      formatString: "#,0",
    });
  } else {
    measures.push({
      name: "Total Orders",
      expression: "COUNTROWS('Data')",
      formatString: "#,0",
    });
  }

  measures.push({
    name: "Average Order Value",
    expression: "DIVIDE([Total Revenue], [Total Orders], 0)",
    formatString: "\\$#,0.00;(\\$#,0.00);\\$#,0.00",
  });

  if (qtyCol) {
    measures.push({
      name: "Units Sold",
      expression: `SUM('Data'[${qtyCol.originalName}])`,
      formatString: "#,0",
    });
  }

  if (expenseCol) {
    measures.push({
      name: "Total Expenses",
      expression: `SUM('Data'[${expenseCol.originalName}])`,
      formatString: "\\$#,0.00;(\\$#,0.00);\\$#,0.00",
    });
    measures.push({
      name: "Net Profit",
      expression: "[Total Revenue] - [Total Expenses]",
      formatString: "\\$#,0.00;(\\$#,0.00);\\$#,0.00",
    });
    measures.push({
      name: "Profit Margin %",
      expression: "DIVIDE([Net Profit], [Total Revenue], 0)",
      formatString: "0.0%",
    });
  }

  if (salaryCol) {
    measures.push({
      name: "Average Compensation",
      expression: `AVERAGE('Data'[${salaryCol.originalName}])`,
      formatString: "\\$#,0.00;(\\$#,0.00);\\$#,0.00",
    });
  }

  if (deptCol) {
    measures.push({
      name: "Active Departments",
      expression: `DISTINCTCOUNT('Data'[${deptCol.originalName}])`,
      formatString: "#,0",
    });
  }

  if (spendCol) {
    measures.push({
      name: "Total Ad Spend",
      expression: `SUM('Data'[${spendCol.originalName}])`,
      formatString: "\\$#,0.00;(\\$#,0.00);\\$#,0.00",
    });
  }

  if (convCol) {
    measures.push({
      name: "Total Conversions",
      expression: `SUM('Data'[${convCol.originalName}])`,
      formatString: "#,0",
    });
  }

  // Ensure each KPI in dashboard.kpis has a measure whose name EXACTLY matches kpi.title
  dashboard.kpis.forEach((kpi) => {
    let expr = "COUNTROWS('Data')";
    let fmt = "#,0";

    if (kpi.id === "total_revenue") {
      expr = revenueCol ? `SUM('Data'[${revenueCol.originalName}])` : "COUNTROWS('Data')";
      fmt = "\\$#,0.00;(\\$#,0.00);\\$#,0.00";
    } else if (kpi.id === "total_orders") {
      expr = orderIdCol ? `DISTINCTCOUNT('Data'[${orderIdCol.originalName}])` : "COUNTROWS('Data')";
      fmt = "#,0";
    } else if (kpi.id === "average_order_value") {
      expr = "DIVIDE([Total Revenue], [Total Orders], 0)";
      fmt = "\\$#,0.00;(\\$#,0.00);\\$#,0.00";
    } else if (kpi.id === "units_sold") {
      expr = qtyCol ? `SUM('Data'[${qtyCol.originalName}])` : "COUNTROWS('Data')";
      fmt = "#,0";
    } else if (kpi.id === "total_expense") {
      expr = expenseCol ? `SUM('Data'[${expenseCol.originalName}])` : "COUNTROWS('Data')";
      fmt = "\\$#,0.00;(\\$#,0.00);\\$#,0.00";
    } else if (kpi.id === "net_profit") {
      expr = "[Total Revenue] - [Total Expenses]";
      fmt = "\\$#,0.00;(\\$#,0.00);\\$#,0.00";
    } else if (kpi.id === "profit_margin") {
      expr = "DIVIDE([Net Profit], [Total Revenue], 0)";
      fmt = "0.0%";
    } else if (kpi.id === "headcount" || kpi.id === "total_records") {
      expr = "COUNTROWS('Data')";
      fmt = "#,0";
    } else if (kpi.id === "avg_salary") {
      expr = salaryCol ? `AVERAGE('Data'[${salaryCol.originalName}])` : "COUNTROWS('Data')";
      fmt = "\\$#,0.00;(\\$#,0.00);\\$#,0.00";
    } else if (kpi.id === "departments_count") {
      expr = deptCol ? `DISTINCTCOUNT('Data'[${deptCol.originalName}])` : "COUNTROWS('Data')";
      fmt = "#,0";
    } else if (kpi.id === "ad_spend") {
      expr = spendCol ? `SUM('Data'[${spendCol.originalName}])` : "COUNTROWS('Data')";
      fmt = "\\$#,0.00;(\\$#,0.00);\\$#,0.00";
    } else if (kpi.id === "conversions") {
      expr = convCol ? `SUM('Data'[${convCol.originalName}])` : "COUNTROWS('Data')";
      fmt = "#,0";
    } else if (kpi.id === "cpa") {
      expr = "DIVIDE([Total Ad Spend], [Total Conversions], 0)";
      fmt = "\\$#,0.00;(\\$#,0.00);\\$#,0.00";
    } else {
      const metricCol = columns.find((c) => c.role === "metric");
      if (metricCol) {
        expr = `SUM('Data'[${metricCol.originalName}])`;
        fmt = metricCol.dataType === "currency" ? "\\$#,0.00;(\\$#,0.00);\\$#,0.00" : "#,0";
      }
    }

    measures.push({
      name: kpi.title,
      expression: expr,
      formatString: fmt,
    });
  });

  // Ensure each visual in dashboard.visuals has its measure defined
  dashboard.visuals.forEach((vis) => {
    const details = getVisualMeasureDetails(vis, columns);
    measures.push(details);
  });

  // Deduplicate measures
  const seen = new Set<string>();
  return measures.filter((m) => {
    if (seen.has(m.name)) return false;
    seen.add(m.name);
    return true;
  });
}

/**
 * Escapes raw CSV text for embedding inside Power Query M script.
 */
function escapeForPowerQuery(raw: string): string {
  return raw
    .replace(/#\(/g, "#(#(")
    .replace(/"/g, '""')
    .replace(/\r\n/g, "#(lf)")
    .replace(/\n/g, "#(lf)")
    .replace(/\r/g, "#(lf)");
}

/**
 * Generates Power Query (M) transformation script.
 * Embeds CSV data directly into the M query partition so Power BI Desktop loads
 * all records immediately upon opening with zero external file-path dependency.
 */
export function generatePowerQueryM(columns: ColumnProfile[], csvContent?: string): string {
  const typeTransforms = columns
    .map((c) => `{"${c.originalName}", ${mapToPowerQueryType(c.dataType)}}`)
    .join(", ");

  let rawCsvText = csvContent;
  if (!rawCsvText) {
    const headerLine = columns.map((c) => c.originalName).join(",");
    const sampleLine = columns.map((c) => (c.dataType === "integer" || c.dataType === "decimal" ? "0" : "Sample")).join(",");
    rawCsvText = `${headerLine}\n${sampleLine}`;
  }

  // Chunk the escaped CSV row-by-row so escape codes are never sliced in half
  const rows = rawCsvText.split(/\r?\n/).filter((r) => r.trim().length > 0);
  const chunkExpressions = rows.map((row, idx) => {
    const escapedRow = row
      .replace(/#\(/g, "#(#(")
      .replace(/"/g, '""');
    const comma = idx < rows.length - 1 ? "," : "";
    return `        "${escapedRow}#(lf)"${comma}`;
  });

  return `let
    // MetricWeave AI — Power Query (M) Transformation
    // Developed by: Kandala Guru Balaji
    // Dataset embedded inline for instant opening in Power BI Desktop
    RawData = Text.Combine({
${chunkExpressions.join("\n")}
    }),
    Source = Csv.Document(RawData, [Delimiter=",", Encoding=65001, QuoteStyle=QuoteStyle.Csv]),
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers", {${typeTransforms}}, "en-US")
in
    #"Changed Type"`;
}

/**
 * Builds the Microsoft Tabular Object Model (`model.bim`) definition.
 */
export function generateModelBim(
  dashboard: GeneratedDashboard,
  columns: ColumnProfile[],
  datasetName: string,
  csvContent?: string
): any {
  const daxMeasures = generateDaxMeasures(dashboard, columns);
  const mCode = generatePowerQueryM(columns, csvContent);

  return {
    compatibilityLevel: 1567,
    model: {
      culture: "en-US",
      defaultPowerBIDataSourceVersion: "powerBI_V3",
      sourceQueryCulture: "en-US",
      dataAccessOptions: {
        legacyRedirects: true,
        returnErrorValuesAsNull: true,
      },
      tables: [
        {
          name: "Data",
          lineageTag: getUuid(),
          columns: columns.map((col) => ({
            name: col.originalName,
            dataType: mapToPowerBiDataType(col.dataType),
            sourceColumn: col.originalName,
            lineageTag: getUuid(),
            summarizeBy: col.role === "metric" ? "sum" : "none",
            isNullable: true,
          })),
          partitions: [
            {
              name: "Data-Partition",
              mode: "import",
              source: {
                type: "m",
                expression: mCode.split(/\r?\n/),
              },
            },
          ],
          measures: daxMeasures.map((m) => ({
            name: m.name,
            expression: m.expression,
            formatString: m.formatString,
            lineageTag: getUuid(),
          })),
        },
      ],
      annotations: [
        {
          name: "Generator",
          value: "MetricWeave AI - Developed by Kandala Guru Balaji",
        },
        {
          name: "GeneratedAt",
          value: new Date().toISOString(),
        },
      ],
    },
  };
}

/**
 * Generates the Power BI `report.json` layout with fully bound prototype queries.
 * Every visual container includes prototypeQuery (Version 2) mapping projections to
 * table entities so Power BI Desktop renders charts immediately without empty placeholders.
 */
export function generateReportJson(dashboard: GeneratedDashboard, columns: ColumnProfile[] = []): any {
  const visualContainers: any[] = [];
  const cardHeight = 105;
  const cardGap = 16;
  const numCards = Math.max(dashboard.kpis.length, 1);
  const cardWidth = Math.min(295, Math.floor((1240 - (numCards - 1) * cardGap) / numCards));

  // 1. Header Banner Textbox
  visualContainers.push({
    x: 20,
    y: 15,
    z: 1,
    width: 1240,
    height: 45,
    config: JSON.stringify({
      name: "HeaderBanner",
      layouts: [
        {
          id: 0,
          position: { x: 20, y: 15, z: 1, width: 1240, height: 45 },
        },
      ],
      singleVisual: {
        visualType: "textbox",
        objects: {
          general: [
            {
              properties: {
                paragraphs: [
                  {
                    textRuns: [
                      {
                        value: `${dashboard.title} - MetricWeave AI`,
                        textStyle: { fontFamily: "Segoe UI", fontSize: "18pt", fontWeight: "Bold", color: "#1E293B" },
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      },
    }),
  });

  // 2. KPI Cards row with bound prototypeQuery
  dashboard.kpis.forEach((kpi, index) => {
    const xPos = 20 + index * (cardWidth + cardGap);
    const measureName = kpi.title;

    visualContainers.push({
      x: xPos,
      y: 70,
      z: 2 + index,
      width: cardWidth,
      height: cardHeight,
      config: JSON.stringify({
        name: `KpiCard_${kpi.id || index}`,
        layouts: [
          {
            id: 0,
            position: { x: xPos, y: 70, z: 2 + index, width: cardWidth, height: cardHeight },
          },
        ],
        singleVisual: {
          visualType: "card",
          projections: {
            Values: [{ queryRef: `Data.${measureName}` }],
          },
          prototypeQuery: {
            Version: 2,
            From: [{ Name: "d", Entity: "Data", Type: 0 }],
            Select: [
              {
                Measure: {
                  Expression: { SourceRef: { Source: "d" } },
                  Property: measureName,
                },
                Name: `Data.${measureName}`,
                NativeReferenceName: measureName,
              },
            ],
          },
          objects: {
            title: [
              {
                properties: {
                  show: { expr: { Literal: { Value: "true" } } },
                  text: { expr: { Literal: { Value: `'${kpi.title.replace(/'/g, "''")}'` } } },
                },
              },
            ],
          },
        },
      }),
    });
  });

  // 3. Main Chart Visuals Grid (2 columns)
  const chartWidth = 605;
  const chartHeight = 245;
  const gapX = 30;
  const gapY = 18;
  const startY = 70 + cardHeight + 15; // 190

  dashboard.visuals.forEach((vis, idx) => {
    const colIdx = idx % 2;
    const rowIdx = Math.floor(idx / 2);
    const xPos = 20 + colIdx * (chartWidth + gapX);
    const curY = startY + rowIdx * (chartHeight + gapY);

    // Map to valid built-in Power BI Desktop visual types
    let visualType = "clusteredColumnChart";
    if (vis.type === "line") visualType = "lineChart";
    else if (vis.type === "area") visualType = "areaChart";
    else if (vis.type === "donut") visualType = "donutChart";
    else if (vis.type === "horizontal_bar") visualType = "clusteredBarChart";
    else if (vis.type === "bar") visualType = "clusteredColumnChart";
    else if (vis.type === "table") visualType = "tableEx";

    // Find category / dimension column
    const catCol = columns.find(
      (c) => c.name === (vis.dimensionCol || vis.dateCol) || c.originalName === (vis.dimensionCol || vis.dateCol)
    );
    const catProp = catCol ? catCol.originalName : (vis.dimensionCol || vis.dateCol || "Category");

    // Find measure details
    const measDetails = getVisualMeasureDetails(vis, columns);
    const measureName = measDetails.name;

    const querySelects: any[] = [
      {
        Column: {
          Expression: { SourceRef: { Source: "d" } },
          Property: catProp,
        },
        Name: `Data.${catProp}`,
        NativeReferenceName: catProp,
      },
      {
        Measure: {
          Expression: { SourceRef: { Source: "d" } },
          Property: measureName,
        },
        Name: `Data.${measureName}`,
        NativeReferenceName: measureName,
      },
    ];

    const orderByList: any[] = [
      {
        Direction: vis.dateCol ? 1 : 2, // Ascending for dates, descending for metric values
        Expression: vis.dateCol
          ? {
              Column: {
                Expression: { SourceRef: { Source: "d" } },
                Property: catProp,
              },
            }
          : {
              Measure: {
                Expression: { SourceRef: { Source: "d" } },
                Property: measureName,
              },
            },
      },
    ];

    visualContainers.push({
      x: xPos,
      y: curY,
      z: 10 + idx,
      width: chartWidth,
      height: chartHeight,
      config: JSON.stringify({
        name: `Visual_${vis.id}`,
        layouts: [
          {
            id: 0,
            position: { x: xPos, y: curY, z: 10 + idx, width: chartWidth, height: chartHeight },
          },
        ],
        singleVisual: {
          visualType,
          projections:
            visualType === "tableEx"
              ? {
                  Values: querySelects.map((q) => ({ queryRef: q.Name })),
                }
              : {
                  Category: [{ queryRef: `Data.${catProp}`, active: true }],
                  Y: [{ queryRef: `Data.${measureName}` }],
                },
          prototypeQuery: {
            Version: 2,
            From: [{ Name: "d", Entity: "Data", Type: 0 }],
            Select: querySelects,
            OrderBy: orderByList,
          },
          objects: {
            title: [
              {
                properties: {
                  show: { expr: { Literal: { Value: "true" } } },
                  text: { expr: { Literal: { Value: `'${vis.title.replace(/'/g, "''")}'` } } },
                },
              },
            ],
          },
        },
      }),
    });
  });

  const totalRows = Math.ceil(dashboard.visuals.length / 2);
  const sectionHeight = Math.max(720, startY + totalRows * (chartHeight + gapY) + 40);

  return {
    config: JSON.stringify({
      version: "5.50",
      themeCollection: { baseTheme: { name: "CY24SU08", version: "5.50", type: 2 } },
      activeSectionIndex: 0,
    }),
    layoutOptimization: 0,
    sections: [
      {
        name: "ReportSection_MetricWeave",
        displayName: dashboard.title,
        filters: "[]",
        ordinal: 0,
        visualContainers,
        width: 1280,
        height: sectionHeight,
      },
    ],
  };
}

/**
 * Creates the complete Power BI Desktop Project (.pbip) ZIP bundle.
 */
export async function createPowerBiZipBundle(
  datasetName: string,
  dashboard: GeneratedDashboard,
  dataset: ParsedDataset
): Promise<PowerBiExportResult> {
  const safeName = datasetName
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_") || "MetricWeave_Report";

  const zip = new JSZip();

  // 1. Root .pbip descriptor
  const pbipDescriptor = {
    version: "1.0",
    artifacts: [
      {
        report: {
          path: `${safeName}.Report`,
        },
      },
    ],
    settings: {
      enableAutoRecovery: true,
    },
  };
  zip.file(`${safeName}.pbip`, JSON.stringify(pbipDescriptor, null, 2));

  // 2. Report folder
  const pbirDefinition = {
    version: "1.0",
    datasetReference: {
      byPath: {
        path: `../${safeName}.SemanticModel`,
      },
      byConnection: null,
    },
  };
  zip.file(`${safeName}.Report/definition.pbir`, JSON.stringify(pbirDefinition, null, 2));

  const reportJson = generateReportJson(dashboard, dataset.qualityReport.columns);
  zip.file(`${safeName}.Report/report.json`, JSON.stringify(reportJson, null, 2));

  // 3. Cleaned CSV file
  const cleanedCsv = Papa.unparse({
    fields: dataset.headers,
    data: dataset.rawRows,
  });
  zip.file("data/dataset.csv", cleanedCsv);

  // 4. Semantic Model folder (embedded dataset for zero-configuration, instant load)
  const pbismDefinition = {
    version: "1.0",
  };
  zip.file(`${safeName}.SemanticModel/definition.pbism`, JSON.stringify(pbismDefinition, null, 2));

  const modelBim = generateModelBim(dashboard, dataset.qualityReport.columns, safeName, cleanedCsv);
  const modelBimString = JSON.stringify(modelBim, null, 2);
  zip.file(`${safeName}.SemanticModel/model.bim`, modelBimString);

  // 5. Scripts and DAX documentation
  const daxMeasures = generateDaxMeasures(dashboard, dataset.qualityReport.columns);
  const daxScript = [
    `// ==============================================================`,
    `// MetricWeave AI — Generated DAX Formulas`,
    `// Dataset: ${safeName}`,
    `// Developed by: Kandala Guru Balaji`,
    `// ==============================================================\n`,
    ...daxMeasures.map((m) => `${m.name} =\n    ${m.expression}\n`),
  ].join("\n");
  zip.file("measures.dax", daxScript);

  const powerQueryM = generatePowerQueryM(dataset.qualityReport.columns, cleanedCsv);
  zip.file("transform.m", powerQueryM);

  // 6. 1-Click Windows Launcher Script
  const launcherBat = `@echo off
setlocal enabledelayedexpansion
title MetricWeave AI - Power BI Launcher
echo ==============================================================
echo  MetricWeave AI - Power BI Project Launcher
echo  Developed by: Kandala Guru Balaji
echo ==============================================================
echo.

set SCRIPT_DIR=%~dp0

:: Check if already running from an extracted folder with sibling folders present
if exist "%SCRIPT_DIR%${safeName}.Report\\definition.pbir" (
    echo [OK] Power BI Project artifacts verified.
    echo Launching Microsoft Power BI Desktop...
    echo.
    echo [IMPORTANT] Once Power BI Desktop opens, click "Refresh" on the Home ribbon to populate all charts!
    start "" "%SCRIPT_DIR%${safeName}.pbip"
    exit /b 0
)

:: If run from Windows temporary unextracted ZIP directory
echo [NOTICE] Windows opened this file from inside a temporary unextracted ZIP archive.
echo Power BI Desktop requires the sibling .Report and .SemanticModel folders to exist.
echo.
echo Attempting automatic extraction of your project to Downloads folder...

set ZIP_SRC=%USERPROFILE%\\Downloads\\${safeName}_PowerBI_Project.zip
set DEST_DIR=%USERPROFILE%\\Downloads\\${safeName}_PowerBI

if exist "!ZIP_SRC!" (
    powershell -NoProfile -Command "Expand-Archive -LiteralPath '!ZIP_SRC!' -DestinationPath '!DEST_DIR!' -Force"
    if exist "!DEST_DIR!\\${safeName}.Report\\definition.pbir" (
        echo [SUCCESS] Project extracted to: !DEST_DIR!
        echo Launching Microsoft Power BI Desktop...
        echo.
        echo [IMPORTANT] Once Power BI Desktop opens, click "Refresh" on the Home ribbon to populate all charts!
        start "" "!DEST_DIR!\\${safeName}.pbip"
        exit /b 0
    )
)

echo.
echo [MANUAL STEP] To open this project:
echo 1. Right-click "${safeName}_PowerBI_Project.zip" in your Downloads folder.
echo 2. Choose "Extract All..." and click Extract.
echo 3. Open the extracted folder, double-click "${safeName}.pbip", and click "Refresh"!
echo.
pause
`;
  zip.file("OPEN_IN_POWER_BI.cmd", launcherBat);

  // 7. Comprehensive README instructions with both Automated and Manual Import workflows
  const readmeContent = `# ${safeName} — Power BI Desktop Project (.pbip)
Generated by **MetricWeave AI** (Developed by Kandala Guru Balaji)

## Method 1: Instant 1-Click Launch (Recommended)

1. **Extract this entire ZIP archive**:
   - Right-click the downloaded **\`${safeName}_PowerBI_Project.zip\`** file in File Explorer.
   - Click **Extract All...** and confirm extraction to a local folder.
   *(Note: Do not double-click files directly from inside the unextracted ZIP viewer, as Windows does not unpack the required subfolders into memory).*

2. **Open the Report & Load Data**:
   - Double-click **\`${safeName}.pbip\`** inside the extracted folder (or run **\`OPEN_IN_POWER_BI.cmd\`**).
   - In Power BI Desktop, click **Home → Refresh** (under the Data section on the top ribbon) to load all table rows into the charts. All visual containers, live KPI cards, and charts will immediately render!

---

## Method 2: Manual Import & Edit in Power BI Desktop

If you prefer to import the data into an existing report or modify the queries manually:

1. **Import the Dataset**:
   - Launch Microsoft Power BI Desktop.
   - Click **Home -> Get Data -> Text/CSV** and select **\`data/dataset.csv\`**.
   - Click **Load** or **Transform Data**.

2. **Apply Power Query Transformations**:
   - In the Power Query Editor, click **Home -> Advanced Editor**.
   - Paste the transformation script from **\`transform.m\`** and click **Done**.

3. **Add DAX Formulas**:
   - Open **\`measures.dax\`** in any text editor.
   - In Power BI Desktop's **Modeling** or **Table View**, click **New Measure**.
   - Paste the formula (e.g. \`Total Revenue\`, \`Total Orders\`, \`Average Order Value\`).

4. **Custom Visualizations**:
   - Build or customize charts in the Visualizations pane using the fields from the \`Data\` table.

---
*MetricWeave AI © 2026 | Developed by Kandala Guru Balaji*
`;
  zip.file("README_POWER_BI.md", readmeContent);


  const uint8 = await zip.generateAsync({ type: "uint8array" });
  let blob: Blob | undefined;
  if (typeof Blob !== "undefined") {
    blob = new Blob([uint8], { type: "application/zip" });
  }

  return {
    zipBuffer: uint8,
    zipBlob: blob,
    fileName: `${safeName}_PowerBI_Project.zip`,
    pbipFileName: `${safeName}.pbip`,
    daxScript,
    powerQueryM,
    modelBim: modelBimString,
    cleanedCsv,
  };
}
