import EmptyState from "@/components/EmptyState";
import getCurrentUser from "@/app/actions/getCurrentUser";
import PropertiesClient from "./PropertiesClient";
import ClientOnly from "@/components/ClientOnly";

export const metadata = {
  title: 'Properties',
  description: 'Manage your business locations',
  robots: { index: false, follow: false },
};

const PropertiesPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return <EmptyState
      title="Unauthorized"
      subtitle="Please login"
    />
  }

  return (
    <ClientOnly>
      <PropertiesClient currentUser={currentUser} />
    </ClientOnly>
  );
}

export default PropertiesPage;
