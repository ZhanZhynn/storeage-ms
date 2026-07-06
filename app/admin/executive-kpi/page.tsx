import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import ExecutiveKpiDashboard from "@/components/executive-kpi/ExecutiveKpiDashboard";

export default async function ExecutiveKpiPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  return <ExecutiveKpiDashboard />;
}
