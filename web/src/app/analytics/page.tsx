// app/analytics/page.tsx
import getCurrentUser from "@/app/actions/getCurrentUser";
import ClientProviders from "@/components/ClientProviders";
import UpgradePrompt from "@/components/subscription/UpgradePrompt";
import AnalyticsClient from "./AnalyticsClient";
import { redirect } from "next/navigation";
import { hasFeature } from "@/app/utils/subscription";

export const metadata = {
  title: 'Analytics',
  description: 'Track your business performance',
  robots: { index: false, follow: false },
};

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

  return (
    <ClientProviders>
      <AnalyticsClient currentUser={currentUser} />
    </ClientProviders>
  );
}

export default AnalyticsPage;
