import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { prisma } from "@/prisma/client";
import { requireWorkspaceRole, SourcingAccessError } from "@/lib/sourcing/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const params = new URL(request.url).searchParams;
    const workspaceId = params.get("workspaceId"); const title = params.get("title")?.trim();
    if (!workspaceId || !title || title.length < 3) return NextResponse.json([]);
    await requireWorkspaceRole(user, workspaceId, ["admin", "sourcer"]);
    const words = title.split(/\s+/).filter((word) => word.length >= 3).slice(0, 4);
    const cases = await prisma.sourcingCase.findMany({ where: { workspaceId, archivedAt: null, OR: words.map((word) => ({ title: { contains: word, mode: "insensitive" } })) }, select: { id: true, title: true, stage: true, createdAt: true }, take: 8, orderBy: { updatedAt: "desc" } });
    return NextResponse.json(cases.filter((item) => item.title.toLowerCase() !== title.toLowerCase()));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Duplicate check failed" }, { status: error instanceof SourcingAccessError ? error.status : 500 }); }
}
