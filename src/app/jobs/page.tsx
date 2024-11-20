// app/jobs/page.tsx

import EmptyState from "@/components/EmptyState";
import ClientProviders from "@/components/ClientProviders";
import getCurrentUser from "@/app/actions/getCurrentUser";

export const dynamic = 'force-dynamic';

const Jobs = async () => {
  const currentUser = await getCurrentUser();

  return (
    <ClientProviders>
      <EmptyState
        title="No jobs available"
        subtitle="Check back soon for job opportunities."
      />
    </ClientProviders>
  );
}
 
export default Jobs;