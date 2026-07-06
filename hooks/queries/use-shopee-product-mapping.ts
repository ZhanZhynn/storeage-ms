import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api/client";
import { queryKeys } from "@/lib/react-query/config";
import { getErrorMessage } from "@/lib/api/errors";

interface ShopeeProductMappingStatus {
  shopeeProductId: string;
  isMapped: boolean;
  variantCount: number;
  mappedVariantCount: number;
  wmsProductId?: string;
}

interface BulkCreateResult {
  created: number;
  skipped: number;
  errors: string[];
}

export function useShopeeProductMappingStatus(shopeeProductIds: string[]) {
  return useQuery({
    queryKey: queryKeys.shopee.mappingStatus(shopeeProductIds),
    queryFn: async () => {
      const response = await apiClient.shopee.getMappingStatus(shopeeProductIds);
      return response.data as { mappings: ShopeeProductMappingStatus[] };
    },
    enabled: shopeeProductIds.length > 0,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateWmsProductFromShopee() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      shopeeProductId: string;
      categoryId: string;
      supplierId: string;
    }) => {
      const response = await apiClient.shopee.createWmsProduct(data);
      return response.data as {
        products: { id: string; name: string; sku: string }[];
        mappings: { id: string; channelProductId: string; channelType: string }[];
        skipped: number;
        errors: string[];
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shopee.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      const count = data.products.length;
      toast({
        title: "Product(s) created",
        description: `${count} WMS product(s) created from Shopee listing.`,
      });
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}

export function useBulkCreateWmsProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      shopeeProductIds: string[];
      categoryId: string;
      supplierId: string;
    }) => {
      const response = await apiClient.shopee.bulkCreateWmsProducts(data);
      return response.data as BulkCreateResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shopee.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      toast({
        title: "Bulk creation complete",
        description: `${data.created} product(s) created, ${data.skipped} skipped.`,
      });
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });
}
