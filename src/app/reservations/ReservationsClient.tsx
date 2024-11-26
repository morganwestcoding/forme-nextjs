'use client';

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { categories } from '@/components/Categories';
import { SafeReservation, SafeUser } from "@/app/types";
import ListingCard from "@/components/listings/ListingCard";
import ClientProviders from "@/components/ClientProviders";
import Container from "@/components/Container";

interface ReservationsClientProps {
  reservations: SafeReservation[],
  currentUser?: SafeUser | null,
}

const ReservationsClient: React.FC<ReservationsClientProps> = ({
  reservations,
  currentUser
}) => {
  const router = useRouter();
  const [processingId, setProcessingId] = useState('');

  console.log('Reservations:', reservations);

  const onAccept = useCallback(async (id: string) => {
    console.log('Before Accept - Reservation:', reservations.find(r => r.id === id));
    setProcessingId(id);
    try {
      await axios.patch(`/api/reservations/${id}`, { action: 'accept' });
      console.log('Reservation accepted successfully');
      toast.success('Reservation accepted');
      router.refresh();
    } catch (error) {
      console.error('Accept error:', error);
      toast.error('Something went wrong.');
    } finally {
      setProcessingId('');
    }
  }, [router, reservations]);

const onDecline = useCallback(async (id: string) => {
  setProcessingId(id);
  try {
    await axios.delete(`/api/reservations/${id}`);
    toast.success('Reservation declined');
    router.refresh();
  } catch (error) {
    toast.error('Something went wrong.');
  } finally {
    setProcessingId('');
  }
}, [router]);

  return (
    <Container>
    <ClientProviders>
      <div className="pt-2 flex-1">
        <div className="pt-6 grid grid-cols-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {reservations.map((reservation: any) => (
            <ListingCard
              key={reservation.id}
              data={reservation.listing}
              reservation={reservation}
              actionId={reservation.id}
              disabled={processingId === reservation.id}
              currentUser={currentUser}
              categories={categories}
              onAccept={() => onAccept(reservation.id)}
              onDecline={() => onDecline(reservation.id)}
              showAcceptDecline={true}
            />
          ))}
        </div>
      </div>
    </ClientProviders>
    </Container>
  );
}

export default ReservationsClient;