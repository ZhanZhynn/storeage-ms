import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/react-query/config";
import type { ExecutiveKpiData } from "@/types/executive-kpi";

export function useExecutiveKpi(params?: { dateFrom?: string; dateTo?: string }) {
  return useQuery({
    queryKey: queryKeys.executiveKpi.overview(params ? JSON.stringify(params) : undefined),
    queryFn: async () => {
      const response = await apiClient.executiveKpi.get(params);
      return response.data as ExecutiveKpiData;
    },
    staleTime: 1000 * 60 * 5,
  });
}
