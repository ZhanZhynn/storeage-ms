/**
 * Vercel production headers — single source for next.config.ts.
 * @see docs/VERCEL_PRODUCTION_GUARDRAILS.md
 *
 * Security headers are mirrored in vercel.json (edge). Keep keys/values in sync.
 * Immutable Cache-Control for /_next/static lives ONLY here (not vercel.json) to avoid
 * duplicate rules and the Next.js build warning about custom static Cache-Control.
 *
 * In dev mode the /_next/static rule is suppressed: Turbopack serves dev bundles that
 * are NOT content-hashed, so `immutable` would cause the browser to cache stale client
 * bundles and break HMR / Fast Refresh (hydration errors).
 */

export type HeaderEntry = { key: string; value: string };

/** Security headers for all routes — also copy into vercel.json `headers[0]`. */
export const VERCEL_SECURITY_HEADERS: readonly HeaderEntry[] = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), geolocation=()" },
] as const;

/** Content-hashed build assets — long cache reduces bot/crawler origin transfer (guardrails). */
export const NEXT_STATIC_CACHE_CONTROL =
  "public, max-age=31536000, immutable" as const;

export type NextHeaderRule = {
  source: string;
  headers: HeaderEntry[];
};

/** Rules passed to Next.js `async headers()` in next.config.ts. */
export function buildNextProductionHeaderRules(): NextHeaderRule[] {
  return [
    {
      source: "/(.*)",
      headers: [...VERCEL_SECURITY_HEADERS],
    },
    // Only apply immutable cache to content-hashed production builds.
    // In dev, Turbopack bundles are not content-hashed — `immutable` would
    // let the browser serve stale bundles after code changes, breaking HMR.
    ...(process.env.NODE_ENV === "production"
      ? [
          {
            source: "/_next/static/(.*)",
            headers: [
              { key: "Cache-Control", value: NEXT_STATIC_CACHE_CONTROL },
            ],
          },
        ]
      : []),
  ];
}
