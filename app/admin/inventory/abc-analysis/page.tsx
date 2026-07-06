import { getSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import AbcDashboard from "@/components/abc-analysis/AbcDashboard";

export default async function AbcAnalysisPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  return <AbcDashboard />;
}
