'use client';

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { SafeReservation, SafeUser } from "@/app/types";
import ReserveCard from "@/components/listings/ReserveCard";

interface ReservationsClientProps {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
}

const ReservationsClient: React.FC<ReservationsClientProps> = ({
  reservations,
  currentUser,
}) => {
  const router = useRouter();
  const [processingId, setProcessingId] = useState('');

  const onAccept = useCallback(async (id: string) => {
    setProcessingId(id);
    try {
      await axios.patch(`/api/reservations/${id}`, { action: 'accept' });
      toast.success('Reservation accepted');
      router.refresh();
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setProcessingId('');
    }
  }, [router]);

  const onDecline = useCallback(async (id: string) => {
    setProcessingId(id);
    try {
      // Your decline flow previously deleted; keep behavior consistent:
      await axios.delete(`/api/reservations/${id}`);
      toast.success('Reservation declined');
      router.refresh();
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setProcessingId('');
    }
  }, [router]);

  const onCancel = useCallback(async (id: string) => {
    setProcessingId(id);
    try {
      await axios.delete(`/api/reservations/${id}`);
      toast.success('Reservation cancelled');
      router.refresh();
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setProcessingId('');
    }
  }, [router]);

  return (
    <div className="pt-2 flex-1">
      <div className="pt-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 px-4 pb-8">
        {reservations.map((reservation) => (
          <ReserveCard
            key={reservation.id}
            reservation={reservation}
            listing={reservation.listing}
            currentUser={currentUser}
            disabled={processingId === reservation.id}
            onAccept={() => onAccept(reservation.id)}
            onDecline={() => onDecline(reservation.id)}
            onCancel={() => onCancel(reservation.id)}
            showAcceptDecline={true}     // owner/incoming mode
            onCardClick={() => router.push(`/listings/${reservation.listing.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

export default ReservationsClient;
