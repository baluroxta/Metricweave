import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/project-store";
import { createPowerBiZipBundle } from "@/lib/powerbi-export";
import path from "path";
import fs from "fs/promises";
import os from "os";
import { exec } from "child_process";
import JSZip from "jszip";

export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    const { projectId, openExplorer = true } = body;

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const exportResult = await createPowerBiZipBundle(
      project.name,
      project.dashboard,
      project.dataset
    );

    const safeName = project.name.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_") || "MetricWeave_Report";
    const homeDir = os.homedir();
    const downloadsDir = path.join(homeDir, "Downloads");
    const desktopDirs = [
      path.join(homeDir, "Desktop"),
      path.join(homeDir, "OneDrive", "Documents", "Desktop"),
    ];

    // 1. Save ZIP file directly to Downloads
    const zipFileName = `${safeName}_PowerBI_Project.zip`;
    const targetZipPath = path.join(downloadsDir, zipFileName);
    await fs.writeFile(targetZipPath, exportResult.zipBuffer);

    // 2. Also extract directly into a ready-to-open folder in Downloads
    const extractedFolderName = `${safeName}_PowerBI`;
    const targetFolderPath = path.join(downloadsDir, extractedFolderName);
    await fs.mkdir(targetFolderPath, { recursive: true });

    const zip = await JSZip.loadAsync(exportResult.zipBuffer);
    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      const destPath = path.join(targetFolderPath, relativePath);
      if (zipEntry.dir) {
        await fs.mkdir(destPath, { recursive: true });
      } else {
        const fileData = await zipEntry.async("nodebuffer");
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        await fs.writeFile(destPath, fileData);
      }
    }

    // 3. Also mirror to Desktop if present
    for (const dDir of desktopDirs) {
      try {
        await fs.access(dDir);
        const deskZipPath = path.join(dDir, zipFileName);
        await fs.writeFile(deskZipPath, exportResult.zipBuffer);

        const deskFolderPath = path.join(dDir, extractedFolderName);
        await fs.mkdir(deskFolderPath, { recursive: true });
        for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
          const destPath = path.join(deskFolderPath, relativePath);
          if (zipEntry.dir) {
            await fs.mkdir(destPath, { recursive: true });
          } else {
            const fileData = await zipEntry.async("nodebuffer");
            await fs.mkdir(path.dirname(destPath), { recursive: true });
            await fs.writeFile(destPath, fileData);
          }
        }
      } catch {
        // Desktop directory not available, ignore
      }
    }

    const pbipFilePath = path.join(targetFolderPath, `${safeName}.pbip`);

    // 4. Optionally reveal in Windows Explorer
    if (openExplorer && process.platform === "win32") {
      try {
        exec(`explorer.exe /select,"${pbipFilePath}"`);
      } catch (e) {
        console.error("Could not trigger explorer.exe:", e);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Power BI Project saved directly to your Downloads folder!`,
      zipPath: targetZipPath,
      folderPath: targetFolderPath,
      pbipPath: pbipFilePath,
      safeName,
    });
  } catch (err: any) {
    console.error("Save local export failed:", err);
    return NextResponse.json({ error: err.message || "Failed to save project locally" }, { status: 500 });
  }
}
