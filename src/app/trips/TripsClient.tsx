'use client';

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { categories } from '@/components/Categories';
import { SafeReservation, SafeUser } from "@/app/types";
import Container from "@/components/Container";
import Pagination from "@/components/pagination/Pagination";

import Heading from "@/components/Heading";
import ListingCard from "@/components/listings/ListingCard";


interface TripsClientProps {
  reservations: SafeReservation[],
  currentUser?: SafeUser | null,
  currentPage: number;
  totalPages: number;
  totalResults: number;
}

const ITEMS_PER_PAGE = 3; 

export const dynamic = 'force-dynamic';

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
    <Container>
      <div className="pt-2 flex-1">
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
        {reservations.map((reservation: any) => (
          <ListingCard
            categories={categories}
            key={reservation.id}
            data={reservation.listing}
            reservation={reservation}
            actionId={reservation.id}
            onAction={onCancel}
            disabled={deletingId === reservation.id}
            actionLabel="Cancel reservation"
            currentUser={currentUser}
          />
        ))}
      </div>
      </div>
    </Container>
   );
}
 
export default TripsClient;