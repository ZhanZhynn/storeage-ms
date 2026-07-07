/**
 * Server-side data fetching for combined WMS + Shopee insights.
 * Normalizes orders into a unified shape and aggregates Shopee-specific
 * metrics for Business Insights charts.
 * Only import from server code.
 */

import { getCache, setCache, cacheKeys } from "@/lib/cache";
import { prisma } from "@/prisma/client";

/** Normalized order item shape */
export type CombinedOrderItem = {
  productName: string;
  quantity: number;
  price: number;
};

/** Normalized order shape — unified WMS + Shopee */
export type CombinedOrder = {
  id: string;
  source: "wms" | "shopee";
  total: number;
  status: string;
  createdAt: string;
  items: CombinedOrderItem[];
};

/** Shopee product listing stats */
export type ShopeeProductStats = {
  total: number;
  byStatus: Record<string, number>;
};

/** Top Shopee product by revenue */
export type ShopeeTopProduct = {
  productName: string;
  revenue: number;
  quantity: number;
};

/** Combined insights — orders + Shopee-specific aggregations */
export type CombinedInsights = {
  orders: CombinedOrder[];
  shopeeProducts: ShopeeProductStats;
  shopeeTopProducts: ShopeeTopProduct[];
};

const CACHE_TTL = 300; // 5 minutes

/**
 * Fetch and normalize WMS + Shopee orders and Shopee product aggregates
 * for the given user. All queries run in parallel.
 */
export async function getCombinedInsightsForUser(
  userId: string,
): Promise<CombinedInsights> {
  const cacheKey = cacheKeys.businessInsights.combinedInsights(userId);
  const cached = await getCache<CombinedInsights>(cacheKey);
  if (cached) return cached;

  // Get user's Shopee shop IDs
  const shopeeShops = await prisma.shopeeShop.findMany({
    where: { userId },
    select: { id: true },
  });
  const shopeeShopIds = shopeeShops.map((s) => s.id);
  const hasShopee = shopeeShopIds.length > 0;

  // Run all queries in parallel
  const [wmsOrders, shopeeOrders, shopeeStatusGroups, shopeeTopRaw] =
    await Promise.all([
      prisma.order.findMany({
        where: { userId },
        select: {
          id: true,
          status: true,
          total: true,
          createdAt: true,
          items: {
            select: {
              productName: true,
              quantity: true,
              price: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      hasShopee
        ? prisma.shopeeOrder.findMany({
            where: { shopId: { in: shopeeShopIds } },
            select: {
              id: true,
              orderStatus: true,
              totalAmount: true,
              shopeeCreatedAt: true,
              createdAt: true,
              items: {
                select: {
                  productName: true,
                  quantity: true,
                  price: true,
                },
              },
            },
            orderBy: { shopeeCreatedAt: "desc" },
          })
        : [],
      hasShopee
        ? prisma.shopeeProduct.groupBy({
            by: ["status"],
            where: { shopId: { in: shopeeShopIds } },
            _count: true,
          })
        : [],
      hasShopee
        ? prisma.shopeeOrderItem.groupBy({
            by: ["productName"],
            where: { order: { shopId: { in: shopeeShopIds } } },
            _sum: { subtotal: true, quantity: true },
            orderBy: { _sum: { subtotal: "desc" } },
            take: 10,
          })
        : [],
    ]);

  // Normalize orders
  const orders: CombinedOrder[] = [
    ...wmsOrders.map((o) => ({
      id: o.id,
      source: "wms" as const,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        price: i.price,
      })),
    })),
    ...shopeeOrders.map((o) => ({
      id: o.id,
      source: "shopee" as const,
      total: o.totalAmount,
      status: o.orderStatus,
      createdAt: (o.shopeeCreatedAt ?? o.createdAt).toISOString(),
      items: o.items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        price: i.price,
      })),
    })),
  ];

  // Sort by createdAt descending
  orders.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Build Shopee product stats
  const shopeeProductStatusMap: Record<string, number> = {};
  let shopeeProductTotal = 0;
  for (const g of shopeeStatusGroups) {
    shopeeProductStatusMap[g.status] = g._count;
    shopeeProductTotal += g._count;
  }

  const shopeeProducts: ShopeeProductStats = {
    total: shopeeProductTotal,
    byStatus: shopeeProductStatusMap,
  };

  // Build top Shopee products
  const shopeeTopProducts: ShopeeTopProduct[] = shopeeTopRaw.map((item) => ({
    productName: item.productName,
    revenue: item._sum.subtotal || 0,
    quantity: Number(item._sum.quantity || 0),
  }));

  const result: CombinedInsights = {
    orders,
    shopeeProducts,
    shopeeTopProducts,
  };

  await setCache(cacheKey, result, CACHE_TTL);
  return result;
}
