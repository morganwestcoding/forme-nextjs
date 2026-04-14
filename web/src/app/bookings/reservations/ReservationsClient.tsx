'use client';

import { toast } from 'react-hot-toast';
import axios from 'axios';
import Image from 'next/image';
import { useCallback, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format, isToday, isTomorrow, isThisWeek, differenceInCalendarDays } from 'date-fns';
import { Calendar as CalendarIcon, Clock, MapPin, Inbox, ArrowUpRight } from 'lucide-react';

import { SafeReservation, SafeUser } from '@/app/types';
import Container from '@/components/Container';
import ReserveCard from '@/components/listings/ReserveCard';
import PageHeader from '@/components/PageHeader';
import { useSidebarState } from '@/app/hooks/useSidebarState';
import { placeholderDataUri } from '@/lib/placeholders';

interface ReservationsClientProps {
  incomingReservations: SafeReservation[];
  outgoingReservations: SafeReservation[];
  currentUser?: SafeUser | null;
}

type BookingTab = 'incoming' | 'outgoing';
type TimeTab = 'upcoming' | 'past';

const formatTime = (t: string) => {
  try { return format(new Date(`2021-01-01T${t}`), 'h:mm a'); }
  catch { return t; }
};

const ReservationsClient: React.FC<ReservationsClientProps> = ({
  incomingReservations,
  outgoingReservations,
  currentUser,
}) => {
  const router = useRouter();
  const [processingId, setProcessingId] = useState('');
  const isSidebarCollapsed = useSidebarState();
  const [directionTab, setDirectionTab] = useState<BookingTab>('outgoing');
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
      if (res.data.status === 'completed') toast.success('Refund processed successfully');
      else toast.success('Refund request submitted');
      router.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to process refund');
    } finally { setProcessingId(''); }
  }, [router]);

  const baseReservations = directionTab === 'outgoing' ? outgoingReservations : incomingReservations;

  const now = new Date();
  const filteredReservations = useMemo(() => {
    return baseReservations
      .filter(r => timeTab === 'upcoming' ? new Date(r.date) >= now : new Date(r.date) < now)
      .sort((a, b) =>
        timeTab === 'upcoming'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }, [baseReservations, timeTab, now]);

  const upcomingAll = useMemo(
    () => baseReservations.filter(r => new Date(r.date) >= now),
    [baseReservations, now]
  );

  // Group upcoming by Today / Tomorrow / This week / Later
  const grouped = useMemo(() => {
    if (timeTab !== 'upcoming') return null;
    const today: SafeReservation[] = [];
    const tomorrow: SafeReservation[] = [];
    const thisWeek: SafeReservation[] = [];
    const later: SafeReservation[] = [];
    for (const r of filteredReservations) {
      const d = new Date(r.date);
      if (isToday(d)) today.push(r);
      else if (isTomorrow(d)) tomorrow.push(r);
      else if (isThisWeek(d, { weekStartsOn: 1 })) thisWeek.push(r);
      else later.push(r);
    }
    return { today, tomorrow, thisWeek, later };
  }, [filteredReservations, timeTab]);

  // Stats
  const nextUp = upcomingAll[0]
    ? [...upcomingAll].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
    : null;

  const upcomingThisWeekCount = useMemo(
    () => upcomingAll.filter(r => isThisWeek(new Date(r.date), { weekStartsOn: 1 })).length,
    [upcomingAll]
  );

  const totalValue = useMemo(
    () => upcomingAll.reduce((sum, r) => sum + (r.totalPrice || 0), 0),
    [upcomingAll]
  );

  const pendingCount = useMemo(
    () => baseReservations.filter(r => r.status === 'pending' && new Date(r.date) >= now).length,
    [baseReservations, now]
  );

  const renderCard = (reservation: SafeReservation, idx: number) => (
    <div
      key={reservation.id}
      style={{
        opacity: 0,
        animation: 'fadeInUp 520ms ease-out both',
        animationDelay: `${Math.min(40 + idx * 25, 320)}ms`,
      }}
      className="rounded-2xl bg-white border border-stone-200/60 p-4 hover:border-stone-300/80 transition-colors"
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
  );

  return (
    <Container>
      <PageHeader currentUser={currentUser} />

      <div className="mt-6 sm:mt-8">
        {/* Title row */}
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] sm:text-[32px] font-semibold text-stone-900 tracking-tight leading-tight">
              Bookings
            </h1>
            <p className="text-[13px] text-stone-400 mt-1">
              {upcomingAll.length} upcoming · {filteredReservations.length} {timeTab}
            </p>
          </div>

          {/* Direction segmented control */}
          <div className="inline-flex items-center p-1 rounded-full bg-stone-100 border border-stone-200/60">
            {(['outgoing', 'incoming'] as BookingTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setDirectionTab(tab)}
                className={`px-4 py-1.5 text-[12px] font-medium rounded-full transition-all ${
                  directionTab === tab
                    ? 'bg-white text-stone-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {tab === 'outgoing' ? 'Mine' : 'Incoming'}
              </button>
            ))}
          </div>
        </div>

        {/* Featured "Next up" card */}
        {nextUp && timeTab === 'upcoming' && (
          <NextUpCard
            reservation={nextUp}
            onClick={() => router.push(`/listings/${nextUp.listing.id}`)}
          />
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <StatCard
            label="Upcoming"
            value={upcomingAll.length}
            sub={upcomingThisWeekCount ? `${upcomingThisWeekCount} this week` : 'Nothing this week'}
          />
          <StatCard
            label={directionTab === 'incoming' ? 'Pending action' : 'Pending'}
            value={pendingCount}
            sub={pendingCount ? 'Awaiting confirmation' : 'All clear'}
            tone={pendingCount > 0 ? 'amber' : 'default'}
          />
          <StatCard
            label={directionTab === 'incoming' ? 'Upcoming revenue' : 'Upcoming spend'}
            value={`$${totalValue.toLocaleString()}`}
            sub={upcomingAll.length ? `Across ${upcomingAll.length}` : '—'}
            className="hidden sm:flex"
          />
        </div>

        {/* Time filter */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-1.5">
            {(['upcoming', 'past'] as TimeTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setTimeTab(tab)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                  timeTab === tab
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                }`}
              >
                {tab === 'upcoming' ? 'Upcoming' : 'Past'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {filteredReservations.length === 0 ? (
          <EmptyState
            timeTab={timeTab}
            directionTab={directionTab}
            onBrowse={() => router.push('/')}
          />
        ) : grouped ? (
          <div className="space-y-10">
            <Group title="Today" items={grouped.today} gridClass={gridColsClass} render={renderCard} />
            <Group title="Tomorrow" items={grouped.tomorrow} gridClass={gridColsClass} render={renderCard} />
            <Group title="This week" items={grouped.thisWeek} gridClass={gridColsClass} render={renderCard} />
            <Group title="Later" items={grouped.later} gridClass={gridColsClass} render={renderCard} />
          </div>
        ) : (
          <div className={`grid ${gridColsClass} gap-4`}>
            {filteredReservations.map(renderCard)}
          </div>
        )}
      </div>
    </Container>
  );
};

export default ReservationsClient;

/* ------------------------------ subcomponents ------------------------------ */

function NextUpCard({
  reservation,
  onClick,
}: {
  reservation: SafeReservation;
  onClick: () => void;
}) {
  const date = new Date(reservation.date);
  const daysAway = differenceInCalendarDays(date, new Date());
  const countdown =
    daysAway === 0 ? 'Today' :
    daysAway === 1 ? 'Tomorrow' :
    daysAway < 7 ? `In ${daysAway} days` :
    format(date, 'MMM d');

  const img = reservation.listing.imageSrc
    || reservation.listing.galleryImages?.[0]
    || placeholderDataUri(reservation.listing.title || 'Booking');

  return (
    <button
      onClick={onClick}
      className="group relative w-full rounded-3xl overflow-hidden mb-6 text-left"
    >
      <div className="relative h-[200px] sm:h-[220px] w-full">
        <Image
          src={img}
          alt={reservation.listing.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 h-6 rounded-full bg-white/95 backdrop-blur text-[11px] font-semibold text-stone-900 tracking-wide">
            NEXT UP
          </span>
          <span className="inline-flex items-center px-2.5 h-6 rounded-full bg-white/15 backdrop-blur border border-white/20 text-[11px] font-medium text-white">
            {countdown}
          </span>
        </div>

        <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="w-4 h-4" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
          <div className="text-[12px] uppercase tracking-wider text-white/70">
            {reservation.serviceName}
          </div>
          <h2 className="text-[22px] sm:text-[26px] font-semibold leading-tight mt-1 line-clamp-1">
            {reservation.listing.title}
          </h2>
          <div className="flex items-center gap-4 mt-3 text-[13px] text-white/85">
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" strokeWidth={1.75} />
              {format(date, 'EEE, MMM d')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" strokeWidth={1.75} />
              {formatTime(reservation.time)}
            </span>
            {reservation.listing.address && (
              <span className="hidden sm:inline-flex items-center gap-1.5 max-w-[260px] truncate">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
                <span className="truncate">{reservation.listing.address}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function StatCard({
  label,
  value,
  sub,
  tone = 'default',
  className = '',
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: 'default' | 'amber';
  className?: string;
}) {
  const valueColor = tone === 'amber' && Number(value) > 0 ? 'text-amber-600' : 'text-stone-900';
  return (
    <div className={`rounded-2xl bg-white border border-stone-200/60 p-4 flex flex-col ${className}`}>
      <span className="text-[11px] uppercase tracking-wider text-stone-400 font-medium">{label}</span>
      <span className={`text-[24px] font-semibold tabular-nums mt-1.5 ${valueColor}`}>{value}</span>
      {sub && <span className="text-[12px] text-stone-400 mt-0.5">{sub}</span>}
    </div>
  );
}

function Group({
  title,
  items,
  gridClass,
  render,
}: {
  title: string;
  items: SafeReservation[];
  gridClass: string;
  render: (r: SafeReservation, idx: number) => React.ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-3">
        <h2 className="text-[15px] font-semibold text-stone-900">{title}</h2>
        <span className="text-[12px] text-stone-400">{items.length}</span>
      </div>
      <div className={`grid ${gridClass} gap-4`}>
        {items.map(render)}
      </div>
    </section>
  );
}

function EmptyState({
  timeTab,
  directionTab,
  onBrowse,
}: {
  timeTab: TimeTab;
  directionTab: BookingTab;
  onBrowse: () => void;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-200 bg-white py-20 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-stone-100 mx-auto flex items-center justify-center mb-5">
        <Inbox className="w-6 h-6 text-stone-400" strokeWidth={1.5} />
      </div>
      <p className="text-[15px] font-medium text-stone-800">
        No {timeTab} {directionTab === 'incoming' ? 'reservations' : 'bookings'}
      </p>
      <p className="text-[13px] text-stone-400 mt-1.5 max-w-xs mx-auto">
        {timeTab === 'upcoming'
          ? directionTab === 'incoming'
            ? "When clients book your services, they'll appear here."
            : "Book a service to see your trips here."
          : `Your past ${directionTab === 'incoming' ? 'reservations' : 'bookings'} will appear here.`}
      </p>
      {timeTab === 'upcoming' && directionTab === 'outgoing' && (
        <button
          onClick={onBrowse}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-white text-[13px] font-medium hover:bg-stone-800 transition-colors"
        >
          Browse services
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
