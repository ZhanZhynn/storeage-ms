import { Suspense } from "react";
import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import ShopeeOrders from "@/components/shopee/ShopeeOrders";
import { Skeleton } from "@/components/ui/skeleton";

export default async function ShopeeOrdersPage() {
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
      <ShopeeOrders />
    </Suspense>
  );
}
