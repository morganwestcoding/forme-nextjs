// app/reservations/page.tsx
import ClientOnly from "@/components/ClientOnly";
import EmptyState from "@/components/EmptyState";
import ReservationsClient from "./ReservationsClient";

import getCurrentUser from "@/app/actions/getCurrentUser";
import getReservations from "@/app/actions/getReservations";

interface ReservationsPageProps {
  searchParams: { page?: string }
}

const ReservationsPage = async ({ searchParams }: ReservationsPageProps) => {
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

  const currentPage = Number(searchParams?.page) || 1;
  const ITEMS_PER_PAGE = 3;

  const reservations = await getReservations({ authorId: currentUser.id });
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedReservations = reservations.slice(startIndex, endIndex);
  const totalPages = Math.ceil(reservations.length / ITEMS_PER_PAGE);

  if (reservations.length === 0) {
    return (
      <ClientOnly>
        <EmptyState
          title="No reservations found"
          subtitle="Looks like you have no reservations on your properties."
        />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <ReservationsClient
        reservations={paginatedReservations}
        currentUser={currentUser}
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={reservations.length}
      />
    </ClientOnly>
  );
}
 
export default ReservationsPage;