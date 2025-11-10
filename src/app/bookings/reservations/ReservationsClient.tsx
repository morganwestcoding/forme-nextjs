// ReservationsClient.tsx
'use client';

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SafeReservation, SafeUser } from "@/app/types";
import ReserveCard from "@/components/listings/ReserveCard";
import SectionHeader from "@/app/market/SectionHeader";
import PropagateLoaderWrapper from "@/components/loaders/PropagateLoaderWrapper";

interface ReservationsClientProps {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
}

const ReservationsClient: React.FC<ReservationsClientProps> = ({
  reservations,
  currentUser,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [processingId, setProcessingId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize loader
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // Get selected categories from URL
  const selectedCategories = searchParams?.get('categories')?.split(',').filter(Boolean) || [];

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
    } finally {
      setProcessingId('');
    }
  }, [router]);

  // Filter reservations based on selected categories
  const filteredReservations = reservations.filter(reservation => {
    if (selectedCategories.length === 0) return true;
    
    return selectedCategories.some(category => {
      if (category === 'incoming') return true; // This is incoming view
      if (category === 'outgoing') return false; // Filter out outgoing in incoming view
      return reservation.status === category;
    });
  });

  // Generate section header based on active filters
  const getSectionHeader = () => {
    if (selectedCategories.length === 0) {
      return "All Incoming Reservations";
    }
    
    const statusFilters = selectedCategories.filter(cat => !['incoming', 'outgoing'].includes(cat));
    const hasIncoming = selectedCategories.includes('incoming');
    
    if (statusFilters.length > 0) {
      const statusText = statusFilters.map(status => 
        status.charAt(0).toUpperCase() + status.slice(1)
      ).join(' & ');
      return hasIncoming ? `${statusText} Incoming Reservations` : `${statusText} Reservations`;
    }
    
    return hasIncoming ? "Incoming Reservations" : "Filtered Reservations";
  };

  // Show loader
  if (isLoading) {
    return (
      <div className="pt-2 flex-1">
        <div className="flex items-start justify-center">
          <div className="mt-32 md:mt-32">
            <PropagateLoaderWrapper size={12} speedMultiplier={1.15} />
          </div>
        </div>
      </div>
    );
  }

  // No results
  if (filteredReservations.length === 0) {
    return (
      <div className="pt-2 flex-1">
        <div className="px-8 pt-24 text-center text-gray-500">
          No reservations found. Try adjusting your filters.
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="pt-2 flex-1">
      <div
        style={{
          opacity: 0,
          animation: `fadeInUp 520ms ease-out forwards`,
          animationDelay: `100ms`,
        }}
      >
        <SectionHeader 
          title={getSectionHeader()}
          accent="#60A5FA"
          className="px-4"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 pb-8">
        {filteredReservations.map((reservation, idx) => (
          <div
            key={reservation.id}
            style={{
              opacity: 0,
              animation: `fadeInUp 520ms ease-out forwards`,
              animationDelay: `${140 + (idx % 12) * 30}ms`,
            }}
          >
            <ReserveCard
              reservation={reservation}
              listing={reservation.listing}
              currentUser={currentUser}
              disabled={processingId === reservation.id}
              onAccept={() => onAccept(reservation.id)}
              onDecline={() => onDecline(reservation.id)}
              onCancel={() => onCancel(reservation.id)}
              showAcceptDecline={true}
              onCardClick={() => router.push(`/listings/${reservation.listing.id}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReservationsClient;