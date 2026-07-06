import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/react-query/config";
import type { PnlReport } from "@/types/pnl";

export function usePnl(params?: { period?: string; dateFrom?: string; dateTo?: string }) {
  return useQuery({
    queryKey: queryKeys.pnl.report(params ? JSON.stringify(params) : undefined),
    queryFn: async () => {
      const response = await apiClient.financials.getPnl(params);
      return response.data as PnlReport;
    },
    staleTime: 1000 * 60 * 5,
  });
}
