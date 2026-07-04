/**
 * Shopee OAuth — Generate Authorization URL
 * GET /api/shopee/auth
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { isShopeeConfigured, getShopeeAuthUrl } from "@/lib/shopee";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isShopeeConfigured()) {
      return NextResponse.json(
        { error: "Shopee integration is not configured. Set SHOPEE_PARTNER_ID and SHOPEE_PARTNER_KEY." },
        { status: 503 },
      );
    }

    const authUrl = getShopeeAuthUrl();
    if (!authUrl) {
      return NextResponse.json(
        { error: "Failed to generate authorization URL. Check SHOPEE_REDIRECT_URL." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: authUrl });
  } catch (error) {
    logger.error("[Shopee Auth] Error generating auth URL:", error);
    return NextResponse.json(
      { error: "Failed to generate authorization URL" },
      { status: 500 },
    );
  }
}
