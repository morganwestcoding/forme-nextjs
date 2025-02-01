// app/Explore/page.tsx

import EmptyState from "@/components/EmptyState";
import ClientProviders from "@/components/ClientProviders";
import getCurrentUser from "@/app/actions/getCurrentUser";

export const dynamic = 'force-dynamic';

const Explore = async () => {
  const currentUser = await getCurrentUser();

  return (
    <ClientProviders>
      <EmptyState
        title="This page is coming soon!"
        subtitle="Check back later for new features."
      />
    </ClientProviders>
  );
}
 
export default Explore;