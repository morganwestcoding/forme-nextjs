import EmptyState from "@/components/EmptyState";
import ClientProviders from "@/components/ClientProviders";
import getCurrentUser from "@/app/actions/getCurrentUser";
import getReservations from "@/app/actions/getReservations";
import TripsClient from "./TripsClient";
import ClientOnly from "@/components/ClientOnly";

interface TripsPageProps {
  searchParams: {
    page?: string;
  };
}

export const dynamic = 'force-dynamic';

const TripsPage = async ({ searchParams }: TripsPageProps) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState
          title="Unauthorized"
          subtitle="Please login"
        />
      </ClientOnly>
    );
  }

  const reservations = await getReservations({ userId: currentUser.id });

  if (reservations.length === 0) {
    return (
      <ClientOnly>
        <EmptyState
          title="No trips found"
          subtitle="Looks like you havent reserved any trips."
        />
      </ClientOnly>
    );
  }


  return (
    <ClientOnly>
      <TripsClient
   reservations={reservations}
        currentUser={currentUser}
      />
    </ClientOnly>
  );
}
 
export default TripsPage;