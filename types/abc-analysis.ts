export type AbcTier = "A" | "B" | "C";

export interface AbcProduct {
  id: string;
  name: string;
  sku: string;
  category?: string;
  channel: "WMS" | "Shopee" | "Both";
  revenue: number;
  revenuePercent: number;
  cumulativePercent: number;
  tier: AbcTier;
  unitsSold: number;
  stockOnHand: number;
  unitPrice: number;
  holdingValue: number;
  daysOfStock: number | null;
}

export interface AbcTierSummary {
  count: number;
  revenue: number;
  revenuePercent: number;
  stockValue: number;
}

export interface AbcRecommendations {
  deadStock: AbcProduct[];
  priorityRestock: AbcProduct[];
  overstocked: AbcProduct[];
}

export interface AbcParetoPoint {
  product: string;
  revenue: number;
  cumulativePercent: number;
}

export interface AbcAnalysisData {
  period: { from: string; to: string };
  products: AbcProduct[];
  summary: {
    totalProducts: number;
    totalRevenue: number;
    totalStockValue: number;
    tierA: AbcTierSummary;
    tierB: AbcTierSummary;
    tierC: AbcTierSummary;
  };
  recommendations: AbcRecommendations;
  paretoData: AbcParetoPoint[];
}
