import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import ShopeeExcelImportContent from "./content";

export default async function ShopeeImportPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  return <ShopeeExcelImportContent />;
}
