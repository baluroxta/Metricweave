import { NextRequest, NextResponse } from "next/server";
import { SAMPLE_DATASETS } from "@/lib/sample-datasets";
import { parseAndProfileData } from "@/lib/data-profiler";
import { generateDashboard, TemplateType } from "@/lib/templates";
import { saveProject } from "@/lib/project-store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sampleId = searchParams.get("id");

  if (!sampleId) {
    // Return list of available sample datasets
    return NextResponse.json({
      samples: SAMPLE_DATASETS.map((s) => ({
        id: s.id,
        name: s.name,
        domain: s.domain,
        description: s.description,
      })),
    });
  }

  const sample = SAMPLE_DATASETS.find((s) => s.id === sampleId);
  if (!sample) {
    return NextResponse.json({ error: "Sample dataset not found" }, { status: 404 });
  }

  try {
    const dataset = parseAndProfileData(sample.csvContent, "csv");
    const template: TemplateType = sample.domain;
    const dashboard = generateDashboard(dataset, template);

    const project = await saveProject({
      name: sample.name,
      fileName: `${sample.id}.csv`,
      fileSize: Buffer.byteLength(sample.csvContent, "utf8"),
      inferredDomain: sample.domain,
      selectedTemplate: template,
      dataset,
      dashboard,
    });

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load sample dataset" }, { status: 500 });
  }
}
