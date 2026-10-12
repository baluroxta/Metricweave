import fs from "fs/promises";
import path from "path";
import os from "os";
import JSZip from "jszip";
import { getProject, listProjects } from "../lib/project-store";
import { createPowerBiZipBundle } from "../lib/powerbi-export";

async function main() {
  const projects = await listProjects(20);
  console.log(`Found ${projects.length} projects`);

  // Target the sales project
  const salesProjSummary = projects.find((p) => p.name.includes("Global Retail") || p.name.includes("Sales")) || projects[0];
  if (!salesProjSummary) {
    console.log("No project found!");
    return;
  }

  const project = await getProject(salesProjSummary.id);
  if (!project) {
    console.log("Could not load project details:", salesProjSummary.id);
    return;
  }

  console.log(`Generating Power BI export for: "${project.name}" (ID: ${project.id})`);

  const exportResult = await createPowerBiZipBundle(project.name, project.dashboard, project.dataset);

  const safeName = project.name.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_") || "MetricWeave_Report";

  const targetDirs = [
    path.join(os.homedir(), "Downloads"),
    path.join(os.homedir(), "OneDrive", "Documents", "Desktop"),
  ];

  for (const baseDir of targetDirs) {
    try {
      await fs.access(baseDir);
    } catch {
      continue;
    }

    // 1. Save ZIP
    const zipPath = path.join(baseDir, `${safeName}_PowerBI_Project.zip`);
    await fs.writeFile(zipPath, exportResult.zipBuffer);
    console.log(`Saved ZIP to: ${zipPath}`);

    // 2. Extract folder
    const folderPath = path.join(baseDir, `${safeName}_PowerBI`);
    await fs.mkdir(folderPath, { recursive: true });

    const zip = await JSZip.loadAsync(exportResult.zipBuffer);
    for (const [relPath, zipEntry] of Object.entries(zip.files)) {
      const destPath = path.join(folderPath, relPath);
      if (zipEntry.dir) {
        await fs.mkdir(destPath, { recursive: true });
      } else {
        const fileData = await zipEntry.async("nodebuffer");
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        await fs.writeFile(destPath, fileData);
      }
    }
    console.log(`Extracted ready-to-open project to: ${folderPath}`);
    console.log(`Main .pbip file: ${path.join(folderPath, `${safeName}.pbip`)}`);
  }

  console.log("Export refresh completed successfully!");
}

main().catch(console.error);
