import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { ParsedDataset } from "./data-profiler";
import { GeneratedDashboard, TemplateType } from "./templates";

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
 * Retrieve a project by its unique ID.
 */
export async function getProject(id: string): Promise<ProjectData | null> {
  // Safe ID validation (prevent directory traversal)
  if (!id || !/^[A-Za-z0-9_-]+$/.test(id)) {
    return null;
  }

  if (memoryStore.has(id)) {
    return memoryStore.get(id)!;
  }

  try {
    const filePath = path.join(STORAGE_DIR, `${id}.json`);
    const content = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(content) as ProjectData;
    memoryStore.set(id, parsed);
    return parsed;
  } catch {
    return null;
  }
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
