import { NextRequest, NextResponse } from "next/server";
import { parseAndProfileData } from "@/lib/data-profiler";
import { generateDashboard, TemplateType } from "@/lib/templates";
import { saveProject } from "@/lib/project-store";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const templateOverride = formData.get("template") as TemplateType | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided. Please attach a CSV or Excel (.xlsx) file." }, { status: 400 });
    }

    // Size limit check: 25 MB
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File exceeds maximum upload size of 25MB." }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["csv", "xlsx", "xls", "json"].includes(ext)) {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload a CSV (.csv), Excel (.xlsx/.xls), or JSON file." },
        { status: 400 }
      );
    }

    const fileType = ext === "csv" ? "csv" : ext === "json" ? "json" : "xlsx";
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Profile dataset
    const dataset = parseAndProfileData(buffer, fileType);

    // Determine initial template
    const selectedTemplate: TemplateType =
      templateOverride || (dataset.inferredDomain !== "general" ? (dataset.inferredDomain as TemplateType) : "executive");

    const dashboard = generateDashboard(dataset, selectedTemplate);

    const project = await saveProject({
      name: file.name.replace(/\.[^/.]+$/, ""),
      fileName: file.name,
      fileSize: file.size,
      inferredDomain: dataset.inferredDomain,
      selectedTemplate,
      dataset,
      dashboard,
    });

    return NextResponse.json({
      success: true,
      project,
    });
  } catch (error: any) {
    console.error("Dataset upload error:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to process uploaded dataset. Ensure file is not corrupt or empty.",
      },
      { status: 500 }
    );
  }
}
