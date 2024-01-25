
import EmptyState from "@/components/EmptyState";
import ClientProviders from "@/components/ClientProviders";

import getCurrentUser from "@/app/actions/getCurrentUser";
import getReservations from "@/app/actions/getReservations";

import TripsClient from "./ReservationsClient";

const ReservationsPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return (
      <ClientProviders> 
        <EmptyState
          title="Unauthorized"
          subtitle="Please login"
        />
      </ClientProviders>
    )
  }

  const reservations = await getReservations({ authorId: currentUser.id });

  if (reservations.length === 0) {
    return (
      <ClientProviders>
        <EmptyState
          title="No reservations found"
          subtitle="Looks like you have no reservations on your properties."
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
 
export default ReservationsPage;