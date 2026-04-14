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
import {
  Inbox,
  ArrowUpRight,
  Clock,
  MapPin,
  User as UserIcon,
  X,
  Search,
  Navigation,
  Phone,
  CalendarPlus,
  Share2,
  Star,
  RotateCw,
  ChevronRight,
  Sparkles,
  Check,
  Undo2,
  ArrowLeftRight,
} from 'lucide-react';
import {
  Navigation03Icon,
  Call02Icon,
  CalendarAdd02Icon,
  Tick02Icon,
  Cancel01Icon,
  UserAccountIcon,
} from 'hugeicons-react';

import { SafeReservation, SafeUser } from '@/app/types';
import Container from '@/components/Container';
import PageHeader from '@/components/PageHeader';
import { placeholderDataUri } from '@/lib/placeholders';

interface ReservationsClientProps {
  incomingReservations: SafeReservation[];
  outgoingReservations: SafeReservation[];
  currentUser?: SafeUser | null;
}

type DirectionTab = 'outgoing' | 'incoming';
type TimeTab = 'upcoming' | 'past';

const ReservationsClient: React.FC<ReservationsClientProps> = ({
  incomingReservations,
  outgoingReservations,
  currentUser,
}) => {
  const router = useRouter();
  const [processingId, setProcessingId] = useState('');
  const [directionTab, setDirectionTab] = useState<DirectionTab>('outgoing');
  const [timeTab, setTimeTab] = useState<TimeTab>('upcoming');
  const [query, setQuery] = useState('');

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
      toast.success('Booking cancelled');
      router.refresh();
    } catch { toast.error('Something went wrong.'); }
    finally { setProcessingId(''); }
  }, [router]);

  const onRefund = useCallback(async (id: string) => {
    if (!confirm('Request a refund for this booking?')) return;
    setProcessingId(id);
    try {
      const res = await axios.post(`/api/reservations/${id}/refund`, {
        reason: 'Customer requested refund',
      });
      if (res.data.status === 'completed') toast.success('Refund processed');
      else toast.success('Refund request submitted');
      router.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to process refund');
    } finally { setProcessingId(''); }
  }, [router]);

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
        r.user?.name?.toLowerCase().includes(q)
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

  return (
    <Container>
      <PageHeader currentUser={currentUser} />

      <div className="mt-6 sm:mt-10 pb-20">
        {/* Heading-as-switcher */}
        <div className="flex items-end justify-between gap-4 mb-6">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-stone-900 tracking-tight leading-[0.95]">
              {directionTab === 'outgoing' ? 'My bookings' : 'Incoming'}
            </h1>
            <p className="text-[13px] text-stone-400 mt-2">
              {directionTab === 'outgoing'
                ? 'Your trips and appointments'
                : 'Requests from your customers'}
            </p>
          </div>
          {(() => {
            const otherIsIncoming = directionTab === 'outgoing';
            const otherList = otherIsIncoming ? incomingReservations : outgoingReservations;
            const otherCount = otherList.length;
            const otherPending = otherList.filter(
              (r) => r.status === 'pending' && new Date(r.date) >= now,
            ).length;
            const hasAttention = otherIsIncoming && otherPending > 0;
            return (
              <button
                onClick={() => setDirectionTab(otherIsIncoming ? 'incoming' : 'outgoing')}
                className={`group shrink-0 inline-flex items-center gap-2.5 pl-5 pr-3 h-11 rounded-xl text-[13px] font-semibold transition-all border ${
                  hasAttention
                    ? 'bg-stone-900 text-white border-stone-900 hover:bg-stone-800 shadow-[0_4px_14px_-2px_rgba(0,0,0,0.25)]'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                <span>Switch to {otherIsIncoming ? 'Incoming' : 'Mine'}</span>
                {otherCount > 0 && (
                  <span
                    className={`inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[11px] font-bold tabular-nums ${
                      hasAttention
                        ? 'bg-amber-400 text-stone-900'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {otherCount}
                  </span>
                )}
                <ArrowLeftRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.2} />
              </button>
            );
          })()}
        </div>

        {nextTrip ? (
          <NextTripHero
            trip={nextTrip}
            direction={directionTab}
            disabled={processingId === nextTrip.id}
            onCancel={() => onCancel(nextTrip.id)}
            onAccept={() => onAccept(nextTrip.id)}
            onDecline={() => onDecline(nextTrip.id)}
            onOpen={() => router.push(`/listings/${(nextTrip.listing as any).id}`)}
          />
        ) : (
          <NoUpcomingHero
            direction={directionTab}
            onBrowse={() => router.push('/')}
            lifetime={baseList.length}
          />
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-4">
          <StatCard label="Next 7 days" value={stats.next7.toString()} />
          <StatCard
            label={directionTab === 'incoming' ? 'Pending action' : 'Pending'}
            value={stats.pending.toString()}
          />
          <StatCard
            label={directionTab === 'incoming' ? 'Revenue this month' : 'Spend this month'}
            value={`$${stats.monthValue}`}
          />
        </div>

        {/* Controls */}
        <div className="mt-10 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="flex items-baseline gap-3 self-start">
            <h2 className="text-[22px] sm:text-[24px] font-semibold text-stone-900 tracking-tight leading-none">
              {timeTab === 'upcoming' ? 'Upcoming' : 'Past'}
            </h2>
            <span className="text-[14px] text-stone-400 font-medium tabular-nums">
              {timeTab === 'upcoming' ? upcomingAll.length : pastAll.length}
            </span>
            <button
              onClick={() => setTimeTab(timeTab === 'upcoming' ? 'past' : 'upcoming')}
              className="ml-2 text-[12px] text-stone-400 hover:text-stone-900 transition-colors"
            >
              · show {timeTab === 'upcoming' ? 'past' : 'upcoming'}
            </button>
          </div>

          <div className="relative flex-1 sm:max-w-sm sm:ml-auto">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" strokeWidth={2} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                directionTab === 'incoming'
                  ? 'Search by service, customer, place…'
                  : 'Search trips, shops, places…'
              }
              className="w-full h-10 pl-10 pr-4 rounded-full bg-stone-100 border border-stone-200/70 text-[13px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:bg-white focus:border-stone-300 transition-all"
            />
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
                {group.items.map((r, idx) => (
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
                    onOpen={() => router.push(`/listings/${(r.listing as any).id}`)}
                    onRebook={() => router.push(`/listings/${(r.listing as any).id}`)}
                  />
                ))}
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
  const customerName = trip.user?.name || 'Customer';
  const customerAvatar = (trip.user?.image || trip.user?.imageSrc) as string | undefined;

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
      className="relative overflow-hidden rounded-[28px] bg-stone-900 text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)]"
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
      <div aria-hidden className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-amber-400/15 blur-3xl" />
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
                <div>
                  <div className="text-[11px] font-medium text-amber-300/90 leading-none">
                    {format(date, 'EEE, MMM')}
                  </div>
                  <div className="text-[28px] font-bold tabular-nums leading-none mt-1.5 tracking-tight">
                    {format(date, 'd')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-medium text-white/45 leading-none">
                    Time
                  </div>
                  <div className="text-[18px] font-semibold text-white tabular-nums leading-none mt-1.5">
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
                  <span className="text-[26px] font-semibold leading-[1.05] truncate tracking-tight text-white">
                    {listing.title}
                  </span>
                  <ChevronRight className="w-5 h-5 text-white/60 group-hover:translate-x-0.5 transition-transform shrink-0" />
                </button>
                <p className="text-[14px] text-white/65 leading-tight truncate mt-1">
                  {trip.serviceName}
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
                    <p className="text-[12px] font-medium text-white/55 leading-none">
                      {isIncoming ? 'Customer' : 'With'}
                    </p>
                    <p className="text-[15px] text-white font-semibold leading-tight truncate mt-1">
                      {isIncoming ? customerName : employeeName || 'Unassigned'}
                    </p>
                    {!isIncoming && employeeRole && (
                      <p className="text-[11px] text-white/50 leading-tight truncate mt-0.5">
                        {employeeRole}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-2.5">
                <div className="text-[11px] font-medium text-white/45 leading-none">
                  Place
                </div>
                <div className="text-lg font-semibold text-white leading-none mt-1.5 truncate">
                  {!isIncoming && listing.address ? listing.address : '—'}
                </div>
              </div>
            </div>
          </Quadrant>

          {/* Q3 (was Q4): Receipt-style summary */}
          <Quadrant divider>
            <div className="h-full flex flex-col justify-center items-center gap-3 text-center">
              {/* Total label */}
              <span className="text-[12px] font-medium text-white/55">
                {isIncoming
                  ? `Earnings${paymentStatus === 'paid' ? ' · Paid' : ''}`
                  : `Total${paymentStatus === 'paid' ? ' · Paid' : paymentStatus === 'refunded' ? ' · Refunded' : ''}`}
              </span>

              {/* Big price */}
              <div className="relative text-[64px] font-bold tabular-nums tracking-tight leading-none text-white">
                <span className="absolute -left-5 top-2 text-[24px] font-semibold text-white/50">$</span>
                {trip.totalPrice}
              </div>

              {/* Booking # */}
              <div className="mt-3 text-center">
                <div className="text-[11px] font-medium text-white/45 leading-none">
                  Booking
                </div>
                <div className="text-lg font-semibold text-white tabular-nums leading-none mt-1.5">
                  #{bookingShortId}
                </div>
              </div>
            </div>
          </Quadrant>

          {/* Q4 (was Q3): Action buttons aligned with listing image */}
          <Quadrant>
            <div className="flex flex-col h-full min-h-[220px] gap-3 w-full">
            {isIncoming && isPending ? (
              <div className="grid grid-cols-2 grid-rows-2 gap-2 flex-1 w-full">
                <button
                  onClick={onAccept}
                  disabled={disabled}
                  className="inline-flex flex-col items-center justify-center gap-1.5 rounded-xl text-[13px] font-semibold text-white bg-gradient-to-b from-emerald-500 to-emerald-600 border border-emerald-400/60 shadow-[0_4px_14px_-2px_rgba(16,185,129,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50"
                >
                  <Tick02Icon size={22} strokeWidth={2.2} />
                  Accept
                </button>
                <button
                  onClick={onDecline}
                  disabled={disabled}
                  className="inline-flex flex-col items-center justify-center gap-1.5 rounded-xl text-[13px] font-semibold text-white/85 bg-white/5 border border-white/15 hover:bg-red-500/20 hover:text-red-100 hover:border-red-400/40 transition-all disabled:opacity-50"
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
            <div className="h-[44px] shrink-0 flex items-center justify-center">
              <span
                className={`text-[12px] font-medium tracking-wide ${
                  status === 'pending'
                    ? 'text-amber-200/85'
                    : status === 'accepted'
                    ? 'text-emerald-200/85'
                    : 'text-white/55'
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
                    className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full text-[12px] font-semibold text-white bg-gradient-to-b from-emerald-500 to-emerald-600 border border-emerald-400/60 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" strokeWidth={2.8} />
                    Accept
                  </button>
                  <button
                    onClick={onDecline}
                    disabled={disabled}
                    className="inline-flex items-center gap-1.5 px-4 h-9 rounded-full text-[12px] font-semibold text-white/85 bg-white/5 border border-white/15 disabled:opacity-50"
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
  const cls = `inline-flex flex-col items-center justify-center gap-1.5 rounded-xl text-[13px] font-semibold transition-all border ${
    primary
      ? 'bg-white text-stone-900 border-white hover:bg-stone-100'
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
      dot: 'bg-amber-400',
      text: 'text-amber-200',
    },
    accepted: {
      label: 'Confirmed',
      sub: "You're good to go",
      dot: 'bg-emerald-400',
      text: 'text-emerald-200',
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
        <p className={`text-[18px] font-semibold leading-tight ${c.text}`}>{c.label}</p>
        <p className="text-[12px] text-white/55 leading-tight mt-0.5">{c.sub}</p>
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
    <div className={`relative min-h-[220px] flex ${divider ? 'pl-5 border-l border-white/10' : spaced ? 'pl-9' : ''}`}>
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
  let dotColor = 'bg-amber-400';
  let label: React.ReactNode = '';
  let sub: React.ReactNode = null;

  switch (status) {
    case 'pending':
      dotColor = 'bg-amber-400';
      label = isIncoming
        ? 'Awaiting your response'
        : `Awaiting confirmation from ${listingTitle}`;
      sub = `Coming up in ${countdownHeadline.toLowerCase()}`;
      break;
    case 'accepted':
      dotColor = 'bg-emerald-400';
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
      <p className="text-[15px] font-semibold text-white/85 leading-none">{label}</p>
      {sub && <span className="text-[13px] text-white/45 leading-none">· {sub}</span>}
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
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/55">
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
  const cls = `w-full inline-flex items-center ${compact ? 'justify-center' : 'justify-start'} gap-2 px-3.5 h-11 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all border ${
    primary
      ? 'bg-white text-stone-900 border-white hover:bg-stone-100'
      : danger
      ? 'bg-white/0 text-white/75 border-white/15 hover:bg-red-500/15 hover:text-red-200 hover:border-red-400/40'
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
      <div aria-hidden className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-amber-400/15 blur-3xl" />
      <div aria-hidden className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
      <div className="relative max-w-xl">
        <p className="text-[15px] font-semibold text-white/50">
          {isIncoming ? 'Incoming' : 'My bookings'}
        </p>
        <h1 className="mt-3 text-[36px] sm:text-[44px] font-semibold tracking-tight leading-[1.02]">
          {isIncoming ? 'No requests right now.' : 'Nothing on the calendar.'}
        </h1>
        <p className="mt-3 text-[14px] text-white/60 max-w-md">
          {isIncoming
            ? "When clients book your services, they'll appear here for you to accept or decline."
            : lifetime > 0
            ? `You've completed ${lifetime} ${lifetime === 1 ? 'booking' : 'bookings'} so far. Time to book the next one.`
            : 'Find a service, book it in seconds, and your itinerary will live right here.'}
        </p>
        {!isIncoming && (
          <button
            onClick={onBrowse}
            className="mt-7 inline-flex items-center gap-2 px-5 h-11 rounded-full bg-white text-stone-900 text-[13px] font-semibold hover:bg-stone-100 transition-colors"
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
      className={`relative overflow-hidden rounded-2xl border bg-white p-4 sm:p-5 transition-all hover:border-stone-300 ${
        accent === 'amber' ? 'border-amber-200/80' : 'border-stone-200/70'
      }`}
    >
      {accent === 'amber' && (
        <div aria-hidden className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-amber-200/30 blur-2xl" />
      )}
      <p className="relative text-[15px] font-semibold tracking-wider text-stone-400 uppercase">
        {label}
      </p>
      <p className="relative mt-1.5 text-[22px] sm:text-[26px] font-semibold text-stone-900 tabular-nums tracking-tight leading-none">
        {value}
      </p>
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
        <h2 className="text-[18px] font-semibold text-stone-900 tracking-tight">{label}</h2>
        {sublabel && <span className="text-[12px] text-stone-400 font-medium">{sublabel}</span>}
        <span className="ml-auto inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-stone-100 text-stone-500 text-[15px] font-semibold tabular-nums">
          {count}
        </span>
      </div>
      <div className="relative">
        <div className="absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-stone-200 via-stone-200 to-transparent hidden sm:block" />
        <div className="space-y-3">{children}</div>
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
  const customerName = reservation.user?.name || 'Customer';

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
    !isRefunded &&
    paymentStatus !== 'disputed';

  return (
    <div
      style={{
        opacity: 0,
        animation: 'fadeInUp 480ms ease-out both',
        animationDelay: `${Math.min(40 + idx * 40, 320)}ms`,
      }}
      className="relative group"
    >
      <div className="absolute left-[22px] top-[34px] hidden sm:block">
        <div
          className={`relative w-2.5 h-2.5 rounded-full border-2 border-white ${
            isNext ? 'bg-amber-500' : past ? 'bg-stone-300' : 'bg-stone-900'
          } shadow-[0_0_0_3px_rgba(245,245,244,1)]`}
        >
          {isNext && (
            <span
              className="absolute inset-0 rounded-full bg-amber-400"
              style={{ animation: 'pulseDot 1.8s ease-out infinite' }}
            />
          )}
        </div>
      </div>

      <div
        onClick={onOpen}
        className={`sm:ml-12 cursor-pointer rounded-2xl bg-white border transition-all overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.22)] ${
          isNext
            ? 'border-stone-900/15 shadow-[0_8px_24px_-16px_rgba(0,0,0,0.18)]'
            : 'border-stone-200/70 hover:border-stone-300'
        }`}
      >
        <div className="flex items-stretch">
          <div className="flex-shrink-0 w-[70px] sm:w-[84px] py-4 sm:py-5 px-3 flex flex-col items-center justify-center border-r border-stone-100 bg-gradient-to-b from-stone-50/60 to-white">
            <div className="text-[9px] font-bold tracking-[0.18em] text-stone-400 uppercase">
              {format(date, 'MMM')}
            </div>
            <div className="text-[24px] sm:text-[28px] font-semibold text-stone-900 tabular-nums leading-none mt-0.5">
              {format(date, 'd')}
            </div>
            <div className="text-[10px] font-medium text-stone-400 mt-1 uppercase tracking-wide">
              {format(date, 'EEE')}
            </div>
          </div>

          <div className="relative shrink-0 w-[88px] sm:w-[120px] bg-stone-100 overflow-hidden">
            <Image
              src={image}
              alt={listing.title}
              fill
              sizes="120px"
              className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${
                past ? 'grayscale-[35%]' : ''
              }`}
            />
            {today && !past && (
              <div className="absolute top-1.5 left-1.5 px-1.5 h-5 inline-flex items-center rounded-full bg-amber-500 text-white text-[9px] font-bold tracking-wider uppercase shadow-sm">
                Today
              </div>
            )}
            {isIncoming && isPending && (
              <div className="absolute bottom-1.5 left-1.5 px-1.5 h-5 inline-flex items-center rounded-full bg-amber-500 text-white text-[9px] font-bold tracking-wider uppercase shadow-sm">
                Action
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 p-4 sm:p-5 flex flex-col justify-center">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] sm:text-[16px] font-semibold text-stone-900 leading-tight truncate">
                  {reservation.serviceName}
                </h3>
                <p className="text-[12px] sm:text-[13px] text-stone-500 mt-0.5 truncate">
                  {isIncoming ? `${customerName} · ${listing.title}` : listing.title}
                </p>
                <div className="mt-2 flex items-center flex-wrap gap-x-3 gap-y-1 text-[11.5px] text-stone-400">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" strokeWidth={2.2} />
                    {formatTime(reservation.time)}
                  </span>
                  {!isIncoming && employeeName && (
                    <span className="inline-flex items-center gap-1 truncate max-w-[140px]">
                      <UserIcon className="w-3 h-3" strokeWidth={2.2} />
                      <span className="truncate">{employeeName}</span>
                    </span>
                  )}
                  {!isIncoming && listing.address && (
                    <span className="hidden sm:inline-flex items-center gap-1 truncate max-w-[200px]">
                      <MapPin className="w-3 h-3" strokeWidth={2.2} />
                      <span className="truncate">{listing.address}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-2">
                <StatusPill status={status} />
                <div
                  className={`text-[20px] sm:text-[22px] font-bold tabular-nums tracking-tight leading-none ${
                    isRefunded ? 'text-stone-400 line-through' : 'text-stone-900'
                  }`}
                >
                  <span className="text-[12px] font-semibold text-stone-400 align-top mr-0.5">$</span>
                  {reservation.totalPrice}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {isIncoming ? (
                past ? (
                  reservation.user?.email && (
                    <RowAction
                      href={`mailto:${reservation.user.email}`}
                      icon={<UserIcon className="w-3 h-3" strokeWidth={2.2} />}
                      label="Contact"
                    />
                  )
                ) : (
                  <>
                    {reservation.user?.email && (
                      <RowAction
                        href={`mailto:${reservation.user.email}`}
                        icon={<UserIcon className="w-3 h-3" strokeWidth={2.2} />}
                        label="Contact"
                      />
                    )}
                  </>
                )
              ) : past ? (
                <>
                  <RowAction
                    onClick={(e) => { e.stopPropagation(); onRebook(); }}
                    icon={<RotateCw className="w-3 h-3" strokeWidth={2.2} />}
                    label="Book again"
                  />
                  <RowAction
                    onClick={(e) => { e.stopPropagation(); onOpen(); }}
                    icon={<Star className="w-3 h-3" strokeWidth={2.2} />}
                    label="Review"
                  />
                  {canRefund && (
                    <RowAction
                      onClick={(e) => { e.stopPropagation(); onRefund(); }}
                      disabled={disabled}
                      icon={<Undo2 className="w-3 h-3" strokeWidth={2.2} />}
                      label="Request refund"
                    />
                  )}
                </>
              ) : (
                <>
                  {listing.address && (
                    <RowAction
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(listing.address)}`}
                      external
                      icon={<Navigation className="w-3 h-3" strokeWidth={2.2} />}
                      label="Directions"
                    />
                  )}
                  {listing.phoneNumber && (
                    <RowAction
                      href={`tel:${listing.phoneNumber}`}
                      icon={<Phone className="w-3 h-3" strokeWidth={2.2} />}
                      label="Call"
                    />
                  )}
                  {status !== 'cancelled' && (
                    <RowAction
                      onClick={(e) => { e.stopPropagation(); onCancel(); }}
                      disabled={disabled}
                      icon={<X className="w-3 h-3" strokeWidth={2.5} />}
                      label="Cancel"
                      danger
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {isIncoming && isPending && !past && (
          <div className="border-t border-stone-100 bg-gradient-to-b from-amber-50/40 to-white px-4 sm:px-5 py-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-amber-700 font-semibold">
              <span className="relative inline-flex w-1.5 h-1.5">
                <span
                  className="absolute inset-0 rounded-full bg-amber-500"
                  style={{ animation: 'pulseDot 1.8s ease-out infinite' }}
                />
                <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-amber-500" />
              </span>
              Awaiting your response
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onDecline(); }}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 px-3.5 h-8 rounded-full text-[12px] font-semibold text-stone-600 bg-white border border-stone-200 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all disabled:opacity-50"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2.6} />
                Decline
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onAccept(); }}
                disabled={disabled}
                className="inline-flex items-center gap-1.5 px-4 h-8 rounded-full text-[12px] font-semibold text-white bg-gradient-to-b from-emerald-500 to-emerald-600 border border-emerald-400/60 shadow-[0_2px_8px_-1px_rgba(16,185,129,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" strokeWidth={2.8} />
                Accept
              </button>
            </div>
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
  const cls = `inline-flex items-center gap-1.5 px-3.5 h-9 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all backdrop-blur-md border ${
    primary
      ? 'bg-white text-stone-900 border-white hover:bg-stone-100'
      : danger
      ? 'bg-white/0 text-white/80 border-white/15 hover:bg-red-500/15 hover:text-red-200 hover:border-red-400/40'
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
  const cls = `inline-flex items-center gap-1 px-2.5 h-7 rounded-full text-[11px] font-medium border transition-colors ${
    accent
      ? 'border-stone-900 bg-stone-900 text-white hover:bg-stone-800'
      : danger
      ? 'border-stone-200 text-stone-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50'
      : 'border-stone-200 text-stone-500 hover:text-stone-900 hover:border-stone-300 hover:bg-stone-50'
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
    <div className="rounded-3xl border border-dashed border-stone-200 bg-white py-20 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-stone-100 mx-auto flex items-center justify-center mb-5">
        <Inbox className="w-6 h-6 text-stone-400" strokeWidth={1.5} />
      </div>
      <p className="text-[15px] font-medium text-stone-800">
        {hasQuery
          ? 'No matches'
          : `No ${timeTab} ${isIncoming ? 'requests' : 'bookings'}`}
      </p>
      <p className="text-[13px] text-stone-400 mt-1.5 max-w-xs mx-auto">
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
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-100 text-stone-700 text-[13px] font-medium hover:bg-stone-200 transition-colors"
        >
          Clear search
        </button>
      ) : (
        timeTab === 'upcoming' && !isIncoming && (
          <button
            onClick={onBrowse}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 text-white text-[13px] font-medium hover:bg-stone-800 transition-colors"
          >
            Browse services
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
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
  accepted: 'text-emerald-700',
  pending: 'text-amber-700',
  declined: 'text-stone-500',
  cancelled: 'text-stone-400',
};

const HERO_TEXT_COLORS: Record<UiStatus, string> = {
  accepted: 'text-emerald-200/90',
  pending: 'text-amber-200/90',
  declined: 'text-white/60',
  cancelled: 'text-white/55',
};

function StatusPill({ status }: { status: UiStatus }) {
  return (
    <span className={`text-[15px] font-semibold ${ROW_TEXT_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function HeroStatusPill({ status }: { status: UiStatus }) {
  return (
    <span className={`text-[15px] font-semibold ${HERO_TEXT_COLORS[status]}`}>
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
