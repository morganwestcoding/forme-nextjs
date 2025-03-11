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

const ITEMS_PER_PAGE = 3;

export const dynamic = 'force-dynamic';

const TripsPage = async ({ searchParams }: TripsPageProps) => {
  const currentUser = await getCurrentUser();
  const currentPage = Number(searchParams?.page) || 1;

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

  const totalPages = Math.ceil(reservations.length / ITEMS_PER_PAGE);
  const paginatedReservations = reservations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <ClientOnly>
      <TripsClient
        reservations={paginatedReservations}
        currentUser={currentUser}
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={reservations.length}
      />
    </ClientOnly>
  );
}
 
export default TripsPage;