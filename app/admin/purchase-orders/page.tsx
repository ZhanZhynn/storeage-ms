import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import PurchaseOrderList from "@/components/purchase-orders/PurchaseOrderList";

export default async function PurchaseOrdersPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  return <PurchaseOrderList />;
}
