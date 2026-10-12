import { NextResponse } from "next/server";
import { listProjects } from "@/lib/project-store";

export async function GET() {
  try {
    const projects = await listProjects(10);
    return NextResponse.json({ projects });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to list projects" }, { status: 500 });
  }
}
