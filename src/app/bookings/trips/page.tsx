// TripsPage.tsx
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
  const reservations = await getReservations({ userId: currentUser?.id });

  return (
    <ClientOnly>

        <TripsClient
          reservations={reservations || []}
          currentUser={currentUser}
        />

    </ClientOnly>
  );
}
 
export default TripsPage;