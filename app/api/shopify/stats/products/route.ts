/**
 * Shopify Product Performance — Stock turnover, days-until-stockout, low-stock alerts
 * GET /api/shopify/stats/products
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/utils/auth";
import { prisma } from "@/prisma/client";
import { getCache, setCache } from "@/lib/cache/cache-utils";
import { logger } from "@/lib/logger";
import { withRateLimit, defaultRateLimits } from "@/lib/api/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = await withRateLimit(request, defaultRateLimits.standard);
    if (rateLimitResponse) return rateLimitResponse;

    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.id;
    const { searchParams } = new URL(request.url);
    const shopId = searchParams.get("shopId");

    const cacheKey = `shopify:product-performance:${shopId || "all"}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const shopWhere: Record<string, unknown> = { userId };
    if (shopId) shopWhere.id = shopId;

    const shops = await prisma.shopifyShop.findMany({
      where: shopWhere,
      select: { id: true, lowStockThreshold: true },
    });
    const shopIds = shops.map((s) => s.id);
    const lowStockThreshold = Math.min(...shops.map((s) => s.lowStockThreshold), 10);

    if (shopIds.length === 0) {
      return NextResponse.json({ products: [], summary: { totalProducts: 0, lowStock: 0, outOfStock: 0, slowMoving: 0, excellentPerformers: 0, goodPerformers: 0 }, lowStockThreshold });
    }

    // Shopify uses totalInventory as the stock level
    const products = await prisma.shopifyProduct.findMany({
      where: { shopId: { in: shopIds } },
      select: {
        id: true,
        shopifyProductId: true,
        title: true,
        totalInventory: true,
        status: true,
        featuredImageUrl: true,
      },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentOrderItems = await prisma.shopifyOrderItem.findMany({
      where: {
        order: {
          shopId: { in: shopIds },
          shopifyCreatedAt: { gte: thirtyDaysAgo },
          orderStatus: { not: "CANCELLED" },
        },
      },
      select: {
        name: true,
        quantity: true,
        price: true,
        discountedPrice: true,
      },
    });

    // Calculate sales velocity per product (by product name)
    const salesVelocity: Record<string, { quantitySold: number; revenue: number; orderCount: number }> = {};
    for (const item of recentOrderItems) {
      if (!salesVelocity[item.name]) {
        salesVelocity[item.name] = { quantitySold: 0, revenue: 0, orderCount: 0 };
      }
      const velocity = salesVelocity[item.name];
      if (velocity) {
        velocity.quantitySold += item.quantity;
        velocity.revenue += (item.discountedPrice ?? item.price) * item.quantity;
        velocity.orderCount++;
      }
    }

    // Calculate performance metrics per product
    const productPerformance = products.map((product) => {
      const velocity = salesVelocity[product.title] || { quantitySold: 0, revenue: 0, orderCount: 0 };

      // Daily sales rate (quantity sold per day over 30 days)
      const dailySalesRate = velocity.quantitySold / 30;

      // Days until stockout (current stock / daily sales rate)
      const daysUntilStockout = dailySalesRate > 0
        ? Math.round(product.totalInventory / dailySalesRate)
        : product.totalInventory === 0 ? 0 : Infinity;

      // Stock turnover ratio (quantity sold / average stock)
      const stockTurnover = product.totalInventory > 0
        ? Math.round((velocity.quantitySold / product.totalInventory) * 100) / 100
        : velocity.quantitySold > 0 ? Infinity : 0;

      // Slow-moving: sold < 3 units in 30 days and has stock
      const isSlowMoving = velocity.quantitySold < 3 && product.totalInventory > 0;

      // Out of stock
      const isOutOfStock = product.totalInventory === 0;

      // Low stock (per shop threshold)
      const isLowStock = product.totalInventory > 0 && product.totalInventory < lowStockThreshold;

      // Performance rating
      let performanceRating: "excellent" | "good" | "average" | "slow" | "dead";
      if (velocity.quantitySold >= 20) performanceRating = "excellent";
      else if (velocity.quantitySold >= 10) performanceRating = "good";
      else if (velocity.quantitySold >= 3) performanceRating = "average";
      else if (velocity.quantitySold > 0) performanceRating = "slow";
      else performanceRating = "dead";

      return {
        id: product.id,
        channelItemId: product.shopifyProductId,
        itemName: product.title,
        imageUrl: product.featuredImageUrl,
        status: product.status,
        stock: product.totalInventory,
        quantitySold30d: velocity.quantitySold,
        revenue30d: velocity.revenue,
        dailySalesRate: Math.round(dailySalesRate * 100) / 100,
        daysUntilStockout: daysUntilStockout === Infinity ? null : daysUntilStockout,
        stockTurnover: stockTurnover === Infinity ? null : stockTurnover,
        isSlowMoving,
        isOutOfStock,
        isLowStock,
        performanceRating: performanceRating as "excellent" | "good" | "average" | "slow" | "dead",
      };
    });

    // Sort by revenue (best performers first)
    productPerformance.sort((a, b) => b.revenue30d - a.revenue30d);

    // Summary stats
    const summary = {
      totalProducts: products.length,
      lowStock: productPerformance.filter((p) => p.isLowStock).length,
      outOfStock: productPerformance.filter((p) => p.isOutOfStock).length,
      slowMoving: productPerformance.filter((p) => p.isSlowMoving).length,
      excellentPerformers: productPerformance.filter((p) => p.performanceRating === "excellent").length,
      goodPerformers: productPerformance.filter((p) => p.performanceRating === "good").length,
    };

    const result = { products: productPerformance, summary, lowStockThreshold };

    await setCache(cacheKey, result, 300);

    return NextResponse.json(result);
  } catch (error) {
    logger.error("[Shopify Product Performance] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product performance" },
      { status: 500 },
    );
  }
}
