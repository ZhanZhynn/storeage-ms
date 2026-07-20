"use client";

import { apiClient } from "@/lib/api";
import { LowStockAlertWidget } from "@/components/shared";

export default function ShopeeLowStockAlertWidget() {
  return (
    <LowStockAlertWidget
      queryKey={["shopee", "low-stock-alerts"]}
      fetchProducts={async () => {
        const response = await apiClient.shopee.getProductPerformance();
        const data = response.data;
        return {
          products: data.products.map((p) => ({
            id: p.id,
            itemName: p.itemName,
            price: p.price,
            stock: p.stock,
            imageUrl: p.imageUrl,
            isOutOfStock: p.isOutOfStock,
            isLowStock: p.isLowStock,
          })),
          summary: {
            outOfStock: data.summary.outOfStock,
            lowStock: data.summary.lowStock,
          },
        };
      }}
      productsLink="/admin/shopee/products"
    />
  );
}
