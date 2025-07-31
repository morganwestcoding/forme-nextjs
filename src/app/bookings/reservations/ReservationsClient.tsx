'use client';

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { SafeReservation, SafeUser } from "@/app/types";
import ReserveCard from "@/components/listings/ReserveCard";
import Heading from "@/components/Heading";
import Pagination from "@/components/pagination/Pagination";

interface ReservationsClientProps {
  reservations: SafeReservation[],
  currentUser?: SafeUser | null,
  currentPage: number;
  totalPages: number;
  totalResults: number;
}

const ReservationsClient: React.FC<ReservationsClientProps> = ({
  reservations,
  currentUser,
  currentPage,
  totalPages,
  totalResults
}) => {
  const router = useRouter();
  const [processingId, setProcessingId] = useState('');

  const onAccept = useCallback(async (id: string) => {
    setProcessingId(id);
    try {
      await axios.patch(`/api/reservations/${id}`, { action: 'accept' });
      toast.success('Reservation accepted');
      router.refresh();
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setProcessingId('');
    }
  }, [router]);

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
    <div className="pt-2 flex-1">
      <div className="px-4"> 
        <Heading
          title={`Reservations (${totalResults})`}
          subtitle="Bookings received for your listings"
        />
      </div>
      <div 
        className="
        pt-6
        flex-1
        grid 
        grid-cols-1
        lg:grid-cols-2
        xl:grid-cols-3
        2xl:grid-cols-3
        gap-4
        px-4
        "
      >
        {reservations.map((reservation: SafeReservation) => (
          <ReserveCard
            key={reservation.id}
            reservation={reservation}
            listing={reservation.listing}
            currentUser={currentUser}
            disabled={processingId === reservation.id}
            onAccept={() => onAccept(reservation.id)}
            onDecline={() => onDecline(reservation.id)}
            showAcceptDecline={true}
            onCardClick={() => router.push(`/listings/${reservation.listing.id}`)}
          />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="mt-10">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages}
            totalResults={totalResults}
          />
        </div>
      )}
    </div>
  );
}

export default ReservationsClient;