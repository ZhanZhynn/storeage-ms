import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { prisma } from "@/prisma/client";
import { requireWorkspaceRole, SourcingAccessError } from "@/lib/sourcing/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionFromRequest(request); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const workspaceId = new URL(request.url).searchParams.get("workspaceId"); if (!workspaceId) return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    await requireWorkspaceRole(user, workspaceId, ["admin", "sourcer"]);
    const orders = await prisma.purchaseOrder.findMany({ where: { workspaceId }, include: { supplier: { select: { id: true, name: true } }, items: { select: { quantity: true } }, sourcingOrder: { include: { receipts: { include: { items: { select: { acceptedQuantity: true, damagedQuantity: true, shortageQuantity: true } } } } } } } });
    const scores = new Map<string, { supplierId: string; supplierName: string; orders: number; ordered: number; accepted: number; defects: number; receivedOrders: number }>();
    for (const order of orders) { const row = scores.get(order.supplierId) || { supplierId: order.supplier.id, supplierName: order.supplier.name, orders: 0, ordered: 0, accepted: 0, defects: 0, receivedOrders: 0 }; row.orders += 1; row.ordered += order.items.reduce((sum, item) => sum + item.quantity, 0); const receiptItems = order.sourcingOrder?.receipts.flatMap((receipt) => receipt.items) || []; if (receiptItems.length) row.receivedOrders += 1; for (const item of receiptItems) { row.accepted += item.acceptedQuantity; row.defects += item.damagedQuantity + item.shortageQuantity; } scores.set(order.supplierId, row); }
    return NextResponse.json([...scores.values()].map((row) => ({ ...row, fillRate: row.ordered ? row.accepted / row.ordered : null, defectRate: row.accepted + row.defects ? row.defects / (row.accepted + row.defects) : null, receiptCoverage: row.orders ? row.receivedOrders / row.orders : 0 })).sort((a, b) => (a.defectRate ?? 0) - (b.defectRate ?? 0)));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Scorecard request failed" }, { status: error instanceof SourcingAccessError ? error.status : 500 }); }
}
