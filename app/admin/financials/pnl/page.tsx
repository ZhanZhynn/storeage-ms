import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import PnlReport from "@/components/financials/PnlReport";

export default async function PnlPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  return <PnlReport />;
}
