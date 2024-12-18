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
import Pagination from "@/components/pagination/Pagination";

interface ReservationsClientProps {
  reservations: SafeReservation[],
  currentUser?: SafeUser | null,
  currentPage: number;
  totalPages: number;
  totalResults: number;
}

const ITEMS_PER_PAGE = 3; 

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
    <Container>
      <ClientProviders>
        <div className="pt-2 flex-1">
          <div 
            className="
              pt-6 
              grid 
              grid-cols-1 
              sm:grid-cols-2 
              md:grid-cols-3
              lg:grid-cols-3
              gap-9
              mb-32
            "
          >
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
          <div className="flex justify-center w-full pt-6">
          <div className="w-[500px]">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalResults={totalResults}
            />
          </div>
        </div>
      </div>
      </ClientProviders>
    </Container>
  );
}

export default ReservationsClient;