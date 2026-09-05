import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { currentAgent, currentOrganization } from "@/data/organization";
import { greetingFor } from "@/lib/format";
import { getDashboardData } from "@/services/dashboard";

export const metadata: Metadata = {
  title: "Today",
};

export default async function TodayPage() {
  const data = await getDashboardData(currentOrganization.id);
  const greeting = greetingFor(new Date());
  return (
    <Dashboard data={data} agent={currentAgent} organization={currentOrganization} greeting={greeting} />
  );
}
