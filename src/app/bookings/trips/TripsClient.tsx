'use client';

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { SafeReservation, SafeUser } from "@/app/types";
import ReserveCard from "@/components/listings/ReserveCard";

interface TripsClientProps {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
}

const TripsClient: React.FC<TripsClientProps> = ({
  reservations,
  currentUser,
}) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState('');

  const onCancel = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      await axios.delete(`/api/reservations/${id}`);
      toast.success('Reservation cancelled');
      router.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Something went wrong.');
    } finally {
      setDeletingId('');
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
            disabled={deletingId === reservation.id}
            onCancel={() => onCancel(reservation.id)}
            showCancel={true}            // sender/outgoing mode
            onCardClick={() => router.push(`/listings/${reservation.listing.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

export default TripsClient;
