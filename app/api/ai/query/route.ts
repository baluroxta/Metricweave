import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/project-store";
import { queryDashboardIntelligence } from "@/lib/ai-service";

export async function POST(request: NextRequest) {
  try {
    const { projectId, query } = await request.json();

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const intelligence = await queryDashboardIntelligence(
      project.dashboard,
      project.dataset.qualityReport,
      query
    );

    return NextResponse.json({ success: true, intelligence });
  } catch (err: any) {
    console.error("AI query error:", err);
    return NextResponse.json({ error: err.message || "Failed to process query" }, { status: 500 });
  }
}
