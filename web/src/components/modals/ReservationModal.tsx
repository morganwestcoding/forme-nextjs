'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import {
  Navigation03Icon,
  Call02Icon,
  CalendarAdd02Icon,
  Tick02Icon,
  Cancel01Icon,
  ArrowUpRight01Icon,
  Clock01Icon,
  Mail01Icon,
  UserIcon,
  Briefcase01Icon,
  CreditCardIcon,
} from 'hugeicons-react';

import Modal from './Modal';
import useReservationModal from '@/app/hooks/useReservationModal';
import { placeholderDataUri } from '@/lib/placeholders';

type UiStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

const STATUS_LABELS: Record<UiStatus, string> = {
  accepted: 'Confirmed',
  pending: 'Pending',
  declined: 'Declined',
  cancelled: 'Cancelled',
};

const STATUS_TEXT_COLORS: Record<UiStatus, string> = {
  accepted: 'text-emerald-700 dark:text-emerald-300',
  pending: 'text-amber-700 dark:text-amber-300',
  declined: 'text-stone-500 dark:text-stone-400',
  cancelled: 'text-stone-400 dark:text-stone-500',
};

const normalizeStatus = (s: string): UiStatus => {
  if (s === 'accepted' || s === 'declined' || s === 'cancelled') return s;
  return 'pending';
};

