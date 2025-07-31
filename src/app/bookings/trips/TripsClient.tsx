'use client';

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { SafeReservation, SafeUser } from "@/app/types";
import Heading from "@/components/Heading";
import ReserveCard from "@/components/listings/ReserveCard";
import Pagination from "@/components/pagination/Pagination";

interface TripsClientProps {
  reservations: SafeReservation[],
  currentUser?: SafeUser | null,
  currentPage: number;
  totalPages: number;
  totalResults: number;
}

const TripsClient: React.FC<TripsClientProps> = ({
  reservations,
  currentUser,
  currentPage,
  totalPages,
  totalResults
}) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState('');

  const onCancel = useCallback((id: string) => {
    setDeletingId(id);

    axios.delete(`/api/reservations/${id}`)
    .then(() => {
      toast.success('Reservation cancelled');
      router.refresh();
    })
    .catch((error) => {
      toast.error(error?.response?.data?.error)
    })
    .finally(() => {
      setDeletingId('');
    })
  }, [router]);

  return (
    <div className="pt-2 flex-1">
      <div className="px-4"> 
        <Heading
          title={`Trips (${totalResults})`}
          subtitle="Your bookings at other locations"
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
            disabled={deletingId === reservation.id}
            onCancel={() => onCancel(reservation.id)}
            showCancel={true}
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
 
export default TripsClient;