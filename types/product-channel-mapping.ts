export type ChannelType = "shopee" | "lazada" | "tiktok";

export type ProductChannelType = "product" | "variant";

export interface ProductChannelMapping {
  id: string;
  wmsProductId: string;
  channel: ChannelType;
  channelProductId: string;
  channelType: ProductChannelType;
  createdAt: string;
}

export interface CreateWmsProductFromShopeeInput {
  shopeeProductId: string;
  categoryId: string;
  supplierId: string;
}

export interface CreateWmsProductFromShopeeResponse {
  product: {
    id: string;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    status: string;
    imageUrl?: string;
  };
  mapping: ProductChannelMapping;
}

export interface ShopeeProductMappingStatus {
  shopeeProductId: string;
  isMapped: boolean;
  wmsProductId?: string;
  wmsProductName?: string;
}
