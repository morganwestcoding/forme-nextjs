'use client';

import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useCallback, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format, isToday, isTomorrow, isThisWeek, differenceInCalendarDays } from 'date-fns';
import { Inbox, ArrowUpRight } from 'lucide-react';

import { SafeReservation, SafeUser } from '@/app/types';
import Container from '@/components/Container';
import ReserveCard from '@/components/listings/ReserveCard';
import PageHeader from '@/components/PageHeader';

interface TripsClientProps {
  reservations: SafeReservation[];
  currentUser?: SafeUser | null;
}

type TimeTab = 'upcoming' | 'past';

const TripsClient: React.FC<TripsClientProps> = ({ reservations, currentUser }) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState('');
  const [timeTab, setTimeTab] = useState<TimeTab>('upcoming');

  const gridColsClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  const onCancel = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      await axios.delete(`/api/reservations/${id}`);
      toast.success('Trip cancelled');
      router.refresh();
    } catch { toast.error('Something went wrong.'); }
    finally { setDeletingId(''); }
  }, [router]);

  const now = new Date();
  const filtered = useMemo(() => {
    return reservations
      .filter(r => timeTab === 'upcoming' ? new Date(r.date) >= now : new Date(r.date) < now)
      .sort((a, b) =>
        timeTab === 'upcoming'
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      );
  }, [reservations, timeTab, now]);

  const upcomingAll = useMemo(
    () => reservations.filter(r => new Date(r.date) >= now),
    [reservations, now]
  );

  const grouped = useMemo(() => {
    if (timeTab !== 'upcoming') return null;
    const today: SafeReservation[] = [];
    const tomorrow: SafeReservation[] = [];
    const thisWeek: SafeReservation[] = [];
    const later: SafeReservation[] = [];
    for (const r of filtered) {
      const d = new Date(r.date);
      if (isToday(d)) today.push(r);
      else if (isTomorrow(d)) tomorrow.push(r);
      else if (isThisWeek(d, { weekStartsOn: 1 })) thisWeek.push(r);
      else later.push(r);
    }
    return { today, tomorrow, thisWeek, later };
  }, [filtered, timeTab]);

  // The single "next" reservation across all upcoming groups gets a subtle accent
  const nextUpId = timeTab === 'upcoming' ? upcomingAll[0]?.id : undefined;

  const renderCard = (reservation: SafeReservation, idx: number) => {
    const isNext = reservation.id === nextUpId;
    return (
      <div
        key={reservation.id}
        style={{
          opacity: 0,
          animation: 'fadeInUp 520ms ease-out both',
          animationDelay: `${Math.min(40 + idx * 25, 320)}ms`,
        }}
        className={`relative rounded-2xl bg-white border p-4 transition-colors ${
          isNext
            ? 'border-stone-900/15 shadow-[0_1px_0_0_rgba(0,0,0,0.02),0_8px_24px_-16px_rgba(0,0,0,0.18)]'
            : 'border-stone-200/60 hover:border-stone-300/80'
        }`}
      >
        {isNext && (
          <>
            <span
              aria-hidden
              className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full bg-stone-900"
            />
            <span className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 h-5 rounded-full bg-stone-900 text-white text-[10px] font-semibold tracking-wide">
              NEXT
              <span className="text-white/60 font-medium normal-case tracking-normal">
                · {nextCountdown(reservation)}
              </span>
            </span>
          </>
        )}
        <ReserveCard
          reservation={reservation}
          listing={reservation.listing}
          currentUser={currentUser}
          disabled={deletingId === reservation.id}
          onCancel={() => onCancel(reservation.id)}
          onCardClick={() => router.push(`/listings/${reservation.listing.id}`)}
        />
      </div>
    );
  };

  return (
    <Container>
      <PageHeader currentUser={currentUser} />

      <div className="mt-6 sm:mt-8">
        <div className="mb-6">
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-stone-900 tracking-tight leading-tight">
            My Trips
          </h1>
          <p className="text-[13px] text-stone-400 mt-1">
            {upcomingAll.length} upcoming · {filtered.length} {timeTab}
          </p>
        </div>

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

        {filtered.length === 0 ? (
          <EmptyState timeTab={timeTab} onBrowse={() => router.push('/')} />
        ) : grouped ? (
          <div className="space-y-10">
            <Group title="Today" items={grouped.today} gridClass={gridColsClass} render={renderCard} />
            <Group title="Tomorrow" items={grouped.tomorrow} gridClass={gridColsClass} render={renderCard} />
            <Group title="This week" items={grouped.thisWeek} gridClass={gridColsClass} render={renderCard} />
            <Group title="Later" items={grouped.later} gridClass={gridColsClass} render={renderCard} />
          </div>
        ) : (
          <div className={`grid ${gridColsClass} gap-4`}>{filtered.map(renderCard)}</div>
        )}
      </div>
    </Container>
  );
};

export default TripsClient;

/* ------------------------------ helpers ------------------------------ */

function nextCountdown(r: SafeReservation): string {
  const date = new Date(r.date);
  const days = differenceInCalendarDays(date, new Date());
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `${days}d`;
  return format(date, 'MMM d');
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
      <div className={`grid ${gridClass} gap-4`}>{items.map(render)}</div>
    </section>
  );
}

function EmptyState({ timeTab, onBrowse }: { timeTab: TimeTab; onBrowse: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-200 bg-white py-20 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-stone-100 mx-auto flex items-center justify-center mb-5">
        <Inbox className="w-6 h-6 text-stone-400" strokeWidth={1.5} />
      </div>
      <p className="text-[15px] font-medium text-stone-800">
        No {timeTab} trips
      </p>
      <p className="text-[13px] text-stone-400 mt-1.5 max-w-xs mx-auto">
        {timeTab === 'upcoming'
          ? 'Book a service to see your upcoming trips here.'
          : 'Your completed trips will show up here.'}
      </p>
      {timeTab === 'upcoming' && (
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
