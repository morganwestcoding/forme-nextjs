'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

import { placeholderDataUri } from '@/lib/placeholders';
import { Tick02Icon as Check, Calendar03Icon as CalendarIcon, Clock01Icon as Clock, UserIcon, Location01Icon as MapPin } from 'hugeicons-react';

interface ReservationView {
  id?: string;
  serviceName?: string;
  serviceCount?: number;
  date?: string | Date;
  time?: string;
  subtotal?: number;
  tipAmount?: number;
  totalPrice?: number;
  isGuest?: boolean;
  guestEmail?: string | null;
  listing?: {
    id?: string;
    title?: string;
    imageSrc?: string | null;
    address?: string | null;
    location?: string | null;
  };
  employee?: {
    fullName?: string;
    jobTitle?: string;
  };
}

const formatTime = (t?: string) => {
  if (!t) return '';
  try {
    return format(new Date(`2021-01-01T${t}`), 'h:mm a');
  } catch {
    return t;
  }
};

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams?.get('session_id') || '';

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [reservation, setReservation] = useState<ReservationView | null>(null);

  useEffect(() => {
    const verify = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.get(`/api/checkout/verify?session_id=${sessionId}`);
        if (data.success) {
          setSuccess(true);
          if (data.reservation) setReservation(data.reservation);
        }
      } catch {
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center px-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 rounded-full border-2 border-stone-200 dark:border-stone-800 border-t-stone-900 animate-spin" />
          <p className="mt-5 text-[14px] text-stone-500  dark:text-stone-500">Confirming your reservation…</p>
        </div>
      </div>
    );
  }

  if (!success) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/70 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 mx-auto flex items-center justify-center mb-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-red-500">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
          <h1 className="text-[20px] font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
            We couldn&apos;t verify your payment
          </h1>
          <p className="text-[13px] text-stone-500  dark:text-stone-500 mt-2">
            If you were charged, your booking will appear in My Trips shortly. Please contact support if it doesn&apos;t.
          </p>
          <div className="flex gap-2.5 mt-6">
            <Link
              href="/"
              className="flex-1 py-3 rounded-2xl bg-stone-100  text-stone-700 dark:text-stone-200 text-[13px] font-medium hover:bg-stone-200 dark:bg-stone-700 transition-colors"
            >
              Go home
            </Link>
            <Link
              href="/bookings/reservations"
              className="flex-1 py-3 rounded-2xl bg-stone-900 text-white text-[13px] font-medium hover:bg-stone-800 transition-colors"
            >
              My trips
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const dateObj = reservation?.date ? new Date(reservation.date) : null;
  const heroImage =
    reservation?.listing?.imageSrc ||
    placeholderDataUri(reservation?.listing?.title || 'Booking');

  return (
    // Vertically center the confirmation card on the viewport so the user
    // lands looking right at it after the Stripe redirect. Page scrolls
    // naturally when content overflows on shorter viewports.
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 flex items-center justify-center">
      <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-12">
        {/* Confirmation header */}
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-full bg-stone-900 mx-auto flex items-center justify-center"
            style={{ animation: 'pop 420ms cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
          >
            <Check className="w-6 h-6 text-white" strokeWidth={3} />
          </div>
          <h1 className="mt-6 text-[26px] sm:text-[30px] font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
            You&apos;re booked
          </h1>
          <p className="text-[14px] text-stone-500  dark:text-stone-500 mt-2">
            We&apos;ve sent a confirmation to your email.
          </p>
        </div>

        {/* Reservation card */}
        {reservation && (
          <div className="rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/70 overflow-hidden">
            <div className="flex items-center gap-4 p-5 border-b border-stone-100 dark:border-stone-800">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 flex-shrink-0">
                <Image
                  src={heroImage}
                  alt={reservation.listing?.title || 'Booking'}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-stone-900 dark:text-stone-100 leading-snug truncate">
                  {reservation.listing?.title || 'Your booking'}
                </h2>
                <p className="text-[12px] text-stone-500  dark:text-stone-500 mt-0.5 truncate">
                  {reservation.serviceCount && reservation.serviceCount > 1
                    ? `${reservation.serviceCount} services`
                    : reservation.serviceName}
                </p>
              </div>
            </div>

            <div className="p-5 space-y-3.5">
              <DetailRow icon={<CalendarIcon className="w-4 h-4" strokeWidth={1.75} />} label="Date">
                {dateObj
                  ? format(dateObj, 'EEEE, MMMM d, yyyy')
                  : '—'}
              </DetailRow>
              <DetailRow icon={<Clock className="w-4 h-4" strokeWidth={1.75} />} label="Time">
                {formatTime(reservation.time) || '—'}
              </DetailRow>
              {reservation.employee?.fullName && (
                <DetailRow icon={<UserIcon className="w-4 h-4" strokeWidth={1.75} />} label="With">
                  {reservation.employee.fullName}
                  {reservation.employee.jobTitle && (
                    <span className="text-stone-400 dark:text-stone-500"> · {reservation.employee.jobTitle}</span>
                  )}
                </DetailRow>
              )}
              {(reservation.listing?.address || reservation.listing?.location) && (
                <DetailRow icon={<MapPin className="w-4 h-4" strokeWidth={1.75} />} label="Location">
                  {reservation.listing?.address || reservation.listing?.location}
                </DetailRow>
              )}
            </div>

            <div className="px-5 py-4 bg-stone-50/60 border-t border-stone-100 dark:border-stone-800 space-y-1.5">
              {typeof reservation.tipAmount === 'number' && reservation.tipAmount > 0 && typeof reservation.subtotal === 'number' && (
                <>
                  <div className="flex items-baseline justify-between text-[12px] text-stone-500 dark:text-stone-500">
                    <span>Subtotal</span>
                    <span className="tabular-nums">${reservation.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-baseline justify-between text-[12px] text-stone-500 dark:text-stone-500">
                    <span>Tip</span>
                    <span className="tabular-nums">${reservation.tipAmount.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] text-stone-500 dark:text-stone-500">Total paid</span>
                <span className="text-[18px] font-semibold text-stone-900 dark:text-stone-100 tabular-nums">
                  ${(reservation.totalPrice ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions — guests have no account, so no "My Trips" view. They get
            a single "Keep browsing" CTA + a hint to check their email. */}
        <div className="flex gap-2.5 mt-6">
          <Link
            href="/"
            className={`text-center py-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/70 text-stone-700 dark:text-stone-200 text-[13px] font-medium hover:border-stone-300 dark:border-stone-700 transition-colors ${reservation?.isGuest ? 'flex-1' : 'flex-1'}`}
          >
            Keep browsing
          </Link>
          {!reservation?.isGuest && (
            <Link
              href="/bookings/reservations"
              className="flex-1 text-center py-3.5 rounded-2xl bg-stone-900 text-white text-[13px] font-medium hover:bg-stone-800 transition-colors"
            >
              View my trips
            </Link>
          )}
        </div>

        <p className="text-center text-[12px] text-stone-400 dark:text-stone-500 mt-5">
          {reservation?.isGuest
            ? 'A confirmation has been sent to your email. Reply to that email to cancel or reschedule.'
            : 'You can cancel or reschedule from My Trips.'}
        </p>
      </div>

      <style jsx>{`
        @keyframes pop {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800 flex items-center justify-center text-stone-500  dark:text-stone-500 flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-wider text-stone-400 dark:text-stone-500 font-medium">
          {label}
        </div>
        <div className="text-[14px] text-stone-900 dark:text-stone-100 mt-0.5 leading-snug">
          {children}
        </div>
      </div>
    </div>
  );
}
