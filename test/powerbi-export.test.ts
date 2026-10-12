import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { parseAndProfileData } from "../lib/data-profiler";
import { generateDashboard } from "../lib/templates";
import {
  createPowerBiZipBundle,
  generateDaxMeasures,
  generatePowerQueryM,
  generateModelBim,
  generateReportJson,
} from "../lib/powerbi-export";
import { SAMPLE_DATASETS } from "../lib/sample-datasets";

describe("Microsoft Power BI Project (PBIP) Export", () => {
  const sample = SAMPLE_DATASETS[0]; // Sales dataset
  const parsed = parseAndProfileData(sample.csvContent, "csv");
  const dashboard = generateDashboard(parsed, "sales");

  it("generates correct DAX measures from computed dashboard", () => {
    const daxMeasures = generateDaxMeasures(dashboard, parsed.qualityReport.columns);
    expect(daxMeasures.length).toBeGreaterThan(0);
    expect(daxMeasures.some((m) => m.name === "Total Records")).toBe(true);
    expect(daxMeasures.some((m) => m.name.includes("Revenue"))).toBe(true);

    daxMeasures.forEach((m) => {
      expect(m.expression).toBeDefined();
      expect(m.expression.length).toBeGreaterThan(0);
    });
  });

  it("generates valid Power Query (M) script without Extension.Contents", () => {
    const mScript = generatePowerQueryM(parsed.qualityReport.columns, sample.csvContent);
    expect(mScript).toContain("Csv.Document");
    expect(mScript).toContain("Table.PromoteHeaders");
    expect(mScript).toContain("Table.TransformColumnTypes");
    expect(mScript).toContain("Text.Combine");
    expect(mScript).not.toContain("Extension.Contents");
  });

  it("generates valid Microsoft Tabular Object Model (model.bim)", () => {
    const bim = generateModelBim(dashboard, parsed.qualityReport.columns, "Sales_Report", sample.csvContent);
    expect(bim.compatibilityLevel).toBe(1567);
    expect(bim.model).toBeDefined();
    expect(bim.model.tables.length).toBe(1);
    expect(bim.model.tables[0].name).toBe("Data");
    expect(bim.model.tables[0].columns.length).toBe(parsed.headers.length);
    expect(bim.model.tables[0].measures.length).toBeGreaterThan(0);
    expect(bim.model.tables[0].partitions.length).toBe(1);

    // Verify partition M expression does not have Extension.Contents
    const partitionExpr = bim.model.tables[0].partitions[0].source.expression.join("\n");
    expect(partitionExpr).not.toContain("Extension.Contents");
    expect(partitionExpr).toContain("Csv.Document");
  });

  it("generates valid report.json layout with bound prototypeQuery on all visual containers", () => {
    const reportJson = generateReportJson(dashboard, parsed.qualityReport.columns);
    expect(reportJson.sections).toBeDefined();
    expect(reportJson.sections.length).toBe(1);

    const visualContainers = reportJson.sections[0].visualContainers;
    expect(visualContainers.length).toBeGreaterThanOrEqual(5); // 1 header + 4 KPIs + 4 charts

    // Check each non-textbox visual has a prototypeQuery
    const bim = generateModelBim(dashboard, parsed.qualityReport.columns, "Sales_Report", sample.csvContent);
    const bimMeasureNames = new Set(bim.model.tables[0].measures.map((m: any) => m.name));
    const bimColumnNames = new Set(bim.model.tables[0].columns.map((c: any) => c.name));

    visualContainers.forEach((vc: any) => {
      const cfg = JSON.parse(vc.config);
      const singleVisual = cfg.singleVisual;

      if (singleVisual.visualType !== "textbox") {
        // Must have prototypeQuery
        expect(singleVisual.prototypeQuery).toBeDefined();
        expect(singleVisual.prototypeQuery.Version).toBe(2);
        expect(singleVisual.prototypeQuery.From[0].Entity).toBe("Data");
        expect(singleVisual.prototypeQuery.Select.length).toBeGreaterThan(0);

        // Visual types must be valid Power BI built-ins
        expect([
          "card",
          "clusteredColumnChart",
          "clusteredBarChart",
          "lineChart",
          "areaChart",
          "donutChart",
          "tableEx",
        ]).toContain(singleVisual.visualType);

        // Every measure referenced in Select must exist in bim.measures
        singleVisual.prototypeQuery.Select.forEach((sel: any) => {
          if (sel.Measure) {
            expect(bimMeasureNames.has(sel.Measure.Property)).toBe(true);
          }
          if (sel.Column) {
            expect(bimColumnNames.has(sel.Column.Property)).toBe(true);
          }
        });
      }
    });
  });

  it("packages a full .pbip ZIP project archive with all necessary files", async () => {
    const exportResult = await createPowerBiZipBundle("Retail_Sales", dashboard, parsed);

    expect(exportResult.fileName).toBe("Retail_Sales_PowerBI_Project.zip");
    expect(exportResult.zipBuffer).toBeDefined();
    expect(exportResult.zipBuffer.length).toBeGreaterThan(500);

    // Unpack with JSZip and verify exact files
    const zip = await JSZip.loadAsync(exportResult.zipBuffer);
    const files = Object.keys(zip.files);

    expect(files).toContain("Retail_Sales.pbip");
    expect(files).toContain("Retail_Sales.Report/definition.pbir");
    expect(files).toContain("Retail_Sales.Report/report.json");
    expect(files).toContain("Retail_Sales.SemanticModel/definition.pbism");
    expect(files).toContain("Retail_Sales.SemanticModel/model.bim");
    expect(files).toContain("data/dataset.csv");
    expect(files).toContain("measures.dax");
    expect(files).toContain("transform.m");
    expect(files).toContain("README_POWER_BI.md");

    // Verify .pbip content
    const pbipText = await zip.file("Retail_Sales.pbip")?.async("string");
    const pbipJson = JSON.parse(pbipText || "{}");
    expect(pbipJson.version).toBe("1.0");
    expect(pbipJson.artifacts[0].report.path).toBe("Retail_Sales.Report");

    // Verify report.json inside the zip has prototypeQueries
    const reportText = await zip.file("Retail_Sales.Report/report.json")?.async("string");
    const reportObj = JSON.parse(reportText || "{}");
    const containers = reportObj.sections[0].visualContainers;
    const cards = containers.filter((c: any) => c.config.includes('"visualType":"card"'));
    expect(cards.length).toBe(4);
    cards.forEach((c: any) => {
      expect(c.config).toContain('"prototypeQuery"');
    });

    // Verify dataset.csv has rows
    const csvContent = await zip.file("data/dataset.csv")?.async("string");
    expect(csvContent).toContain("ORD-1001");
  });

  it("resolves project by name and by sample ID in getProject", async () => {
    const { getProject, saveProject } = await import("../lib/project-store");
    
    // Test resolving sample dataset by id or domain
    const sampleProj = await getProject("sample-sales");
    expect(sampleProj).not.toBeNull();
    expect(sampleProj?.name).toContain("Sales");

    // Test saving and resolving by project name
    const saved = await saveProject({
      name: "axivest_test_case",
      fileName: "axivest_test_case.csv",
      fileSize: 1000,
      inferredDomain: "finance",
      selectedTemplate: "executive",
      dataset: parsed,
      dashboard,
    });
    expect(saved.id).toBeDefined();

    // Query by exact name
    const foundByName = await getProject("axivest_test_case");
    expect(foundByName).not.toBeNull();
    expect(foundByName?.id).toBe(saved.id);
  });
});

