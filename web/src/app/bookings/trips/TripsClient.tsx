'use client';

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SafeReservation, SafeUser } from "@/app/types";
import Container from "@/components/Container";
import ReserveCard from "@/components/listings/ReserveCard";
import PageHeader from "@/components/PageHeader";
import { useSidebarState } from "@/app/hooks/useSidebarState";

interface TripsClientProps {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
}

type TimeTab = 'upcoming' | 'past';

const TripsClient: React.FC<TripsClientProps> = ({
  reservations,
  currentUser,
}) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState('');
  const isSidebarCollapsed = useSidebarState();
  const [timeTab, setTimeTab] = useState<TimeTab>('upcoming');

  const gridColsClass = isSidebarCollapsed
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3';

  const onCancel = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      await axios.delete(`/api/reservations/${id}`);
      toast.success('Trip cancelled');
      router.refresh();
    } catch { toast.error('Something went wrong.'); }
    finally { setDeletingId(''); }
  }, [router]);

  // Time filter
  const now = new Date();
  const filteredTrips = useMemo(() => {
    return reservations.filter(r =>
      timeTab === 'upcoming' ? new Date(r.date) >= now : new Date(r.date) < now
    );
  }, [reservations, timeTab]);

  const totalCount = filteredTrips.length;

  return (
    <Container>
      <PageHeader currentUser={currentUser} />

      <div className="mt-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">My Trips</h1>
          <p className="text-[14px] text-stone-400 mt-1">{totalCount} {totalCount === 1 ? 'trip' : 'trips'}</p>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-2 mb-8">
          {(['upcoming', 'past'] as TimeTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setTimeTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${
                timeTab === tab
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-50 text-stone-500 hover:bg-stone-100 border border-stone-200/60'
              }`}
            >
              {tab === 'upcoming' ? 'Upcoming' : 'Past'}
            </button>
          ))}
        </div>

        {/* Content */}
        {filteredTrips.length > 0 ? (
          <div className={`grid ${gridColsClass} gap-5`}>
            {filteredTrips.map((reservation, idx) => (
              <div
                key={reservation.id}
                style={{
                  opacity: 0,
                  animation: 'fadeInUp 520ms ease-out both',
                  animationDelay: `${Math.min(60 + idx * 30, 360)}ms`,
                }}
              >
                <ReserveCard
                  reservation={reservation}
                  listing={reservation.listing}
                  currentUser={currentUser}
                  disabled={deletingId === reservation.id}
                  onCancel={() => onCancel(reservation.id)}
                  onCardClick={() => router.push(`/listings/${reservation.listing.id}`)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-5">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-stone-400">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p className="text-[15px] font-medium text-stone-700 mb-1">
              No {timeTab} trips
            </p>
            <p className="text-[13px] text-stone-400 max-w-xs">
              {timeTab === 'upcoming'
                ? 'Book a service to see your upcoming trips here.'
                : 'Your completed trips will show up here.'}
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}

export default TripsClient;
