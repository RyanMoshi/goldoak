import { DashboardHeader } from '@/components/platform/dashboard/DashboardHeader'
import { InsurerActivity } from '@/components/platform/dashboard/InsurerActivity'
import { PipelineSnapshot } from '@/components/platform/dashboard/PipelineSnapshot'
import { RecentActivity } from '@/components/platform/dashboard/RecentActivity'
import { TodayWorkspace } from '@/components/platform/dashboard/TodayWorkspace'
import type { DashboardData, Organization, PublicUser } from '@/types/platform'

interface Props {
  data: DashboardData
  agent: PublicUser
  organization: Organization
  greeting: string
}

/** Server component composing the Today page. */
export function Dashboard({ data, agent, organization, greeting }: Props) {
  return (
    <>
      <DashboardHeader greeting={greeting} firstName={agent.name.split(' ')[0]} organizationName={organization.shortName} />
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
  )
}
