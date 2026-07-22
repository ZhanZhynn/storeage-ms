import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromRequest } from "@/utils/auth";
import { estimateLandedCost } from "@/lib/sourcing/landed-cost";

const schema = z.object({ quantity: z.coerce.number().int().positive(), unitPriceCny: z.coerce.number().nonnegative(), fxRate: z.coerce.number().positive(), freightMyr: z.coerce.number().nonnegative().optional(), dutyRate: z.coerce.number().min(0).max(100).optional(), taxRate: z.coerce.number().min(0).max(100).optional(), otherCostMyr: z.coerce.number().nonnegative().optional() });

export async function POST(request: NextRequest) {
  const user = await getSessionFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid landed-cost inputs", details: parsed.error.flatten() }, { status: 400 });
  return NextResponse.json(estimateLandedCost(parsed.data));
}
