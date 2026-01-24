// ReservationsPage.tsx
import ClientOnly from "@/components/ClientOnly";
import ReservationsClient from "./ReservationsClient";


import getCurrentUser from "@/app/actions/getCurrentUser";
import getReservations from "@/app/actions/getReservations";

interface ReservationsPageProps {
  searchParams: { page?: string }
}

const ReservationsPage = async ({ searchParams }: ReservationsPageProps) => {
  const currentUser = await getCurrentUser();

  // Fetch both incoming (reservations on user's listings) and outgoing (reservations user made)
  const [incomingReservations, outgoingReservations] = currentUser?.id
    ? await Promise.all([
        getReservations({ authorId: currentUser.id }),
        getReservations({ userId: currentUser.id }),
      ])
    : [[], []];

  return (
    <ClientOnly>


        <ReservationsClient
          incomingReservations={incomingReservations || []}
          outgoingReservations={outgoingReservations || []}
          currentUser={currentUser}
        />

    </ClientOnly>
  );
}
 
export default ReservationsPage;