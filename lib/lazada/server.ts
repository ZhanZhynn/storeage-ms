/**
 * Lazada Server-Side Client
 * Lazy singleton SDK instance with token management.
 * Uses lazada-api-client for OAuth and API access.
 *
 * Tokens are persisted in MongoDB via Prisma (LazadaShop model).
 * Active seller context is set via setActiveSeller() before SDK calls.
 */

import { LazadaModule } from "lazada-api-client";
import type { LazadaConfig } from "lazada-api-client";
import type { LazadaResponseAccessToken } from "lazada-api-client";
import prisma from "@/prisma/client";
import { getEnvVar } from "@/lib/env";
import { logger } from "@/lib/logger";

// Lazy initialization
let sdkInstance: LazadaModule | null = null;

/**
 * Active seller context — which LazadaShop's tokens the SDK uses.
 * Set via setActiveSeller() before any authenticated SDK operation.
 */
let activeSellerId: string | null = null;

/**
 * Set the active seller for subsequent SDK calls.
 * @param sellerId The Lazada seller ID (string)
 */
export function setActiveSeller(sellerId: string): void {
  activeSellerId = sellerId;
}

/**
 * Get the currently active seller ID.
 */
export function getActiveSellerId(): string | null {
  return activeSellerId;
}

/**
 * Build a LazadaModule config from env vars + DB tokens.
 * Lazada tokens are per-app (not per-shop like Shopee), so we read
 * from the LazadaShop matching the active seller or the most recently updated one.
 */
async function buildConfig(): Promise<LazadaConfig> {
  const appKey = getEnvVar("LAZADA_APP_KEY");
  const appSecret = getEnvVar("LAZADA_APP_SECRET");

  if (!appKey || !appSecret) {
    throw new Error("Lazada is not configured. Set LAZADA_APP_KEY and LAZADA_APP_SECRET.");
  }

  // Find the active seller's shop record
  let shop;
  if (activeSellerId) {
    shop = await prisma.lazadaShop.findFirst({
      where: { sellerId: activeSellerId },
    });
  } else {
    // Fallback: most recently updated shop (for cron, etc.)
    shop = await prisma.lazadaShop.findFirst({
      orderBy: { updatedAt: "desc" },
    });
  }

  const config: LazadaConfig = {
    appKey,
    appSecret,
    countryCode: shop?.countryCode || "my",
    shopId: shop?.sellerId,
  };

  if (shop) {
    config.appAccessToken = shop.accessToken;
    config.refreshToken = shop.refreshToken;
    if (shop.tokenExpiry) {
      config.expiresIn = Math.max(
        0,
        Math.floor((shop.tokenExpiry.getTime() - Date.now()) / 1000),
      );
    }
    if (shop.refreshExpiry) {
      config.refreshExpiresIn = Math.max(
        0,
        Math.floor((shop.refreshExpiry.getTime() - Date.now()) / 1000),
      );
    }
  }

  return config;
}

/**
 * Persist refreshed tokens back to the active seller's LazadaShop record.
 */
export async function persistTokens(
  tokenResponse: LazadaResponseAccessToken,
): Promise<void> {
  try {
    const sellerInfo = tokenResponse.country_user_info?.[0];
    const sellerId = activeSellerId || sellerInfo?.seller_id;

    if (!sellerId) {
      logger.warn("[Lazada TokenStorage] No seller ID available to persist tokens");
      return;
    }

    const now = new Date();
    const accessTokenExpiry = tokenResponse.expires_in
      ? new Date(now.getTime() + tokenResponse.expires_in * 1000)
      : null;
    const refreshTokenExpiry = tokenResponse.refresh_expires_in
      ? new Date(now.getTime() + tokenResponse.refresh_expires_in * 1000)
      : null;

    const existing = await prisma.lazadaShop.findFirst({
      where: { sellerId },
      select: { id: true },
    });

    if (existing) {
      await prisma.lazadaShop.update({
        where: { id: existing.id },
        data: {
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          tokenExpiry: accessTokenExpiry,
          refreshExpiry: refreshTokenExpiry,
          updatedAt: now,
        },
      });
      logger.info(`[Lazada TokenStorage] Tokens persisted for seller ${sellerId}`);
    } else {
      logger.warn(
        `[Lazada TokenStorage] No LazadaShop record for seller ${sellerId}. Token not persisted.`,
      );
    }
  } catch (error) {
    logger.error("[Lazada TokenStorage] Failed to persist tokens:", error);
  }
}

/**
 * Ensure the SDK instance has a valid token, refreshing if needed.
 * Called internally before any authenticated SDK operation.
 */