function formatTime(time: string) {
  const [hh, mm] = time.split(':');
  const h = parseInt(hh, 10);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${mm} ${period}`;
}

function combineDateTime(date: Date, time: string): Date {
  const [h, m] = time.split(':').map((v) => parseInt(v, 10));
  const d = new Date(date);
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

const ReservationModal: React.FC = () => {
  const {
    isOpen,
    reservation,
    direction,
    past,
    onCancel,
    onRefund,
    onAccept,
    onDecline,
    onViewListing,
    onRebook,
    onClose,
  } = useReservationModal();

  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const listing = (reservation?.listing as any) || null;
  const isIncoming = direction === 'incoming';
  const status = reservation ? normalizeStatus(reservation.status) : 'pending';
  const isPending = status === 'pending';
  const date = reservation ? new Date(reservation.date) : new Date();

  const employee = listing?.employees?.find(
    (e: any) => e.id === reservation?.employeeId,
  );
  const employeeName = employee?.fullName as string | undefined;
  const employeeAvatar = (employee?.user?.image || employee?.user?.imageSrc) as
    | string
    | undefined;
  const employeeRole = employee?.jobTitle as string | undefined;

  const customerName =
    reservation?.user?.name ||
    (reservation as any)?.guestName ||
    'Guest customer';
  const customerAvatar = (reservation?.user?.image ||
    reservation?.user?.imageSrc) as string | undefined;
  const customerEmail =
    reservation?.user?.email || (reservation as any)?.guestEmail || null;
  const customerPhone = (reservation as any)?.guestPhone || null;
  const isGuestBooking = reservation && !reservation.user;

  const serviceCount =
    ((reservation as any)?.serviceIds?.length as number) || 1;
  const serviceLabel =
    serviceCount > 1
      ? `${serviceCount} services`
      : reservation?.serviceName || '';
  const matchedService = listing?.services?.find(
    (s: any) => s.serviceName === reservation?.serviceName,
  );
  const durationMin = matchedService?.durationMinutes as number | undefined;

  const bookingShortId = reservation
    ? reservation.id.slice(-6).toUpperCase()
    : '';
  const paymentStatus = reservation?.paymentStatus as string | undefined;
  const refundStatus = (reservation as any)?.refundStatus as string | undefined;
  const isRefunded =
    paymentStatus === 'refunded' || refundStatus === 'completed';

  const directionsHref = listing?.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(listing.address)}`
    : null;

  const calendarHref = useMemo(() => {
    if (!reservation || !listing) return null;
    const start = combineDateTime(date, reservation.time);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const fmt = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `${reservation.serviceName} — ${listing.title}`,
      dates: `${fmt(start)}/${fmt(end)}`,
      details: `Booking via ForMe${employeeName ? ` with ${employeeName}` : ''}`,
      location: listing.address || '',
    });
    return `https://www.google.com/calendar/render?${params.toString()}`;
  }, [reservation, listing, date, employeeName]);

  const canCancel =
    !!reservation &&
    !past &&
    status !== 'cancelled' &&
    status !== 'declined' &&
    !!(isIncoming ? onDecline : onCancel);

  const canRefund =
    !!reservation &&
    !isIncoming &&
    paymentStatus === 'paid' &&
    !isRefunded &&
    !!onRefund;

  const handleAction = async (fn?: () => Promise<void> | void) => {
    if (!fn) return;
    setBusy(true);
    try {
      await fn();
      onClose();
    } finally {
      setBusy(false);
      setConfirmCancel(false);
    }
  };

  if (!reservation || !listing) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={onClose}
        body={<div />}
      />
    );
  }

  const image =
    listing.imageSrc ||
    listing.galleryImages?.[0] ||
    placeholderDataUri(listing.title || 'Listing');

  const body = (
    <div className="flex flex-col gap-5">
      {/* Header — image + title + address + status */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            onClose();
            onViewListing?.();
          }}
          className="relative shrink-0 w-[76px] h-[76px] rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 ring-1 ring-stone-200/70 dark:ring-stone-700 hover:ring-stone-300 dark:hover:ring-stone-600 transition"
        >
          <Image
            src={image}
            alt={listing.title}
            fill
            sizes="76px"
            className="object-cover"
          />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 leading-tight tracking-[-0.015em] truncate">
            {listing.title}
          </h2>
          {listing.address && (
            <p className="text-xs text-stone-500 dark:text-stone-500 truncate mt-1">
              {listing.address}
            </p>
          )}
          <p
            className={`text-xs leading-none mt-2 ${STATUS_TEXT_COLORS[status]}`}
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: 'italic' }}
          >
            {STATUS_LABELS[status]}
            <span className="text-stone-400 dark:text-stone-500"> · #{bookingShortId}</span>
          </p>
        </div>
      </div>

      {/* Date + time block */}
      <div className="rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-700 px-4 py-3.5 flex items-center gap-4">
        <div className="flex flex-col items-center justify-center w-12 shrink-0">
          <span className="text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider">
            {format(date, 'MMM')}
          </span>
          <span className="text-2xl font-semibold tabular-nums leading-none text-stone-900 dark:text-stone-100 mt-0.5">
            {format(date, 'd')}
          </span>
          <span className="text-xs font-medium text-stone-400 dark:text-stone-500 mt-0.5">
            {format(date, 'EEE')}
          </span>
        </div>
        <div className="w-px h-12 bg-stone-200 dark:bg-stone-700" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">
            Appointment
          </p>
          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 mt-0.5 flex items-center gap-2">
            <Clock01Icon size={14} strokeWidth={1.8} />
            {formatTime(reservation.time)}
            {durationMin ? (
              <span className="text-xs text-stone-400 dark:text-stone-500 font-normal">
                · {durationMin} min
              </span>
            ) : null}
          </p>
        </div>
      </div>

      {/* Detail rows */}
      <dl className="rounded-2xl border border-stone-200/70 dark:border-stone-700 divide-y divide-stone-200/70 dark:divide-stone-700 overflow-hidden">
        <DetailRow
          icon={<Briefcase01Icon size={15} strokeWidth={1.8} />}
          label="Service"
          value={serviceLabel}
        />
        <DetailRow
          icon={<UserIcon size={15} strokeWidth={1.8} />}
          label={isIncoming ? 'Customer' : 'With'}
          value={
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-7 h-7 rounded-full overflow-hidden bg-stone-100 dark:bg-stone-800 ring-1 ring-stone-200/60 dark:ring-stone-700 shrink-0">
                {(isIncoming ? customerAvatar : employeeAvatar) ? (
                  <Image
                    src={(isIncoming ? customerAvatar : employeeAvatar)!}
                    alt=""
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400 dark:text-stone-500">
                    <UserIcon size={14} strokeWidth={1.8} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                  {isIncoming
                    ? `${customerName}${isGuestBooking ? ' (guest)' : ''}`
                    : employeeName || 'Unassigned'}
                </p>
                {!isIncoming && employeeRole && (
                  <p className="text-xs text-stone-400 dark:text-stone-500 truncate">
                    {employeeRole}
                  </p>
                )}
              </div>
            </div>
          }
        />
        <DetailRow
          icon={<CreditCardIcon size={15} strokeWidth={1.8} />}
          label={isIncoming ? 'Earnings' : 'Total'}
          value={
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-semibold tabular-nums ${
                  isRefunded
                    ? 'text-stone-400 dark:text-stone-500 line-through'
                    : 'text-stone-900 dark:text-stone-100'
                }`}
              >
                ${reservation.totalPrice}
              </span>
              {paymentStatus === 'paid' && !isRefunded && (
                <span className="text-xs font-medium px-1.5 h-5 rounded-md inline-flex items-center bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Paid
                </span>
              )}
              {isRefunded && (
                <span className="text-xs font-medium px-1.5 h-5 rounded-md inline-flex items-center bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                  Refunded
                </span>
              )}
            </div>
          }
        />
      </dl>

      {/* Contact */}
      {(listing.phoneNumber ||
        (isIncoming && (customerPhone || customerEmail))) && (
        <div>
          <p className="text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2">
            Contact
          </p>
          <div className="flex flex-col gap-2">
            {isIncoming ? (
              <>
                {customerPhone && (
                  <ContactLink
                    href={`tel:${customerPhone}`}
                    icon={<Call02Icon size={15} strokeWidth={1.8} />}
                    label={customerPhone}
                  />
                )}
                {customerEmail && (
                  <ContactLink
                    href={`mailto:${customerEmail}`}
                    icon={<Mail01Icon size={15} strokeWidth={1.8} />}
                    label={customerEmail}
                  />
                )}
              </>
            ) : (
              <>
                {listing.phoneNumber && (
                  <ContactLink
                    href={`tel:${listing.phoneNumber}`}
                    icon={<Call02Icon size={15} strokeWidth={1.8} />}
                    label={listing.phoneNumber}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-2">
        <QuickAction
          href={directionsHref}
          external
          icon={<Navigation03Icon size={16} strokeWidth={1.8} />}
          label="Directions"
        />
        <QuickAction
          href={calendarHref}
          external
          icon={<CalendarAdd02Icon size={16} strokeWidth={1.8} />}
          label="Calendar"
        />
        <QuickAction
          onClick={() => {
            onClose();
            onViewListing?.();
          }}
          icon={<ArrowUpRight01Icon size={16} strokeWidth={1.8} />}
          label="View"
        />
      </div>

      {/* Primary action zone */}
      {isIncoming && isPending && !past ? (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => handleAction(onDecline)}
            disabled={busy}
            className="inline-flex items-center justify-center gap-1.5 h-11 rounded-xl text-sm font-semibold text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-300 dark:hover:border-red-500/30 transition-all disabled:opacity-50"
          >
            <Cancel01Icon size={16} strokeWidth={2} />
            Decline
          </button>
          <button
            onClick={() => handleAction(onAccept)}
            disabled={busy}
            className="inline-flex items-center justify-center gap-1.5 h-11 rounded-xl text-sm font-semibold text-white bg-gradient-to-b from-emerald-500 to-emerald-600 border border-emerald-400/60 shadow-[0_2px_8px_-1px_rgba(16,185,129,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:opacity-50"
          >
            <Tick02Icon size={16} strokeWidth={2.4} />
            Accept
          </button>
        </div>
      ) : canCancel ? (
        confirmCancel ? (
          <div className="rounded-2xl border border-red-200/70 dark:border-red-500/30 bg-red-50/60 dark:bg-red-500/10 px-4 py-3.5">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              {isIncoming ? 'Decline this booking?' : 'Cancel this booking?'}
            </p>
            <p className="text-xs text-red-700/80 dark:text-red-300/80 mt-1">
              {isIncoming
                ? 'The customer will be notified and refunded if applicable.'
                : 'You will be refunded if eligible. This cannot be undone.'}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setConfirmCancel(false)}
                disabled={busy}
                className="flex-1 inline-flex items-center justify-center h-10 rounded-xl text-sm font-medium text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all disabled:opacity-50"
              >
                Keep it
              </button>
              <button
                onClick={() => handleAction(isIncoming ? onDecline : onCancel)}
                disabled={busy}
                className="flex-1 inline-flex items-center justify-center gap-1.5 h-10 rounded-xl text-sm font-semibold text-white bg-gradient-to-b from-red-500 to-red-600 border border-red-400/60 hover:from-red-400 hover:to-red-500 transition-all disabled:opacity-50"
              >
                {busy ? 'Working…' : isIncoming ? 'Decline' : 'Cancel booking'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setConfirmCancel(true)}
              disabled={busy}
              className="inline-flex items-center justify-center gap-1.5 h-11 rounded-xl text-sm font-semibold text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-500/10 dark:hover:text-red-300 dark:hover:border-red-500/30 transition-all disabled:opacity-50"
            >
              <Cancel01Icon size={16} strokeWidth={2} />
              {isIncoming ? 'Decline booking' : 'Cancel booking'}
            </button>
            {canRefund && (
              <button
                onClick={() => handleAction(onRefund)}
                disabled={busy}
                className="inline-flex items-center justify-center gap-1.5 h-10 rounded-xl text-xs font-medium text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors disabled:opacity-50"
              >
                Request refund
              </button>
            )}
          </div>
        )
      ) : past && !isIncoming && onRebook ? (
        <button
          onClick={() => {
            onClose();
            onRebook();
          }}
          className="inline-flex items-center justify-center gap-1.5 h-11 rounded-xl text-sm font-semibold text-white bg-gradient-to-b from-stone-800 to-stone-900 dark:from-stone-100 dark:to-white dark:text-stone-900 hover:from-stone-700 hover:to-stone-800 dark:hover:from-stone-200 transition-all"
        >
          Book again
        </button>
      ) : null}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onClose}
      title="Reservation details"
      body={body}
      disabled={busy}
    />
  );
};

export default ReservationModal;

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-stone-900">
      <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400 shrink-0">
        {icon}
      </div>
      <span className="text-xs text-stone-400 dark:text-stone-500 w-20 shrink-0">
        {label}
      </span>
      <div className="min-w-0 flex-1 text-sm text-stone-900 dark:text-stone-100 truncate">
        {value}
      </div>
    </div>
  );
}

function ContactLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-3 px-4 h-11 rounded-xl border border-stone-200/70 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
    >
      <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400 shrink-0">
        {icon}
      </div>
      <span className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
        {label}
      </span>
    </a>
  );
}

function QuickAction({
  href,
  external,
  onClick,
  icon,
  label,
}: {
  href?: string | null;
  external?: boolean;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  const cls =
    'inline-flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl text-xs font-medium text-stone-700 dark:text-stone-200 bg-stone-50 dark:bg-stone-800/50 border border-stone-200/70 dark:border-stone-700 hover:bg-white dark:hover:bg-stone-800 hover:border-stone-300 dark:hover:border-stone-600 transition-all disabled:opacity-50 disabled:pointer-events-none';
  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={cls}
      >
        {icon}
        {label}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cls}
    >
      {icon}
      {label}
    </button>
  );
}
