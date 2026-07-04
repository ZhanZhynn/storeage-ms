import { Suspense } from "react";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import ShopeeProducts from "@/components/shopee/ShopeeProducts";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ShopeeProductsPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-96" />
        </div>
      }
    >
      <ShopeeProducts />
    </Suspense>
  );
}
