import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { requireWorkspaceRole, SourcingAccessError } from "@/lib/sourcing/auth";
import { parseSourcingImport } from "@/lib/sourcing/import";
import { createSourcingCase } from "@/lib/sourcing/commands";
import { withRateLimit, defaultRateLimits } from "@/lib/api/rate-limit";
import { invalidateAllServerCaches } from "@/lib/cache";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const limited = await withRateLimit(request, defaultRateLimits.strict, user.id); if (limited) return limited;
    const form = await request.formData(); const workspaceId = String(form.get("workspaceId") ?? ""); const file = form.get("file");
    if (!workspaceId || !(file instanceof File)) return NextResponse.json({ error: "workspaceId and file are required" }, { status: 400 });
    await requireWorkspaceRole(user, workspaceId, ["admin", "sourcer"]);
    const preview = await parseSourcingImport(file, workspaceId);
    if (form.get("commit") !== "true" || preview.errors.length) return NextResponse.json({ preview: preview.rows.slice(0, 20), valid: preview.rows.length, errors: preview.errors });
    const created = await Promise.all(preview.rows.map((row) => createSourcingCase(user, row)));
    void invalidateAllServerCaches();
    return NextResponse.json({ imported: created.length, errors: [] }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Import failed" }, { status: error instanceof SourcingAccessError ? error.status : 400 }); }
}
