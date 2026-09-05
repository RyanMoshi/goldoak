import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { InsurerActivity } from "@/components/dashboard/InsurerActivity";
import { PipelineSnapshot } from "@/components/dashboard/PipelineSnapshot";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { TodayWorkspace } from "@/components/dashboard/TodayWorkspace";
import type { DashboardData } from "@/types/dashboard";
import type { Agent, Organization } from "@/types/domain";

interface DashboardProps {
  data: DashboardData;
  agent: Agent;
  organization: Organization;
  greeting: string;
}

/**
 * Server component. Composes the Today page: header, then the interactive
 * workspace with server-rendered secondary panels passed through as `aside`.
 */
export function Dashboard({ data, agent, organization, greeting }: DashboardProps) {
  return (
    <>
      <DashboardHeader greeting={greeting} firstName={agent.firstName} organizationName={organization.shortName} />
      <TodayWorkspace
        metrics={data.metrics}
        tasks={data.tasks}
        aside={
          <>
            <PipelineSnapshot stages={data.pipeline} />
            <InsurerActivity rows={data.insurerActivity} />
            <RecentActivity items={data.activity} />
          </>
        }
      />
    </>
  );
}
