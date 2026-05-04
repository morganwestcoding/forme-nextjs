'use client';

import { toast } from 'react-hot-toast';
import axios from 'axios';
import Image from 'next/image';
import { useCallback, useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  format,
  isToday,
  isTomorrow,
  isThisWeek,
  isThisMonth,
  isThisYear,
  differenceInCalendarDays,
  startOfMonth,
  isSameDay,
} from 'date-fns';

import { SafeReservation, SafeUser } from '@/app/types';
import Button from '@/components/ui/Button';
import Container from '@/components/Container';
import { placeholderDataUri } from '@/lib/placeholders';
import useReservationModal from '@/app/hooks/useReservationModal';
import { Navigation03Icon, Call02Icon, CalendarAdd02Icon, Tick02Icon, Cancel01Icon, UserAccountIcon, InboxIcon as Inbox, ArrowUpRight01Icon as ArrowUpRight, Clock01Icon as Clock, Location01Icon as MapPin, UserIcon, Cancel01Icon as X, Search01Icon as Search, Navigation03Icon as Navigation, Call02Icon as Phone, CalendarAdd02Icon as CalendarPlus, Share08Icon as Share2, StarIcon as Star, RefreshIcon as RotateCw, ArrowRight01Icon as ChevronRight, SparklesIcon as Sparkles, Tick02Icon as Check, RotateLeft03Icon as Undo2, ArrowLeftRightIcon as ArrowLeftRight } from 'hugeicons-react';

interface ReservationsClientProps {
  currentUser?: SafeUser | null;
}

type DirectionTab = 'outgoing' | 'incoming';
type TimeTab = 'upcoming' | 'past';

const TripRowSkeleton: React.FC = () => (
  <div className="relative rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800 overflow-hidden">
    <div className="relative flex items-stretch">
      {/* Date block */}
      <div className="relative flex-shrink-0 w-[96px] flex flex-col items-center justify-center py-6 bg-gradient-to-b from-stone-50/80 to-white dark:from-stone-900 dark:to-stone-900 gap-1.5">
        <div className="animate-pulse bg-stone-200/60 dark:bg-stone-800/60 rounded-md h-3 w-8" />
        <div className="animate-pulse bg-stone-200/60 dark:bg-stone-800/60 rounded-md h-9 w-8" />
        <div className="animate-pulse bg-stone-200/60 dark:bg-stone-800/60 rounded-md h-3 w-8" />
      </div>
      {/* Hairline */}
      <div className="w-px bg-gradient-to-b from-transparent via-stone-200/80 dark:via-stone-800 to-transparent" />
      {/* Main content */}
      <div className="flex-1 min-w-0 px-5 py-5 flex flex-col justify-center gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="animate-pulse bg-stone-200/60 dark:bg-stone-800/60 rounded-md h-3 w-20 mb-2" />
            <div className="animate-pulse bg-stone-200/60 dark:bg-stone-800/60 rounded-md h-5 w-48 mb-1.5" />
            <div className="animate-pulse bg-stone-200/60 dark:bg-stone-800/60 rounded-md h-3 w-36" />
          </div>
          <div className="shrink-0 text-right">
            <div className="animate-pulse bg-stone-200/60 dark:bg-stone-800/60 rounded-md h-7 w-16 mb-1.5 ml-auto" />
            <div className="animate-pulse bg-stone-200/60 dark:bg-stone-800/60 rounded-md h-3 w-12 ml-auto" />
          </div>
        </div>
        {/* Avatar + meta bottom row */}
        <div className="flex items-center gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
          <div className="animate-pulse bg-stone-200/60 dark:bg-stone-800/60 rounded-full h-8 w-8 shrink-0" />
          <div className="animate-pulse bg-stone-200/60 dark:bg-stone-800/60 rounded-md h-3 w-32" />
        </div>
      </div>
    </div>
  </div>
);

const ReservationsSkeleton: React.FC = () => (
  <div className="mt-8 pb-20">
    {/* Title + subtitle */}
    <div className="mb-8">
      <div className="animate-pulse bg-stone-200/60 dark:bg-stone-800/60 rounded-md h-8 w-32 mb-2" />
      <div className="animate-pulse bg-stone-200/60 dark:bg-stone-800/60 rounded-md h-3.5 w-48" />
    </div>

    {/* Tabs + search */}
    <div className="flex items-center gap-2 mb-8 overflow-x-hidden pb-1">
      {[{ w: 'w-32' }, { w: 'w-20' }, { w: 'w-28' }].map((tab, i) => (
        <div key={i} className={`animate-pulse bg-stone-200/60 dark:bg-stone-800/60 rounded-full h-9 ${tab.w} shrink-0`} />
      ))}
      <div className="relative ml-auto w-full sm:w-72">
        <div className="animate-pulse bg-stone-200/60 dark:bg-stone-800/60 rounded-xl h-10 w-full" />
      </div>
    </div>

    {/* Timeline groups */}
    <div className="space-y-12">
      {[
        { label: 'w-32', sub: 'w-40', rows: 3 },
        { label: 'w-28', sub: 'w-32', rows: 2 },
      ].map((group, gi) => (
        <section key={gi}>
          <div className="flex items-baseline gap-3 mb-5">
            <div className={`animate-pulse bg-stone-200/60 dark:bg-stone-800/60 rounded-md h-5 ${group.label}`} />
            <div className={`animate-pulse bg-stone-200/60 dark:bg-stone-800/60 rounded-md h-3 ${group.sub}`} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: group.rows }).map((_, i) => (
              <TripRowSkeleton key={i} />
            ))}
          </div>
        </section>
      ))}
    </div>
  </div>
);

