import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/project-store";
import { createPowerBiZipBundle } from "@/lib/powerbi-export";

async function generatePowerBiResponse(project: any, format: string) {
  const exportResult = await createPowerBiZipBundle(
    project.name,
    project.dashboard,
    project.dataset
  );

  const safeName = (project.name || "MetricWeave_Report")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_") || "MetricWeave_Report";

  if (format === "pbip") {
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
    return new NextResponse(JSON.stringify(pbipDescriptor, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${safeName}.pbip"; filename*=UTF-8''${encodeURIComponent(safeName + ".pbip")}`,
        "Access-Control-Expose-Headers": "Content-Disposition",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  if (format === "bim") {
    return new NextResponse(exportResult.modelBim, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${safeName}_model.bim"; filename*=UTF-8''${encodeURIComponent(safeName + "_model.bim")}`,
        "Access-Control-Expose-Headers": "Content-Disposition",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  if (format === "dax") {
    return new NextResponse(exportResult.daxScript, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeName}_measures.dax"; filename*=UTF-8''${encodeURIComponent(safeName + "_measures.dax")}`,
        "Access-Control-Expose-Headers": "Content-Disposition",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  if (format === "m") {
    return new NextResponse(exportResult.powerQueryM, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeName}_transform.m"; filename*=UTF-8''${encodeURIComponent(safeName + "_transform.m")}`,
        "Access-Control-Expose-Headers": "Content-Disposition",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  if (format === "csv") {
    return new NextResponse(exportResult.cleanedCsv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeName}_dataset.csv"; filename*=UTF-8''${encodeURIComponent(safeName + "_dataset.csv")}`,
        "Access-Control-Expose-Headers": "Content-Disposition",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  // Default: full PBIP zip bundle
  const arrayBuffer = exportResult.zipBuffer.buffer.slice(
    exportResult.zipBuffer.byteOffset,
    exportResult.zipBuffer.byteOffset + exportResult.zipBuffer.byteLength
  );

  const zipFilename = exportResult.fileName.endsWith(".zip") ? exportResult.fileName : `${safeName}_PowerBI_Project.zip`;

  return new NextResponse(arrayBuffer as ArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipFilename}"; filename*=UTF-8''${encodeURIComponent(zipFilename)}`,
      "Access-Control-Expose-Headers": "Content-Disposition",
      "Content-Length": String(exportResult.zipBuffer.length),
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const format = searchParams.get("format") || "zip";

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId query parameter." }, { status: 400 });
  }

  const project = await getProject(projectId);
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  try {
    return await generatePowerBiResponse(project, format);
  } catch (error: any) {
    console.error("Power BI export error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate Power BI export" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { projectId, projectName, format = "zip", projectData } = body;
    let project: any = null;

    if (projectId) {
      project = await getProject(projectId);
    }
    if (!project && projectName) {
      project = await getProject(projectName);
    }
    if (!project && projectData?.dashboard && projectData?.dataset) {
      project = {
        name: projectData.name || projectName || "MetricWeave_Report",
        dashboard: projectData.dashboard,
        dataset: projectData.dataset,
      };
    }

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    return await generatePowerBiResponse(project, format);
  } catch (error: any) {
    console.error("Power BI export POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate Power BI export" }, { status: 500 });
  }
}
