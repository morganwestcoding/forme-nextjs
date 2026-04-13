// app/analytics/page.tsx
import getCurrentUser from "@/app/actions/getCurrentUser";
import getAnalyticsData from "@/app/actions/getAnalyticsData";
import ClientProviders from "@/components/ClientProviders";
import EmptyState from "@/components/EmptyState";
import UpgradePrompt from "@/components/subscription/UpgradePrompt";
import AnalyticsClient from "./AnalyticsClient";
import { redirect } from "next/navigation";
import { hasFeature } from "@/app/utils/subscription";

export const dynamic = 'force-dynamic';

const AnalyticsPage = async () => {
  const currentUser = await getCurrentUser();

  // Redirect to login if no user
  if (!currentUser) {
    redirect('/');
  }

  // Gate: Gold+ subscription required
  if (!hasFeature(currentUser, 'analytics')) {
    return (
      <ClientProviders>
        <UpgradePrompt feature="Business Analytics" requiredTier="Gold" />
      </ClientProviders>
    );
  }

  try {
    const analyticsData = await getAnalyticsData(currentUser.id);

    return (
      <ClientProviders>
        <AnalyticsClient
          currentUser={currentUser}
          analyticsData={analyticsData}
        />
      </ClientProviders>
    );
  } catch (error) {
    return (
      <ClientProviders>
        <EmptyState
          title="Error Loading Analytics"
          subtitle="There was an error loading your analytics data."
        />
      </ClientProviders>
    );
  }
}

export default AnalyticsPage;