
import EmptyState from "@/components/EmptyState";

import getCurrentUser from "@/app/actions/getCurrentUser";
import getReservations from "@/app/actions/getReservations";

import ReservationsClient from "./ReservationsClient";

import ClientOnly from "@/components/ClientOnly";
import ClientProviders from "@/components/ClientProviders";


export const dynamic = 'force-dynamic';

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
      <ReservationsClient
        reservations={reservations}
        currentUser={currentUser}
      />
    </ClientProviders>
  );
}
 
export default ReservationsPage;