const ReservationsClient: React.FC<ReservationsClientProps> = ({
  currentUser,
}) => {
  const router = useRouter();
  const reservationModal = useReservationModal();
  const [incomingReservations, setIncomingReservations] = useState<SafeReservation[]>([]);
  const [outgoingReservations, setOutgoingReservations] = useState<SafeReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState('');
  const [directionTab, setDirectionTab] = useState<DirectionTab>('outgoing');
  const [timeTab, setTimeTab] = useState<TimeTab>('upcoming');
  const [query, setQuery] = useState('');

  const fetchReservations = useCallback(() => {
    setLoading(true);
    axios.get('/api/reservations')
      .then(res => {
        setOutgoingReservations(res.data.outgoing || []);
        setIncomingReservations(res.data.incoming || []);
      })
      .catch(() => toast.error('Couldn’t load your bookings. Try refreshing.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const onAccept = useCallback(async (id: string) => {
    setProcessingId(id);
    try {
      await axios.patch(`/api/reservations/${id}`, { action: 'accept' });
      toast.success('Reservation accepted');
      fetchReservations();
    } catch { toast.error('Something went wrong. Please try again.'); }
    finally { setProcessingId(''); }
  }, [fetchReservations]);

  const onDecline = useCallback(async (id: string) => {
    setProcessingId(id);
    try {
      await axios.delete(`/api/reservations/${id}`);
      toast.success('Reservation declined');
      fetchReservations();
    } catch { toast.error('Something went wrong. Please try again.'); }
    finally { setProcessingId(''); }
  }, [fetchReservations]);

  const onCancel = useCallback(async (id: string) => {
    setProcessingId(id);
    try {
      await axios.delete(`/api/reservations/${id}`);
      toast.success('Booking cancelled');
      fetchReservations();
    } catch { toast.error('Something went wrong. Please try again.'); }
    finally { setProcessingId(''); }
  }, [fetchReservations]);

  const onRefund = useCallback(async (id: string) => {
    if (!confirm('Request a refund for this booking?')) return;
    setProcessingId(id);
    try {
      const res = await axios.post(`/api/reservations/${id}/refund`, {
        reason: 'Customer requested refund',
      });
      if (res.data.status === 'completed') toast.success('Refund processed');
      else toast.success('Refund request submitted');
      fetchReservations();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to process refund');
    } finally { setProcessingId(''); }
  }, [fetchReservations]);

  const baseList = directionTab === 'outgoing' ? outgoingReservations : incomingReservations;
  const now = new Date();

  const upcomingAll = useMemo(
    () =>
      baseList
        .filter((r) => new Date(r.date) >= now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [baseList, now],
  );

  const pastAll = useMemo(
    () =>
      baseList
        .filter((r) => new Date(r.date) < now)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [baseList, now],
  );

  const nextTrip = upcomingAll[0];

  const filtered = useMemo(() => {
    const base = timeTab === 'upcoming' ? upcomingAll : pastAll;
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter((r) => {
      const l = r.listing as any;
      return (
        r.serviceName?.toLowerCase().includes(q) ||
        l.title?.toLowerCase().includes(q) ||
        l.address?.toLowerCase().includes(q) ||
        r.user?.name?.toLowerCase().includes(q) ||
        (r as any).guestName?.toLowerCase().includes(q)
      );
    });
  }, [upcomingAll, pastAll, timeTab, query]);

  const timeline = useMemo(() => {
    const groups: { key: string; label: string; sublabel?: string; items: SafeReservation[] }[] = [];
    if (timeTab === 'upcoming') {
      const buckets: Record<string, SafeReservation[]> = {
        today: [], tomorrow: [], week: [], later: [],
      };
      for (const r of filtered) {
        const d = new Date(r.date);
        if (isToday(d)) buckets.today.push(r);
        else if (isTomorrow(d)) buckets.tomorrow.push(r);
        else if (isThisWeek(d, { weekStartsOn: 1 })) buckets.week.push(r);
        else buckets.later.push(r);
      }
      if (buckets.today.length) groups.push({ key: 'today', label: 'Today', sublabel: format(new Date(), 'EEE, MMM d'), items: buckets.today });
      if (buckets.tomorrow.length) groups.push({ key: 'tomorrow', label: 'Tomorrow', sublabel: format(new Date(Date.now() + 86400000), 'EEE, MMM d'), items: buckets.tomorrow });
      if (buckets.week.length) groups.push({ key: 'week', label: 'This week', items: buckets.week });
      if (buckets.later.length) groups.push({ key: 'later', label: 'Later', items: buckets.later });
    } else {
      const map = new Map<string, SafeReservation[]>();
      for (const r of filtered) {
        const d = new Date(r.date);
        const key = startOfMonth(d).toISOString();
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(r);
      }
      for (const [key, items] of map) {
        const d = new Date(key);
        groups.push({ key, label: format(d, isThisYear(d) ? 'MMMM' : 'MMMM yyyy'), items });
      }
    }
    return groups;
  }, [filtered, timeTab]);

  const stats = useMemo(() => {
    const next7 = upcomingAll.filter(
      (r) => differenceInCalendarDays(new Date(r.date), now) <= 7,
    ).length;
    const monthValue = baseList
      .filter((r) => isThisMonth(new Date(r.date)))
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    const pending = baseList.filter(
      (r) => r.status === 'pending' && new Date(r.date) >= now,
    ).length;
    return { next7, monthValue, pending };
  }, [baseList, upcomingAll, now]);

  if (loading) {
    return (
      <Container>
          <ReservationsSkeleton />
      </Container>
    );
  }

  return (
    <Container>

      <div className="mt-8 pb-20">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">Bookings</h1>
          <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
            {directionTab === 'outgoing'
              ? 'Your trips and appointments'
              : 'Requests from your customers'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide pb-1">
          {(() => {
            const incomingPending = incomingReservations.filter(
              (r) => r.status === 'pending' && new Date(r.date) >= now,
            ).length;
            const tabs: Array<{ key: string; label: string; count: number; dir: DirectionTab; time: TimeTab; attention?: boolean }> = [
              { key: 'mine-upcoming', label: 'Upcoming', count: outgoingReservations.filter((r) => new Date(r.date) >= now).length, dir: 'outgoing', time: 'upcoming' },
              { key: 'mine-past', label: 'Past', count: outgoingReservations.filter((r) => new Date(r.date) < now).length, dir: 'outgoing', time: 'past' },
              { key: 'incoming', label: 'Incoming', count: incomingReservations.length, dir: 'incoming', time: 'upcoming', attention: incomingPending > 0 },
            ];
            return tabs.map((tab) => {
              const active = directionTab === tab.dir && timeTab === tab.time;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setDirectionTab(tab.dir);
                    setTimeTab(tab.time);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    active
                      ? 'bg-gradient-to-br from-stone-800 to-black text-white shadow-pill-active dark:from-stone-100 dark:to-white dark:text-stone-900 dark:shadow-pill-active-dark'
                      : 'bg-stone-50  text-stone-500  dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 shadow-inset-outline'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={`text-xs tabular-nums ${
                        active ? 'text-white/60' : tab.attention ? 'text-warning-soft-foreground' : 'text-stone-400 dark:text-stone-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            });
          })()}

          <div className="relative ml-auto w-full sm:w-72">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                directionTab === 'incoming'
                  ? 'Search by service, customer, place…'
                  : 'Search trips, shops, places…'
              }
              className="w-full bg-stone-50  dark:bg-stone-800/50 border border-stone-200   rounded-xl px-4 py-2.5 pr-11 text-sm text-stone-800 dark:text-stone-200 dark:text-white placeholder-stone-400 dark:placeholder-stone-500 outline-none focus:border-stone-300 dark:border-stone-700 dark:focus:border-stone-600 focus:bg-white  dark:focus:bg-stone-800 transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-xl flex items-center justify-center text-stone-400 dark:text-stone-500">
              <Search className="w-4 h-4" strokeWidth={2} />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            timeTab={timeTab}
            direction={directionTab}
            hasQuery={!!query.trim()}
            onBrowse={() => router.push('/')}
            onClear={() => setQuery('')}
          />
        ) : (
          <div className="space-y-12">
            {timeline.map((group) => (
              <TimelineGroup
                key={group.key}
                label={group.label}
                sublabel={group.sublabel}
                count={group.items.length}
              >
                {group.items.map((r, idx) => {
                  const goToListing = () =>
                    router.push(`/listings/${(r.listing as any).id}`);
                  return (
                    <TripRow
                      key={r.id}
                      reservation={r}
                      direction={directionTab}
                      isNext={r.id === nextTrip?.id}
                      idx={idx}
                      past={timeTab === 'past'}
                      disabled={processingId === r.id}
                      onCancel={() => onCancel(r.id)}
                      onRefund={() => onRefund(r.id)}
                      onAccept={() => onAccept(r.id)}
                      onDecline={() => onDecline(r.id)}
                      onOpen={() =>
                        reservationModal.onOpen({
                          reservation: r,
                          direction: directionTab,
                          past: timeTab === 'past',
                          onCancel: () => onCancel(r.id),
                          onRefund: () => onRefund(r.id),
                          onAccept: () => onAccept(r.id),
                          onDecline: () => onDecline(r.id),
                          onViewListing: goToListing,
                          onRebook: goToListing,
                        })
                      }
                      onRebook={goToListing}
                    />
                  );
                })}
              </TimelineGroup>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseDot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </Container>
  );
};

export default ReservationsClient;

/* ============================== HERO ============================== */

function NextTripHero({
  trip,
  direction,
  disabled,
  onCancel,
  onAccept,
  onDecline,
  onOpen,
}: {
  trip: SafeReservation;
  direction: DirectionTab;
  disabled: boolean;
  onCancel: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onOpen: () => void;
}) {
  const listing = trip.listing as any;
  const date = new Date(trip.date);
  const image =
    listing.imageSrc ||
    listing.galleryImages?.[0] ||
    placeholderDataUri(listing.title || 'Listing');

  const employee = listing.employees?.find((e: any) => e.id === trip.employeeId);
  const employeeName = employee?.fullName as string | undefined;
  const employeeAvatar = (employee?.user?.image || employee?.user?.imageSrc) as string | undefined;
  const employeeRole = employee?.jobTitle as string | undefined;
  // Guest reservations have no linked user — fall back to the guest name
  // captured at checkout. Avatar simply isn't shown for guests.
  const customerName = trip.user?.name || (trip as any).guestName || 'Guest customer';
  const customerAvatar = (trip.user?.image || trip.user?.imageSrc) as string | undefined;
  const isGuestBooking = !trip.user;

  // Multi-service support: render "N services" when more than one was booked.
  const serviceCount = ((trip as any).serviceIds?.length as number) || 1;
  const serviceLabel =
    serviceCount > 1 ? `${serviceCount} services` : trip.serviceName;

  const matchedService = listing.services?.find(
    (s: any) => s.serviceName === trip.serviceName,
  );
  const durationMin = matchedService?.durationMinutes as number | undefined;
  const bookingShortId = trip.id.slice(-6).toUpperCase();

  const status = normalizeStatus(trip.status);
  const paymentStatus = trip.paymentStatus as string | undefined;
  const countdown = useLiveCountdown(date, trip.time);
  const isIncoming = direction === 'incoming';
  const isPending = status === 'pending';

  const directionsHref = listing.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(listing.address)}`
    : null;
  const callHref = listing.phoneNumber ? `tel:${listing.phoneNumber}` : null;

  const calendarHref = useMemo(() => {
    const start = combineDateTime(date, trip.time);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${trip.serviceName} — ${listing.title}`,
      dates: `${fmt(start)}/${fmt(end)}`,
      details: `Booking via ForMe${employeeName ? ` with ${employeeName}` : ''}`,
      location: listing.address || '',
    });
    return `https://www.google.com/calendar/render?${params.toString()}`;
  }, [date, trip.time, trip.serviceName, listing.title, listing.address, employeeName]);

  return (
    <section
      style={{ animation: 'fadeInUp 600ms ease-out both' }}
      className="relative overflow-hidden rounded-[28px] bg-stone-900 text-white shadow-elevation-3"
    >
      <Image
        src={image}
        alt={listing.title}
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-tr from-stone-950 via-stone-900/85 to-stone-900/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent" />
      <div aria-hidden className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-warning/90/15 blur-3xl" />
      <div aria-hidden className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5 blur-3xl" />

      <div className="relative px-6 sm:px-10 pt-7 sm:pt-9 pb-7 sm:pb-8">
        <div className="hidden sm:grid grid-cols-4 gap-3">
          {/* Q1: Date + listing image */}
          <Quadrant>
            <div className="flex flex-col h-full gap-3">
              <button
                onClick={onOpen}
                className="relative w-full flex-1 rounded-xl overflow-hidden ring-1 ring-white/10 hover:ring-white/30 transition"
              >
                <Image src={image} alt={listing.title} fill sizes="240px" className="object-cover" />
              </button>
              <div className="flex items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <div className="text-xs font-medium text-warning/70/90">
                    {format(date, 'EEE, MMM')}
                  </div>
                  <div className="text-lg font-bold tabular-nums tracking-tight">
                    {format(date, 'd')}
                  </div>
                </div>
                <div className="flex items-baseline gap-2 text-right">
                  <div className="text-xs font-medium text-white/45">
                    Time
                  </div>
                  <div className="text-lg font-semibold text-white tabular-nums">
                    {formatTime(trip.time)}
                  </div>
                </div>
              </div>
            </div>
          </Quadrant>

          {/* Q2: Listing name + service / avatar / chips */}
          <Quadrant spaced>
            <div className="flex flex-col h-full">
              <div>
                <button
                  onClick={onOpen}
                  className="group inline-flex items-center gap-2 text-left min-w-0 w-full"
                >
                  <span className="text-3xl font-semibold leading-[1.05] truncate tracking-tight text-white">
                    {listing.title}
                  </span>
                  <ChevronRight className="w-5 h-5 text-white/60 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
                <p className="text-sm text-white/65 leading-tight truncate mt-1">
                  {serviceLabel}
                </p>
              </div>

              <div className="flex-1 flex items-center">
                <div className="flex items-center gap-3.5">
                  <div className="relative shrink-0 w-14 h-14 rounded-full overflow-hidden bg-white/10 ring-1 ring-white/15">
                    {(isIncoming ? customerAvatar : employeeAvatar) ? (
                      <Image
                        src={(isIncoming ? customerAvatar : employeeAvatar)!}
                        alt={isIncoming ? customerName : employeeName || 'Provider'}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-white/60" strokeWidth={2} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white/55 leading-none">
                      {isIncoming ? 'Customer' : 'With'}
                    </p>
                    <p className="text-sm text-white font-semibold leading-tight truncate mt-1">
                      {isIncoming ? customerName : employeeName || 'Unassigned'}
                    </p>
                    {!isIncoming && employeeRole && (
                      <p className="text-xs text-white/50 leading-tight truncate mt-0.5">
                        {employeeRole}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-auto flex items-baseline justify-center gap-6 min-w-0">
                <div className="flex items-baseline gap-2 min-w-0">
                  <div className="text-xs font-medium text-white/45 shrink-0">
                    Place
                  </div>
                  <div className="text-lg font-semibold text-white truncate">
                    {!isIncoming && listing.address ? listing.address : '—'}
                  </div>
                </div>
                <div className="flex items-baseline gap-2 shrink-0">
                  <div className="text-xs font-medium text-white/45">
                    Booking
                  </div>
                  <div className="text-lg font-semibold text-white tabular-nums">
                    #{bookingShortId}
                  </div>
                </div>
              </div>
            </div>
          </Quadrant>

          {/* Q3 (was Q4): Receipt-style summary */}
          <Quadrant>
            <div className="h-full flex flex-col justify-center items-center gap-3 text-center">
              {/* Total label */}
              <span className="text-xs font-medium text-white/55">
                {isIncoming
                  ? `Earnings${paymentStatus === 'paid' ? ' · Paid' : ''}`
                  : `Total${paymentStatus === 'paid' ? ' · Paid' : paymentStatus === 'refunded' ? ' · Refunded' : ''}`}
              </span>

              {/* Big price */}
              <div className="relative text-[64px] font-bold tabular-nums tracking-tight leading-none text-white">
                <span className="absolute -left-5 top-2 text-2xl font-semibold text-white/50">$</span>
                {trip.totalPrice}
              </div>
            </div>
          </Quadrant>

          {/* Q4 (was Q3): Action buttons aligned with listing image */}
          <Quadrant>
            <div className="flex flex-col h-full min-h-[240px] gap-3 w-full">
            {isIncoming && isPending ? (
              <div className="grid grid-cols-2 grid-rows-2 gap-2 flex-1 w-full">
                <button
                  onClick={onAccept}
                  disabled={disabled}
                  className="inline-flex flex-col items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-b from-emerald-500 to-emerald-600 border border-success/60 shadow-[0_4px_14px_-2px_rgba(16,185,129,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50"
                >
                  <Tick02Icon size={22} strokeWidth={2.2} />
                  Accept
                </button>
                <button
                  onClick={onDecline}
                  disabled={disabled}
                  className="inline-flex flex-col items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-white/85 bg-white/5 border border-white/15 hover:bg-danger/20 hover:text-red-100 hover:border-danger/40 transition-all disabled:opacity-50"
                >
                  <Cancel01Icon size={22} strokeWidth={2} />
                  Decline
                </button>
                <BigAction
                  href={trip.user?.email ? `mailto:${trip.user.email}` : null}
                  icon={<UserAccountIcon size={22} strokeWidth={1.8} />}
                  label="Contact"
                />
                <BigAction
                  href={calendarHref}
                  external
                  icon={<CalendarAdd02Icon size={22} strokeWidth={1.8} />}
                  label="Calendar"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 grid-rows-2 gap-2 flex-1 w-full">
                <BigAction
                  href={directionsHref}
                  external
                  icon={<Navigation03Icon size={22} strokeWidth={1.8} />}
                  label="Directions"
                  primary
                />
                <BigAction
                  href={callHref}
                  icon={<Call02Icon size={22} strokeWidth={1.8} />}
                  label="Call"
                />
                <BigAction
                  onClick={() => shareTrip(trip)}
                  icon={<PostCardShareIcon />}
                  label="Share"
                />
                <BigAction
                  href={calendarHref}
                  external
                  icon={<CalendarAdd02Icon size={22} strokeWidth={1.8} />}
                  label="Calendar"
                />
              </div>
            )}
            <div className="shrink-0 flex items-baseline justify-center gap-2">
              <span className="text-xs font-medium text-white/45">
                Status
              </span>
              <span
                className={`text-lg font-semibold tabular-nums ${
                  status === 'pending'
                    ? 'text-warning/60/85'
                    : status === 'accepted'
                    ? 'text-success/60/85'
                    : 'text-white'
                }`}
              >
                {STATUS_LABELS[status]}
              </span>
            </div>
            </div>
          </Quadrant>
        </div>

        {/* Mobile-only action row */}
        <div className="sm:hidden mt-6 -mx-1 flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <HeroStatusPill status={status} />
          {isIncoming ? (
            <>
              {isPending && (
                <>
                  <button
                    onClick={onAccept}
                    disabled={disabled}
                    className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full text-xs font-semibold text-white bg-gradient-to-b from-emerald-500 to-emerald-600 border border-success/60 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" strokeWidth={2.8} />
                    Accept
                  </button>
                  <button
                    onClick={onDecline}
                    disabled={disabled}
                    className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full text-xs font-semibold text-white/85 bg-white/5 border border-white/15 disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" strokeWidth={2.8} />
                    Decline
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              <ActionChip
                href={directionsHref}
                external
                icon={<Navigation className="w-3.5 h-3.5" strokeWidth={2.2} />}
                label="Directions"
                primary
              />
              <ActionChip
                href={callHref}
                icon={<Phone className="w-3.5 h-3.5" strokeWidth={2.2} />}
                label="Call"
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function PostCardShareIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10.0017 3C7.05534 3.03208 5.41096 3.21929 4.31838 4.31188C2.99988 5.63037 2.99988 7.75248 2.99988 11.9966C2.99988 16.2409 2.99988 18.363 4.31838 19.6815C5.63688 21 7.75899 21 12.0032 21C16.2474 21 18.3695 21 19.688 19.6815C20.7808 18.5887 20.9678 16.9438 20.9999 13.9963" />
      <path d="M14 3H18C19.4142 3 20.1213 3 20.5607 3.43934C21 3.87868 21 4.58579 21 6V10M20 4L11 13" />
    </svg>
  );
}

function BigAction({
  icon,
  label,
  onClick,
  href,
  external,
  disabled,
  primary,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string | null;
  external?: boolean;
  disabled?: boolean;
  primary?: boolean;
}) {
  const cls = `inline-flex flex-col items-center justify-center gap-1.5 rounded-xl text-sm font-semibold transition-all border ${
    primary
      ? 'bg-white  text-stone-900 dark:text-stone-100 border-white hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800'
      : 'bg-white/[0.04] text-white border-white/10 hover:bg-white/10 hover:border-white/20'
  } disabled:opacity-50`;
  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={cls}
        onClick={(e) => e.stopPropagation()}
      >
        {icon}
        {label}
      </a>
    );
  }
  return (
    <button onClick={onClick} disabled={disabled} className={cls}>
      {icon}
      {label}
    </button>
  );
}

function StatusInline({
  status,
  isIncoming,
}: {
  status: UiStatus;
  isIncoming: boolean;
}) {
  const config: Record<UiStatus, { label: string; sub: string; dot: string; text: string }> = {
    pending: {
      label: isIncoming ? 'Action needed' : 'Awaiting confirmation',
      sub: isIncoming ? 'Respond to keep the spot' : 'Usually within a few hours',
      dot: 'bg-warning/90',
      text: 'text-warning/60',
    },
    accepted: {
      label: 'Confirmed',
      sub: "You're good to go",
      dot: 'bg-success/90',
      text: 'text-success/60',
    },
    declined: {
      label: 'Declined',
      sub: 'Refund issued if applicable',
      dot: 'bg-stone-400',
      text: 'text-white/80',
    },
    cancelled: {
      label: 'Cancelled',
      sub: 'Book again anytime',
      dot: 'bg-stone-400',
      text: 'text-white/80',
    },
  };
  const c = config[status];
  return (
    <div className="flex items-start gap-2.5">
      <span className="relative inline-flex w-2 h-2 mt-2 shrink-0">
        <span
          className={`absolute inset-0 rounded-full ${c.dot}`}
          style={{ animation: 'pulseDot 1.8s ease-out infinite' }}
        />
        <span className={`relative inline-flex w-2 h-2 rounded-full ${c.dot}`} />
      </span>
      <div className="min-w-0">
        <p className={`text-lg font-semibold leading-tight ${c.text}`}>{c.label}</p>
        <p className="text-xs text-white/55 leading-tight mt-0.5">{c.sub}</p>
      </div>
    </div>
  );
}

function Quadrant({
  children,
  divider = false,
  spaced = false,
}: {
  children: React.ReactNode;
  divider?: boolean;
  spaced?: boolean;
}) {
  return (
    <div className={`relative min-h-[240px] flex ${divider ? 'pl-5 border-l border-white/10' : spaced ? 'pl-9' : ''}`}>
      <div className="w-full">{children}</div>
    </div>
  );
}

function LifecycleLine({
  status,
  listingTitle,
  date,
  countdownHeadline,
  isIncoming,
}: {
  status: UiStatus;
  listingTitle: string;
  date: Date;
  countdownHeadline: string;
  isIncoming: boolean;
}) {
  const rescheduleBy = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  let dotColor = 'bg-warning/90';
  let label: React.ReactNode = '';
  let sub: React.ReactNode = null;

  switch (status) {
    case 'pending':
      dotColor = 'bg-warning/90';
      label = isIncoming
        ? 'Awaiting your response'
        : `Awaiting confirmation from ${listingTitle}`;
      sub = `Coming up in ${countdownHeadline.toLowerCase()}`;
      break;
    case 'accepted':
      dotColor = 'bg-success/90';
      label = "You're all set";
      sub = `Free to reschedule until ${format(rescheduleBy, 'MMM d, h:mm a')}`;
      break;
    case 'declined':
      dotColor = 'bg-stone-400';
      label = `Declined by ${listingTitle}`;
      sub = 'Refund issued if applicable';
      break;
    case 'cancelled':
      dotColor = 'bg-stone-400';
      label = 'Booking cancelled';
      sub = 'Book again anytime';
      break;
  }

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <span className="relative inline-flex w-2 h-2">
        <span
          className={`absolute inset-0 rounded-full ${dotColor}`}
          style={{ animation: 'pulseDot 1.8s ease-out infinite' }}
        />
        <span className={`relative inline-flex w-2 h-2 rounded-full ${dotColor}`} />
      </span>
      <p className="text-sm font-semibold text-white/85 leading-none">{label}</p>
      {sub && <span className="text-sm text-white/45 leading-none">· {sub}</span>}
    </div>
  );
}

function InfoChip({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/55">
      {icon}
      {children}
    </span>
  );
}

function StackedAction({
  icon,
  label,
  onClick,
  href,
  external,
  disabled,
  primary,
  danger,
  compact,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string | null;
  external?: boolean;
  disabled?: boolean;
  primary?: boolean;
  danger?: boolean;
  compact?: boolean;
}) {
  const cls = `w-full inline-flex items-center ${compact ? 'justify-center' : 'justify-start'} gap-2 px-3.5 h-11 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${
    primary
      ? 'bg-white  text-stone-900 dark:text-stone-100 border-white hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800'
      : danger
      ? 'bg-white/0 text-white/75 border-white/15 hover:bg-danger/15 hover:text-danger-soft-foreground hover:border-danger/40'
      : 'bg-white/5 text-white border-white/15 hover:bg-white/15'
  } disabled:opacity-50`;

  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={cls}
        onClick={(e) => e.stopPropagation()}
      >
        {icon}
        {label}
      </a>
    );
  }
  return (
    <button onClick={onClick} disabled={disabled} className={cls}>
      {icon}
      {label}
    </button>
  );
}

function NoUpcomingHero({
  direction,
  onBrowse,
  lifetime,
}: {
  direction: DirectionTab;
  onBrowse: () => void;
  lifetime: number;
}) {
  const isIncoming = direction === 'incoming';
  return (
    <section
      style={{ animation: 'fadeInUp 600ms ease-out both' }}
      className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white px-6 sm:px-10 py-10 sm:py-14"
    >
      <div aria-hidden className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-warning/90/15 blur-3xl" />
      <div aria-hidden className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
      <div className="relative max-w-xl">
        <p className="text-sm font-semibold text-white/50">
          {isIncoming ? 'Incoming' : 'My bookings'}
        </p>
        <h1 className="mt-3 text-4xl sm:text-[44px] font-semibold tracking-tight leading-[1.02]">
          {isIncoming ? 'No requests right now.' : 'Nothing on the calendar.'}
        </h1>
        <p className="mt-3 text-sm text-white/60 max-w-md">
          {isIncoming
            ? "When clients book your services, they'll appear here for you to accept or decline."
            : lifetime > 0
            ? `You've completed ${lifetime} ${lifetime === 1 ? 'booking' : 'bookings'} so far. Time to book the next one.`
            : 'Find a service, book it in seconds, and your itinerary will live right here.'}
        </p>
        {!isIncoming && (
          <button
            onClick={onBrowse}
            className="mt-7 inline-flex items-center gap-2 px-5 h-11 rounded-full bg-white  text-stone-900 dark:text-stone-100 text-sm font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800 transition-colors"
          >
            <Sparkles className="w-4 h-4" strokeWidth={2.2} />
            Discover services
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </section>
  );
}

/* ============================== STAT CARD ============================== */

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: 'amber';
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white dark:bg-stone-900 p-4 sm:p-5 transition-all hover:border-stone-300 dark:border-stone-700 ${
        accent === 'amber' ? 'border-warning-soft/80' : 'border-stone-200/70'
      }`}
    >
      {accent === 'amber' && (
        <div aria-hidden className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-amber-200/30 blur-2xl" />
      )}
      <div className="relative flex items-center gap-2">
        <p className="text-sm font-semibold tracking-wider text-stone-400 dark:text-stone-500 uppercase">
          {label}
        </p>
        <p className="text-lg sm:text-xl font-semibold text-stone-900 dark:text-stone-100 tabular-nums tracking-tight leading-none">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ============================== TIMELINE ============================== */

function TimelineGroup({
  label,
  sublabel,
  count,
  children,
}: {
  label: string;
  sublabel?: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-baseline gap-3 mb-5">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 tracking-[-0.015em]">{label}</h2>
        {sublabel && (
          <span
            className="text-xs text-stone-400 dark:text-stone-500"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic' }}
          >
            {sublabel}
          </span>
        )}
      </div>
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">{children}</div>
      </div>
    </section>
  );
}

/* ============================== TRIP ROW ============================== */

function TripRow({
  reservation,
  direction,
  isNext,
  idx,
  past,
  disabled,
  onCancel,
  onRefund,
  onAccept,
  onDecline,
  onOpen,
  onRebook,
}: {
  reservation: SafeReservation;
  direction: DirectionTab;
  isNext: boolean;
  idx: number;
  past: boolean;
  disabled: boolean;
  onCancel: () => void;
  onRefund: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onOpen: () => void;
  onRebook: () => void;
}) {
  const listing = reservation.listing as any;
  const date = new Date(reservation.date);
  const image =
    listing.imageSrc ||
    listing.galleryImages?.[0] ||
    placeholderDataUri(listing.title || 'Listing');

  const employeeName = listing.employees?.find(
    (e: any) => e.id === reservation.employeeId,
  )?.fullName as string | undefined;
  // Guest reservations have no linked user — fall back to guestName from
  // checkout. The "Guest" suffix flags the row for the worker-side viewer.
  const customerName =
    reservation.user?.name || (reservation as any).guestName || 'Guest customer';
  const isGuestReservation = !reservation.user;
  const reservationServiceCount = ((reservation as any).serviceIds?.length as number) || 1;
  const reservationServiceLabel =
    reservationServiceCount > 1
      ? `${reservationServiceCount} services`
      : reservation.serviceName;

  const status = normalizeStatus(reservation.status);
  const refundStatus = (reservation as any).refundStatus as string | undefined;
  const paymentStatus = reservation.paymentStatus as string | undefined;
  const isRefunded = paymentStatus === 'refunded' || refundStatus === 'completed';
  const today = isSameDay(date, new Date());
  const isIncoming = direction === 'incoming';
  const isPending = status === 'pending';
  const canRefund =
    !isIncoming &&
    paymentStatus === 'paid' &&
    !isRefunded;

  return (
    <div
      style={{
        opacity: 0,
        animation: 'fadeInUp 480ms ease-out both',
        animationDelay: `${Math.min(40 + idx * 40, 320)}ms`,
      }}
      className="relative group"
    >
      <div
        onClick={onOpen}
        className={`relative cursor-pointer rounded-3xl bg-white dark:bg-stone-900 border transition-all overflow-hidden hover:-translate-y-0.5 hover:shadow-elevation-2 ${
          isNext
            ? 'border-stone-900/15 shadow-elevation-1'
            : 'border-stone-200/70 hover:border-stone-300 dark:border-stone-700'
        }`}
      >
        <div className="relative flex items-stretch">
          {/* Date — keep as-is, on soft bg */}
          <div className="relative flex-shrink-0 w-[96px] flex flex-col items-center justify-center py-6 bg-gradient-to-b from-stone-50/80 to-white dark:from-stone-900 dark:to-stone-900">
            <div className="text-xs font-medium text-stone-400 dark:text-stone-500">
              {format(date, 'MMM')}
            </div>
            <div className="text-4xl font-semibold text-stone-900 dark:text-stone-100 tabular-nums leading-none mt-1.5">
              {format(date, 'd')}
            </div>
            <div className="text-xs font-medium text-stone-400 dark:text-stone-500 mt-2">
              {format(date, 'EEE')}
            </div>
          </div>

          {/* Hairline */}
          <div className="w-px bg-gradient-to-b from-transparent via-stone-200/80 to-transparent" />

          {/* Main content */}
          <div className="flex-1 min-w-0 px-5 py-5 flex flex-col justify-center gap-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className={`text-xs leading-none ${ROW_TEXT_COLORS[status]}`} style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic' }}>
                  {STATUS_LABELS[status]}
                  {today && !past && <span className="text-warning-soft-foreground ml-2">· Today</span>}
                </p>
                <h3 className="mt-1.5 text-lg font-semibold text-stone-900 dark:text-stone-100 tracking-[-0.015em] leading-tight truncate">
                  {reservationServiceLabel}
                </h3>
                <p className="text-xs text-stone-500  dark:text-stone-500 truncate mt-0.5">
                  {isIncoming
                    ? `${customerName}${isGuestReservation ? ' (guest)' : ''} · ${listing.title}`
                    : listing.title}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <div
                  className={`text-3xl font-black tabular-nums tracking-tight leading-none ${
                    isRefunded ? 'text-stone-400 dark:text-stone-500 line-through' : 'text-stone-900 dark:text-stone-100'
                  }`}
                >
                  ${reservation.totalPrice}
                </div>
                <div className="text-xs font-medium text-stone-400 dark:text-stone-500 mt-1">
                  {formatTime(reservation.time)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-stone-100 dark:border-stone-800">
              <div className="relative shrink-0 w-8 h-8 rounded-full overflow-hidden bg-stone-100 dark:bg-stone-800 ring-1 ring-stone-200/60">
                <Image
                  src={image}
                  alt={listing.title}
                  fill
                  sizes="32px"
                  className={`object-cover ${past ? 'grayscale-[35%]' : ''}`}
                />
              </div>
              <div className="min-w-0 text-xs text-stone-500  dark:text-stone-500 truncate">
                {!isIncoming && employeeName
                  ? <>with <span className="text-stone-700 dark:text-stone-200 font-medium">{employeeName}</span></>
                  : !isIncoming && listing.address
                  ? listing.address
                  : isIncoming && reservation.user?.email
                  ? reservation.user.email
                  : listing.title}
              </div>
            </div>
          </div>
        </div>

        {isIncoming && isPending && !past && (
          <div className="border-t border-stone-100 dark:border-stone-800 bg-gradient-to-b from-amber-50/40 to-white dark:from-stone-900 dark:to-stone-900 px-4 py-2.5 flex items-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onDecline(); }}
              disabled={disabled}
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-full text-xs font-semibold text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:text-danger-soft-foreground hover:border-danger-soft hover:bg-danger-soft transition-all disabled:opacity-50"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2.6} />
              Decline
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onAccept(); }}
              disabled={disabled}
              className="flex-1 inline-flex items-center justify-center gap-1.5 h-8 rounded-full text-xs font-semibold text-white bg-gradient-to-b from-emerald-500 to-emerald-600 border border-success/60 shadow-[0_2px_8px_-1px_rgba(16,185,129,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" strokeWidth={2.8} />
              Accept
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== ACTION CHIP / ROW ACTION ============================== */

function ActionChip({
  icon,
  label,
  onClick,
  href,
  external,
  disabled,
  primary,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string | null;
  external?: boolean;
  disabled?: boolean;
  primary?: boolean;
  danger?: boolean;
}) {
  const cls = `inline-flex items-center gap-1.5 px-3.5 h-9 rounded-full text-xs font-semibold whitespace-nowrap transition-all backdrop-blur-md border ${
    primary
      ? 'bg-white  text-stone-900 dark:text-stone-100 border-white hover:bg-stone-100 dark:hover:bg-stone-800 dark:bg-stone-800'
      : danger
      ? 'bg-white/0 text-white/80 border-white/15 hover:bg-danger/15 hover:text-danger-soft-foreground hover:border-danger/40'
      : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
  } disabled:opacity-50`;

  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={cls}
        onClick={(e) => e.stopPropagation()}
      >
        {icon}
        {label}
      </a>
    );
  }
  return (
    <button onClick={onClick} disabled={disabled} className={cls}>
      {icon}
      {label}
    </button>
  );
}

function RowAction({
  icon,
  label,
  onClick,
  href,
  external,
  disabled,
  danger,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
  external?: boolean;
  disabled?: boolean;
  danger?: boolean;
  accent?: boolean;
}) {
  const cls = `inline-flex items-center gap-1 px-2.5 h-7 rounded-full text-xs font-medium border transition-colors ${
    accent
      ? 'border-stone-900 bg-stone-900 text-white hover:bg-stone-800'
      : danger
      ? 'border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-500 hover:text-danger-soft-foreground hover:border-danger-soft hover:bg-danger-soft'
      : 'border-stone-200  text-stone-500   hover:text-stone-900 dark:hover:text-stone-100 dark:text-stone-100 hover:border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-900'
  } disabled:opacity-50`;
  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        onClick={(e) => e.stopPropagation()}
        className={cls}
      >
        {icon}
        {label}
      </a>
    );
  }
  return (
    <button onClick={onClick} disabled={disabled} className={cls}>
      {icon}
      {label}
    </button>
  );
}

/* ============================== EMPTY STATE ============================== */

function EmptyState({
  timeTab,
  direction,
  hasQuery,
  onBrowse,
  onClear,
}: {
  timeTab: TimeTab;
  direction: DirectionTab;
  hasQuery: boolean;
  onBrowse: () => void;
  onClear: () => void;
}) {
  const isIncoming = direction === 'incoming';
  return (
    <div className="rounded-3xl border border-dashed border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 py-20 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-stone-100 dark:bg-stone-800 mx-auto flex items-center justify-center mb-5">
        <Inbox className="w-6 h-6 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-medium text-stone-800 dark:text-stone-200">
        {hasQuery
          ? 'No matches'
          : `No ${timeTab} ${isIncoming ? 'requests' : 'bookings'}`}
      </p>
      <p className="text-sm text-stone-400 dark:text-stone-500 mt-1.5 max-w-xs mx-auto">
        {hasQuery
          ? 'Try a different search term.'
          : timeTab === 'upcoming'
          ? isIncoming
            ? "When clients book your services, they'll appear here."
            : 'Book a service to see your bookings here.'
          : `Your past ${isIncoming ? 'requests' : 'bookings'} will show up here.`}
      </p>
      {hasQuery ? (
        <button
          onClick={onClear}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-100  text-stone-700 dark:text-stone-200 text-sm font-medium hover:bg-stone-200 dark:bg-stone-700 transition-colors"
        >
          Clear search
        </button>
      ) : (
        timeTab === 'upcoming' && !isIncoming && (
          <div className="mt-6">
            <Button
              onClick={onBrowse}
              rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
              className="rounded-full"
            >
              Browse services
            </Button>
          </div>
        )
      )}
    </div>
  );
}

/* ============================== HELPERS ============================== */

type UiStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

const normalizeStatus = (status: string): UiStatus => {
  if (status === 'accepted') return 'accepted';
  if (status === 'declined') return 'declined';
  if (status === 'cancelled') return 'cancelled';
  return 'pending';
};

const STATUS_LABELS: Record<UiStatus, string> = {
  accepted: 'Confirmed',
  pending: 'Pending',
  declined: 'Declined',
  cancelled: 'Cancelled',
};

const ROW_TEXT_COLORS: Record<UiStatus, string> = {
  accepted: 'text-success-soft-foreground',
  pending: 'text-warning-soft-foreground',
  declined: 'text-stone-500  dark:text-stone-500',
  cancelled: 'text-stone-400 dark:text-stone-500',
};

const HERO_TEXT_COLORS: Record<UiStatus, string> = {
  accepted: 'text-success/60/90',
  pending: 'text-warning/60/90',
  declined: 'text-white/60',
  cancelled: 'text-white/55',
};

function StatusPill({ status }: { status: UiStatus }) {
  return (
    <span className={`text-sm font-semibold ${ROW_TEXT_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function HeroStatusPill({ status }: { status: UiStatus }) {
  return (
    <span className={`text-sm font-semibold ${HERO_TEXT_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
}

function combineDateTime(date: Date, time: string): Date {
  const [h, m] = time.split(':').map((v) => parseInt(v, 10));
  const d = new Date(date);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

function useLiveCountdown(date: Date, time: string) {
  const target = useMemo(() => combineDateTime(date, time), [date, time]);
  const [, setTick] = useState(0);

  useEffect(() => {
    const diffMs = target.getTime() - Date.now();
    const interval = Math.abs(diffMs) < 86_400_000 ? 1000 : 60_000;
    const id = setInterval(() => setTick((t) => t + 1), interval);
    return () => clearInterval(id);
  }, [target]);

  const diffMs = target.getTime() - Date.now();
  const past = diffMs < 0;
  const abs = Math.abs(diffMs);
  const days = Math.floor(abs / 86_400_000);
  const hours = Math.floor((abs % 86_400_000) / 3_600_000);
  const minutes = Math.floor((abs % 3_600_000) / 60_000);

  if (past) return { headline: 'Happening now', sub: format(target, 'EEE, MMM d · h:mm a') };
  if (days >= 7) return { headline: `In ${days} days`, sub: format(target, 'EEE, MMM d · h:mm a') };
  if (days >= 1) return { headline: `${days}d ${hours}h`, sub: `until ${format(target, 'EEE')} at ${format(target, 'h:mm a')}` };
  if (hours >= 1) return { headline: `${hours}h ${minutes}m`, sub: `today at ${format(target, 'h:mm a')}` };
  return { headline: minutes > 0 ? `${minutes} min` : 'Starting now', sub: `today at ${format(target, 'h:mm a')}` };
}

async function shareTrip(trip: SafeReservation) {
  const listing = trip.listing as any;
  const text = `${trip.serviceName} at ${listing.title} — ${format(new Date(trip.date), 'MMM d')} at ${formatTime(trip.time)}`;
  const url = typeof window !== 'undefined' ? `${window.location.origin}/listings/${listing.id}` : '';
  try {
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      await (navigator as any).share({ title: 'My ForMe booking', text, url });
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success('Booking copied to clipboard');
    }
  } catch {
    /* dismissed */
  }
}
