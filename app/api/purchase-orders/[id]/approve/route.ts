import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { withRateLimit, defaultRateLimits } from "@/lib/api/rate-limit";
import { approvePurchaseOrder } from "@/prisma/purchase-order";
import { logger } from "@/lib/logger";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const rateLimitResponse = await withRateLimit(request, defaultRateLimits.strict);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "admin") {
      return NextResponse.json({ error: "Only admins can approve purchase orders" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "action must be 'approve' or 'reject'" },
        { status: 400 },
      );
    }

    const data = await approvePurchaseOrder(session.id, id, action);
    if (!data) {
      return NextResponse.json(
        { error: "Purchase order not found or not in pending_approval status" },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    logger.error("Error approving purchase order:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to approve purchase order" },
      { status: 500 },
    );
  }
}
