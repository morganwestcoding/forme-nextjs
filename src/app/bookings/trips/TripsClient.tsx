// TripsClient.tsx
'use client';

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SafeReservation, SafeUser } from "@/app/types";
import ReserveCard from "@/components/listings/ReserveCard";
import SectionHeader from "@/app/market/SectionHeader";
import PropagateLoaderWrapper from "@/components/loaders/PropagateLoaderWrapper";

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
  const [isLoading, setIsLoading] = useState(true);

  // Initialize loader
  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

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
      {/* Content + loader overlay */}
      <div className="relative">
        {isLoading && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center">
            <div className="mt-40 md:mt-40">
              <PropagateLoaderWrapper size={12} speedMultiplier={1.15} />
            </div>
          </div>
        )}

        <div
          className={`transition-opacity duration-700 ease-out ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {filteredReservations.length > 0 ? (
            <>
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
                      disabled={deletingId === reservation.id}
                      onCancel={() => onCancel(reservation.id)}
                      showCancel={true}
                      onCardClick={() => router.push(`/listings/${reservation.listing.id}`)}
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="px-8 pt-24 text-center text-gray-500">
              No trips found. Try adjusting your filters.
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 20px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}

export default TripsClient;