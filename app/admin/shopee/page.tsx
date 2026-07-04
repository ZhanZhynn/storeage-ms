import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import ShopeeOverview from "@/components/shopee/ShopeeOverview";

export default async function ShopeePage() {
  const user = await getSession();
  if (!user) redirect("/login");

  return <ShopeeOverview />;
}
