import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/react-query/config";
import type { AbcAnalysisData } from "@/types/abc-analysis";

export function useAbcAnalysis(params?: {
  dateFrom?: string;
  dateTo?: string;
  channel?: string;
}) {
  return useQuery({
    queryKey: queryKeys.abcAnalysis.report(
      params ? JSON.stringify(params) : undefined,
    ),
    queryFn: async () => {
      const response = await apiClient.abcAnalysis.get(params);
      return response.data as AbcAnalysisData;
    },
    staleTime: 1000 * 60 * 5,
  });
}
