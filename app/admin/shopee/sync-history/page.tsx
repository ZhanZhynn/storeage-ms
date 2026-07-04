import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import ShopeeSyncHistory from "@/components/shopee/ShopeeSyncHistory";

export default async function ShopeeSyncHistoryPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  return <ShopeeSyncHistory />;
}
