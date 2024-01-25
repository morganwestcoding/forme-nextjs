
import EmptyState from "@/components/EmptyState";
import ClientProviders from "@/components/ClientProviders";

import getCurrentUser from "@/app/actions/getCurrentUser";
import getReservations from "@/app/actions/getReservations";

import TripsClient from "./TripsClient";

const TripsPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <ClientProviders>
        <EmptyState
          title="Unauthorized"
          subtitle="Please login"
        />
      </ClientProviders>
    );
  }

  const reservations = await getReservations({ userId: currentUser.id });

  if (reservations.length === 0) {
    return (
      <ClientProviders>
        <EmptyState
          title="No trips found"
          subtitle="Looks like you havent reserved any trips."
        />
      </ClientProviders>
    );
  }

  return (
    <ClientProviders>
      <TripsClient
        reservations={reservations}
        currentUser={currentUser}
      />
    </ClientProviders>
  );
}
 
export default TripsPage;