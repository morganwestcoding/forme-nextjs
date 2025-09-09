// TripsClient.tsx
'use client';

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SafeReservation, SafeUser } from "@/app/types";
import ReserveCard from "@/components/listings/ReserveCard";
import SectionHeader from "@/app/market/SectionHeader";

interface TripsClientProps {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
}

const TripsClient: React.FC<TripsClientProps> = ({
  reservations,
  currentUser,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deletingId, setDeletingId] = useState('');

  // Get selected categories from URL
  const selectedCategories = searchParams?.get('categories')?.split(',').filter(Boolean) || [];

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

  // Filter reservations based on selected categories
  const filteredReservations = reservations.filter(reservation => {
    if (selectedCategories.length === 0) return true;
    
    return selectedCategories.some(category => {
      if (category === 'outgoing') return true; // This is outgoing view
      if (category === 'incoming') return false; // Filter out incoming in outgoing view
      return reservation.status === category;
    });
  });

  // Generate section header based on active filters
  const getSectionHeader = () => {
    if (selectedCategories.length === 0) {
      return "All Outgoing Trips";
    }
    
    const statusFilters = selectedCategories.filter(cat => !['incoming', 'outgoing'].includes(cat));
    const hasOutgoing = selectedCategories.includes('outgoing');
    
    if (statusFilters.length > 0) {
      const statusText = statusFilters.map(status => 
        status.charAt(0).toUpperCase() + status.slice(1)
      ).join(' & ');
      return hasOutgoing ? `${statusText} Outgoing Trips` : `${statusText} Trips`;
    }
    
    return hasOutgoing ? "Outgoing Trips" : "Filtered Trips";
  };

  return (
    <div className="pt-2 flex-1">
      {/* Section Header */}
      <SectionHeader 
        title={getSectionHeader()}
        accent="#60A5FA"
        className="px-4"
      />
      
      <div className="px-4 mb-6">
        <p className="text-sm text-gray-600">{filteredReservations.length} trips found</p>
      </div>

      {/* 4 per row grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 pb-8">
        {filteredReservations.map((reservation) => (
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

      {filteredReservations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No trips match your current filters.</p>
        </div>
      )}
    </div>
  );
}

export default TripsClient;