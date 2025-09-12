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
  const reservations = await getReservations({ authorId: currentUser?.id });

  return (
    <ClientOnly>
  
        
        <ReservationsClient
          reservations={reservations || []}
          currentUser={currentUser}
        />
  
    </ClientOnly>
  );
}
 
export default ReservationsPage;