async function ensureFreshToken(): Promise<void> {
  if (!sdkInstance) return;

  const config = sdkInstance.getConfig();
  // Refresh if token expires within 24 hours or has no expiry info
  const needsRefresh =
    !config.appAccessToken ||
    (config.expiresIn !== undefined && config.expiresIn < 86400);

  if (needsRefresh && config.refreshToken) {
    try {
      logger.info("[Lazada] Refreshing access token...");
      const tokenResponse = await sdkInstance.refreshToken();
      if (tokenResponse?.access_token) {
        await persistTokens(tokenResponse);
        // Rebuild SDK with fresh tokens
        const freshConfig = await buildConfig();
        sdkInstance.setConfig(freshConfig);
      }
    } catch (error) {
      logger.error("[Lazada] Token refresh failed:", error);
      throw new Error("Lazada token refresh failed. Please re-authorize the seller.");
    }
  }
}

/**
 * Get Lazada SDK instance (lazy singleton).
 * Rebuilds with fresh config on each access to pick up token changes.
 */
export async function getLazadaSDK(): Promise<LazadaModule> {
  const config = await buildConfig();

  if (!sdkInstance) {
    sdkInstance = new LazadaModule(config);
  } else {
    sdkInstance.setConfig(config);
  }

  await ensureFreshToken();
  return sdkInstance;
}

/**
 * Validate that the current token can successfully call the Lazada API.
 * Makes a direct HTTP call to a lightweight endpoint (seller info) to verify auth.
 * This catches errors that the SDK silently swallows.
 */
export async function validateLazadaToken(): Promise<{ valid: boolean; error?: string }> {
  try {
    const config = await buildConfig();
    if (!config.appAccessToken) {
      return { valid: false, error: "No access token available" };
    }

    const appSecret = config.appSecret;
    const path = "/products/get";

    // Build a minimal signed request to test the token
    const crypto = await import("crypto");
    const timestamp = Date.now();
    const params: Record<string, string> = {
      app_key: config.appKey,
      timestamp: String(timestamp),
      sign_method: "sha256",
      access_token: config.appAccessToken,
      limit: "1",
      offset: "0",
    };

    // Sort params and create sign string
    const sortedKeys = Object.keys(params).sort();
    const signString = sortedKeys.map((k) => `${k}${params[k]}`).join("");
    const sign = crypto
      .createHmac("sha256", appSecret)
      .update(signString)
      .digest("hex")
      .toUpperCase();

    const queryString = sortedKeys.map((k) => `${k}=${encodeURIComponent(params[k] ?? "")}`).join("&");
    const url = `https://api.lazada.vn/rest${path}?${queryString}&sign=${sign}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code === "0" || data.code === 0) {
      return { valid: true };
    }

    const errorMsg = data.msg || data.message || `API error code: ${data.code}`;
    logger.warn(`[Lazada] Token validation failed: ${errorMsg}`);
    return { valid: false, error: errorMsg };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.warn(`[Lazada] Token validation request failed: ${msg}`);
    return { valid: false, error: msg };
  }
}

/**
 * Check if Lazada is configured (non-throwing guard for API routes).
 */
export function isLazadaConfigured(): boolean {
  return !!(getEnvVar("LAZADA_APP_KEY") && getEnvVar("LAZADA_APP_SECRET"));
}

/**
 * Lazada auth URLs (informational)
 */
export const LAZADA_URLS = {
  auth: "https://auth.lazada.com/oauth/authorize",
  tokenCreate: "https://auth.lazada.com/rest/auth/token/create",
  tokenRefresh: "https://auth.lazada.com/rest/auth/token/refresh",
} as const;

/**
 * Generate the Lazada authorization URL for OAuth flow.
 */
export function getLazadaAuthUrl(redirectUri: string): string | null {
  if (!isLazadaConfigured()) return null;

  const appKey = getEnvVar("LAZADA_APP_KEY")!;
  const appSecret = getEnvVar("LAZADA_APP_SECRET")!;

  // Use a temporary LazadaModule just to generate the URL
  const tempModule = new LazadaModule({ appKey, appSecret });
  const { url } = tempModule.generateAuthLink(redirectUri);
  return url;
}

/**
 * Exchange an authorization code for access tokens.
 */
export async function exchangeLazadaCodeForToken(
  code: string,
): Promise<LazadaResponseAccessToken | null> {
  if (!isLazadaConfigured()) return null;

  try {
    const appKey = getEnvVar("LAZADA_APP_KEY")!;
    const appSecret = getEnvVar("LAZADA_APP_SECRET")!;

    const tempModule = new LazadaModule({ appKey, appSecret });
    const token = await tempModule.fetchTokenWithAuthCode(code);
    return token;
  } catch (error) {
    logger.error("[Lazada Auth] Failed to exchange code for token:", error);
    return null;
  }
}
