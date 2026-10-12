import { NextRequest, NextResponse } from "next/server";
import { getProject, saveProject } from "@/lib/project-store";
import { generateDashboard, TemplateType } from "@/lib/templates";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { template, customVisuals, customKpis } = body;

    let updatedDashboard = project.dashboard;

    if (template && template !== project.selectedTemplate) {
      updatedDashboard = generateDashboard(project.dataset, template as TemplateType);
      project.selectedTemplate = template as TemplateType;
    }

    if (customVisuals) {
      updatedDashboard.visuals = customVisuals;
    }

    if (customKpis) {
      updatedDashboard.kpis = customKpis;
    }

    project.dashboard = updatedDashboard;
    const saved = await saveProject(project);

    return NextResponse.json({ success: true, project: saved });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update project" }, { status: 500 });
  }
}
