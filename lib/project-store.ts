import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { ParsedDataset, parseAndProfileData } from "./data-profiler";
import { GeneratedDashboard, TemplateType, generateDashboard } from "./templates";
import { SAMPLE_DATASETS } from "./sample-datasets";

export interface ProjectData {
  id: string;
  name: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  inferredDomain: string;
  selectedTemplate: TemplateType;
  dataset: ParsedDataset;
  dashboard: GeneratedDashboard;
}

const STORAGE_DIR = path.join(process.cwd(), "uploads", "projects");
const memoryStore = new Map<string, ProjectData>();

async function ensureStorageDir() {
  try {
    await fs.access(STORAGE_DIR);
  } catch {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
  }
}

/**
 * Save or update a project record.
 */
export async function saveProject(project: Omit<ProjectData, "id" | "uploadedAt"> & { id?: string }): Promise<ProjectData> {
  const id = project.id || nanoid(12);
  const fullProject: ProjectData = {
    ...project,
    id,
    uploadedAt: new Date().toISOString(),
  };

  memoryStore.set(id, fullProject);

  try {
    await ensureStorageDir();
    const filePath = path.join(STORAGE_DIR, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(fullProject, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not persist project to disk, saved in memory:", err);
  }

  return fullProject;
}

/**
 * Retrieve a project by its unique ID or name with extensive fallbacks.
 */
export async function getProject(id: string): Promise<ProjectData | null> {
  if (!id) return null;

  const normalizedQuery = id.trim().toLowerCase();
  const safeIdMatch = id.replace(/[^A-Za-z0-9_-]/g, "");

  // 1. Direct match in memory store
  if (memoryStore.has(id)) {
    return memoryStore.get(id)!;
  }
  if (safeIdMatch && memoryStore.has(safeIdMatch)) {
    return memoryStore.get(safeIdMatch)!;
  }

  // 2. Search memory store by project name or fileName
  for (const proj of memoryStore.values()) {
    const projNameNorm = (proj.name || "").toLowerCase();
    const projFileNorm = (proj.fileName || "").toLowerCase();
    const safeProjName = proj.name.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_").toLowerCase();

    if (
      proj.id === id ||
      projNameNorm === normalizedQuery ||
      projFileNorm === normalizedQuery ||
      safeProjName === normalizedQuery
    ) {
      return proj;
    }
  }

  // 3. Try reading directly from disk if safeIdMatch exists
  if (safeIdMatch) {
    try {
      await ensureStorageDir();
      const filePath = path.join(STORAGE_DIR, `${safeIdMatch}.json`);
      const content = await fs.readFile(filePath, "utf-8");
      const parsed = JSON.parse(content) as ProjectData;
      memoryStore.set(parsed.id, parsed);
      return parsed;
    } catch {
      // Continue to directory scan
    }
  }

  // 4. Scan disk directory for matching project ID, name, or filename
  try {
    await ensureStorageDir();
    const files = await fs.readdir(STORAGE_DIR);
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const filePath = path.join(STORAGE_DIR, file);
        const content = await fs.readFile(filePath, "utf-8");
        const parsed = JSON.parse(content) as ProjectData;
        const pNameNorm = (parsed.name || "").toLowerCase();
        const pFileNorm = (parsed.fileName || "").toLowerCase();
        const safePName = (parsed.name || "").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_").toLowerCase();

        if (
          parsed.id === id ||
          parsed.id === safeIdMatch ||
          pNameNorm === normalizedQuery ||
          pFileNorm === normalizedQuery ||
          safePName === normalizedQuery ||
          file.replace(".json", "") === id
        ) {
          memoryStore.set(parsed.id, parsed);
          return parsed;
        }
      } catch {}
    }
  } catch {}

  // 5. Fallback: check if query matches any built-in sample dataset
  const matchedSample = SAMPLE_DATASETS.find((s) => {
    const sId = s.id.toLowerCase();
    const sName = s.name.toLowerCase();
    const sDomain = s.domain.toLowerCase();
    return (
      sId === normalizedQuery ||
      sName === normalizedQuery ||
      sDomain === normalizedQuery ||
      normalizedQuery.includes(sDomain) ||
      normalizedQuery.includes(sId)
    );
  });

  if (matchedSample) {
    try {
      const dataset = parseAndProfileData(matchedSample.csvContent, "csv");
      const dashboard = generateDashboard(dataset, matchedSample.domain);
      const sampleProj: ProjectData = {
        id: matchedSample.id,
        name: matchedSample.name,
        fileName: `${matchedSample.id}.csv`,
        fileSize: Buffer.byteLength(matchedSample.csvContent, "utf-8"),
        uploadedAt: new Date().toISOString(),
        inferredDomain: matchedSample.domain,
        selectedTemplate: matchedSample.domain,
        dataset,
        dashboard,
      };
      memoryStore.set(sampleProj.id, sampleProj);
      return sampleProj;
    } catch (err) {
      console.warn("Failed to reconstruct sample dataset project:", err);
    }
  }

  return null;
}

/**
 * List recent projects.
 */
export async function listProjects(limit = 10): Promise<Omit<ProjectData, "dataset">[]> {
  const projects: Omit<ProjectData, "dataset">[] = [];

  // Memory first
  memoryStore.forEach((p) => {
    const { dataset, ...summary } = p;
    projects.push(summary);
  });

  try {
    await ensureStorageDir();
    const files = await fs.readdir(STORAGE_DIR);
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const id = file.replace(".json", "");
      if (memoryStore.has(id)) continue;
      try {
        const content = await fs.readFile(path.join(STORAGE_DIR, file), "utf-8");
        const { dataset, ...summary } = JSON.parse(content);
        projects.push(summary);
      } catch {}
    }
  } catch {}

  projects.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  return projects.slice(0, limit);
}
