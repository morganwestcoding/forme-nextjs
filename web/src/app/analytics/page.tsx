// app/analytics/page.tsx
import getCurrentUser from "@/app/actions/getCurrentUser";
import getAnalyticsData from "@/app/actions/getAnalyticsData";
import ClientProviders from "@/components/ClientProviders";
import EmptyState from "@/components/EmptyState";
import AnalyticsClient from "./AnalyticsClient";
import { redirect } from "next/navigation";
import Container from "@/components/Container";

export const dynamic = 'force-dynamic';

const AnalyticsPage = async () => {
  const currentUser = await getCurrentUser();

  // Redirect to login if no user
  if (!currentUser) {
    redirect('/');
  }

  try {
    const analyticsData = await getAnalyticsData(currentUser.id);

    return (
      <ClientProviders>
        <Container>
        <AnalyticsClient
          currentUser={currentUser}
          analyticsData={analyticsData}
        />
        </Container>
     
      </ClientProviders>
    );
  } catch (error) {
    console.error("Error loading analytics:", error);
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