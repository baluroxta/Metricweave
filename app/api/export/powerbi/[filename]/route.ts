import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/project-store";
import { createPowerBiZipBundle } from "@/lib/powerbi-export";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> | { filename: string } }
) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  let format = searchParams.get("format");

  const resolvedParams = await Promise.resolve(context.params);
  const paramFilename = resolvedParams?.filename || "";

  if (!format) {
    if (paramFilename.endsWith(".zip")) format = "zip";
    else if (paramFilename.endsWith(".pbip")) format = "pbip";
    else if (paramFilename.endsWith(".bim")) format = "bim";
    else if (paramFilename.endsWith(".dax")) format = "dax";
    else if (paramFilename.endsWith(".csv")) format = "csv";
    else if (paramFilename.endsWith(".m")) format = "m";
    else format = "zip";
  }

  let project: any = null;
  if (projectId) {
    project = await getProject(projectId);
  }
  if (!project && paramFilename) {
    const cleanParam = paramFilename
      .replace(/\.(zip|pbip|bim|dax|csv|m)$/i, "")
      .replace(/_(model|measures|transform|dataset|PowerBI_Project)$/i, "");
    project = await getProject(cleanParam);
  }

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  try {
    const exportResult = await createPowerBiZipBundle(
      project.name,
      project.dashboard,
      project.dataset
    );

    const safeName = project.name.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_") || "MetricWeave_Report";

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
      const filename = `${safeName}.pbip`;
      return new NextResponse(JSON.stringify(pbipDescriptor, null, 2), {
        status: 200,
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
          "Access-Control-Expose-Headers": "Content-Disposition",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    if (format === "bim") {
      const filename = `${safeName}_model.bim`;
      return new NextResponse(exportResult.modelBim, {
        status: 200,
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
          "Access-Control-Expose-Headers": "Content-Disposition",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    if (format === "dax") {
      const filename = `${safeName}_measures.dax`;
      return new NextResponse(exportResult.daxScript, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
          "Access-Control-Expose-Headers": "Content-Disposition",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    if (format === "m") {
      const filename = `${safeName}_transform.m`;
      return new NextResponse(exportResult.powerQueryM, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
          "Access-Control-Expose-Headers": "Content-Disposition",
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      });
    }

    if (format === "csv") {
      const filename = `${safeName}_dataset.csv`;
      return new NextResponse(exportResult.cleanedCsv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
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
  } catch (error: any) {
    console.error("Power BI export error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate Power BI export" }, { status: 500 });
  }
}
