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

interface ReservationsClientProps {
  incomingReservations: SafeReservation[];
  outgoingReservations: SafeReservation[];
  currentUser?: SafeUser | null;
}

type BookingTab = 'incoming' | 'outgoing';
type TimeTab = 'upcoming' | 'past';

const ReservationsClient: React.FC<ReservationsClientProps> = ({
  incomingReservations,
  outgoingReservations,
  currentUser,
}) => {
  const router = useRouter();
  const [processingId, setProcessingId] = useState('');
  const isSidebarCollapsed = useSidebarState();
  const [directionTab, setDirectionTab] = useState<BookingTab>('incoming');
  const [timeTab, setTimeTab] = useState<TimeTab>('upcoming');

  const gridColsClass = isSidebarCollapsed
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3';

  const onAccept = useCallback(async (id: string) => {
    setProcessingId(id);
    try {
      await axios.patch(`/api/reservations/${id}`, { action: 'accept' });
      toast.success('Reservation accepted');
      router.refresh();
    } catch { toast.error('Something went wrong.'); }
    finally { setProcessingId(''); }
  }, [router]);

  const onDecline = useCallback(async (id: string) => {
    setProcessingId(id);
    try {
      await axios.delete(`/api/reservations/${id}`);
      toast.success('Reservation declined');
      router.refresh();
    } catch { toast.error('Something went wrong.'); }
    finally { setProcessingId(''); }
  }, [router]);

  const onCancel = useCallback(async (id: string) => {
    setProcessingId(id);
    try {
      await axios.delete(`/api/reservations/${id}`);
      toast.success('Reservation cancelled');
      router.refresh();
    } finally { setProcessingId(''); }
  }, [router]);

  const onRefund = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to request a refund?')) return;
    setProcessingId(id);
    try {
      const res = await axios.post(`/api/reservations/${id}/refund`, {
        reason: 'Customer requested refund',
      });
      if (res.data.status === 'completed') {
        toast.success('Refund processed successfully');
      } else {
        toast.success('Refund request submitted');
      }
      router.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to process refund');
    } finally {
      setProcessingId('');
    }
  }, [router]);

  const baseReservations = useMemo(() => {
    return directionTab === 'outgoing' ? outgoingReservations : incomingReservations;
  }, [directionTab, incomingReservations, outgoingReservations]);

  // Time filter
  const now = new Date();
  const filteredReservations = useMemo(() => {
    return baseReservations.filter(r =>
      timeTab === 'upcoming' ? new Date(r.date) >= now : new Date(r.date) < now
    );
  }, [baseReservations, timeTab]);

  const totalCount = filteredReservations.length;

  return (
    <Container>
      <PageHeader currentUser={currentUser} />

      <div className="mt-8">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Bookings</h1>
          <p className="text-[14px] text-stone-400 mt-1">{totalCount} {totalCount === 1 ? 'reservation' : 'reservations'}</p>
        </div>

        {/* Tab bars */}
        <div className="flex items-center gap-6 mb-8">
          {/* Direction tabs */}
          <div className="flex items-center gap-2">
            {(['incoming', 'outgoing'] as BookingTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setDirectionTab(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition-all whitespace-nowrap ${
                  directionTab === tab
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-50 text-stone-500 hover:bg-stone-100 border border-stone-200/60'
                }`}
              >
                {tab === 'incoming' ? 'Incoming' : 'Outgoing'}
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-stone-200" />

          {/* Time tabs */}
          <div className="flex items-center gap-2">
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
        </div>

        {/* Content */}
        {filteredReservations.length > 0 ? (
          <div className={`grid ${gridColsClass} gap-5`}>
            {filteredReservations.map((reservation, idx) => (
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
                  disabled={processingId === reservation.id}
                  onAccept={() => onAccept(reservation.id)}
                  onDecline={() => onDecline(reservation.id)}
                  onCancel={() => onCancel(reservation.id)}
                  onRefund={() => onRefund(reservation.id)}
                  showAcceptDecline={directionTab === 'incoming'}
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
              No {timeTab} {directionTab} reservations
            </p>
            <p className="text-[13px] text-stone-400 max-w-xs">
              {timeTab === 'upcoming'
                ? 'When you receive new bookings, they\'ll appear here.'
                : 'Your completed reservations will show up here.'}
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}

export default ReservationsClient;
