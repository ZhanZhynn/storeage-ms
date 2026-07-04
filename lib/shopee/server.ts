/**
 * Shopee Server-Side Client
 * Lazy singleton SDK instance with configuration guards.
 * Uses @congminh1254/shopee-sdk for HMAC signing, OAuth, and API access.
 *
 * Multi-shop: single SDK instance now, setActiveShop() sets which shop's
 * token the storage layer returns. When adding shop #2, create per-shop
 * SDK instances instead.
 */

import { ShopeeSDK } from "@congminh1254/shopee-sdk";
import type { ShopeeRegion } from "@congminh1254/shopee-sdk/schemas";
import { getEnvVar } from "@/lib/env";
import { PrismaTokenStorage } from "./token-storage";

// Lazy initialization to avoid issues during build
let sdkInstance: ShopeeSDK | null = null;

/**
 * Active shop context — token storage uses this to return the right token.
 * Set via setActiveShop() before any SDK call that requires auth.
 */
let activeShopId: number | null = null;

/**
 * Set the active shop for subsequent SDK calls.
 * Must be called before any authenticated SDK operation.
 */
export function setActiveShop(shopId: number): void {
  activeShopId = shopId;
}

/**
 * Get the currently active shop ID.
 */
export function getActiveShopId(): number | null {
  return activeShopId;
}

/**
 * Get Shopee SDK server instance (lazy singleton)
 * Uses custom Prisma-backed token storage for persistence across serverless cold starts.
 */
export function getShopeeSDK(): ShopeeSDK {
  if (!sdkInstance) {
    const partnerId = getEnvVar("SHOPEE_PARTNER_ID");
    const partnerKey = getEnvVar("SHOPEE_PARTNER_KEY");

    if (!partnerId || !partnerKey) {
      throw new Error(
        "Shopee is not configured. Set SHOPEE_PARTNER_ID and SHOPEE_PARTNER_KEY.",
      );
    }

    sdkInstance = new ShopeeSDK(
      {
        partner_id: Number(partnerId),
        partner_key: partnerKey,
        region: "GLOBAL" as ShopeeRegion,
      },
      new PrismaTokenStorage(),
    );
  }
  return sdkInstance;
}

/**
 * Check if Shopee is configured (non-throwing guard for API routes)
 */
export function isShopeeConfigured(): boolean {
  return !!(getEnvVar("SHOPEE_PARTNER_ID") && getEnvVar("SHOPEE_PARTNER_KEY"));
}

/**
 * Shopee API base URLs
 */
export const SHOPEE_URLS = {
  auth: "https://open.shopee.com/auth",
  authSandbox: "https://open.sandbox.test-stable.shopee.com/auth",
  apiBase: "https://partner.shopeemobile.com/api/v2",
} as const;
