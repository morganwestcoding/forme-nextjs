import EmptyState from "@/components/EmptyState";
import ClientProviders from "@/components/ClientProviders";

import getCurrentUser from "@/app/actions/getCurrentUser";
import getListings from "@/app/actions/getListings";


export const dynamic = 'force-dynamic';

const ArticlesPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return <EmptyState
      title="Unauthorized"
      subtitle="Please login"
    />
  }

    return (
      <ClientProviders>
        <EmptyState
          title="No Articles found"
          subtitle="This component is coming soon..."
        />
      </ClientProviders>
    );
  };


export default ArticlesPage;