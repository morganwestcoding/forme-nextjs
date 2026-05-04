'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { SafeReservation, SafeUser } from '@/app/types';
import { placeholderDataUri } from '@/lib/placeholders';

interface ReserveCardListing {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  category: string;
  location: string | null;
  userId: string;
  createdAt: string;
  services: Array<{
    id: string;
    serviceName: string;
    price: number;
    category: string;
  }>;
  phoneNumber?: string | null;
  website?: string | null;
  address?: string | null;
  zipCode?: string | null;
  galleryImages?: string[];
  employees?: Array<{
    id: string;
    fullName: string;
  }>;
  storeHours?: Array<{
    dayOfWeek: string;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }>;
}

interface ReserveCardProps {
  reservation: SafeReservation;
  listing: ReserveCardListing;
  currentUser?: SafeUser | null;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
  onRefund?: () => void;
  disabled?: boolean;
  showAcceptDecline?: boolean;
  showCancel?: boolean;
  onCardClick?: () => void;
}

type UiStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

const normalizeStatus = (status: string): UiStatus => {
  if (status === 'accepted') return 'accepted';
  if (status === 'declined') return 'declined';
  if (status === 'cancelled') return 'cancelled';
  return 'pending';
};

const ReserveCard: React.FC<ReserveCardProps> = ({
  reservation,
  listing,
  onAccept,
  onDecline,
  onCancel,
  onRefund,
  disabled,
  showAcceptDecline,
  showCancel,
  onCardClick,
}) => {
  const uiStatus = normalizeStatus(reservation.status);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [localStatus, setLocalStatus] = useState<UiStatus>(uiStatus);

  const employeeName = listing.employees?.find(emp => emp.id === reservation.employeeId)?.fullName;
  const cardImage = listing.imageSrc || listing.galleryImages?.[0] || placeholderDataUri(listing.title || 'Listing');

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTransitioning(true);
    setTimeout(() => {
      setLocalStatus('accepted');
      setIsTransitioning(false);
      onAccept?.();
    }, 150);
  };

  const handleReject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDecline) onDecline();
    else if (onCancel) onCancel();
  };

  const showActions = showAcceptDecline || showCancel;
  const isPending = localStatus === 'pending';

  const refundStatus = (reservation as any).refundStatus as string | null | undefined;
  const paymentStatus = reservation.paymentStatus as string | null | undefined;
  const hasPayment = !!reservation.paymentIntentId;

  const statusConfig = {
    accepted: { label: 'Confirmed', bg: 'bg-success/90 text-white border-success/50 shadow-glow-success' },
    declined: { label: 'Declined', bg: 'bg-black/60 text-white/90 border-white/20' },
    pending: { label: 'Pending', bg: 'bg-warning/90 text-white border-amber-400/50 shadow-glow-warning' },
    cancelled: { label: 'Cancelled', bg: 'bg-stone-500/90 text-white border-stone-400/50' },
  };

  const isRefunded = paymentStatus === 'refunded' || refundStatus === 'completed';
  const isRefundRequested = refundStatus === 'requested';
  const isDisputed = paymentStatus === 'disputed';
  const canRefund = onRefund
    && hasPayment
    && !refundStatus
    && paymentStatus !== 'refunded'
    && paymentStatus !== 'disputed'
    && localStatus !== 'cancelled'
    && localStatus !== 'declined';

  const status = statusConfig[localStatus];

  return (
    <div
      onClick={onCardClick}
      className="group cursor-pointer rounded-xl transition-all duration-300"
    >
      <div className="flex flex-row gap-4 items-center w-full relative">
        {/* Image card */}
        <div className="relative overflow-hidden rounded-xl bg-stone-900 flex-shrink-0 w-[120px] h-[120px] transition-[transform,filter] duration-500 ease-out group-hover:scale-[1.02]">
          <Image
            src={cardImage}
            alt={listing.title}
            fill
            className="object-cover transition-[transform,filter] duration-700 ease-out group-hover:brightness-105"
            sizes="120px"
            priority={false}
          />
          {/* Status indicator */}
          <div className="absolute bottom-2 left-2 z-20">
            <span
              className={`inline-flex items-center justify-center text-[10px] font-semibold px-2.5 h-[22px] rounded-full backdrop-blur-md border ${status.bg}`}
              style={{ lineHeight: '22px' }}
            >
              {status.label}
            </span>
          </div>
        </div>

        {/* Action circles — pinned right with left divider */}
        {showActions && (
          <div className="absolute top-1/2 -translate-y-1/2 right-0 flex flex-col items-center gap-2.5 pl-4 border-l border-stone-900">
            {isPending && !isTransitioning ? (
              <>
                <button
                  disabled={disabled}
                  onClick={handleAccept}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                    disabled
                      ? 'bg-stone-100 dark:bg-stone-800 text-stone-300'
                      : 'bg-stone-900 text-white hover:bg-stone-800 hover:scale-110 active:scale-95'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
                <button
                  disabled={disabled}
                  onClick={handleReject}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                    disabled
                      ? 'bg-stone-100 dark:bg-stone-800 text-stone-300'
                      : 'bg-stone-100  text-stone-500   hover:bg-stone-200 dark:bg-stone-700 hover:text-stone-700 dark:hover:text-stone-300 dark:text-stone-200 hover:scale-110 active:scale-95'
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </>
            ) : (
              <button
                disabled={disabled}
                onClick={handleReject}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
                  disabled
                    ? 'bg-stone-100 dark:bg-stone-800 text-stone-300'
                    : 'bg-stone-100  text-stone-500   hover:bg-stone-200 dark:bg-stone-700 hover:text-stone-700 dark:hover:text-stone-300 dark:text-stone-200 hover:scale-110 active:scale-95'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Text content */}
        <div className={`flex flex-col justify-center min-w-0 flex-1 gap-1 ${showActions ? 'pr-16' : ''}`}>
          {/* Date & Time */}
          <span className="text-[12px] text-stone-400 dark:text-stone-500">
            {format(new Date(reservation.date), 'EEE, MMM d')} · {formatTime(reservation.time)}
          </span>

          {/* Service name */}
          <h1 className="text-stone-900 dark:text-stone-100 text-[16px] leading-snug font-semibold tracking-[-0.01em] line-clamp-1">
            {reservation.serviceName}
          </h1>

          {/* Business name */}
          <p className="text-stone-400 dark:text-stone-500 text-[12px] line-clamp-1">
            {listing.title}
          </p>

          {/* Employee & Price */}
          <div className="flex items-center gap-2 text-[12px]">
            {employeeName && (
              <>
                <span className="text-stone-500  dark:text-stone-500">with {employeeName}</span>
                <span className="text-stone-300">|</span>
              </>
            )}
            <span className={`font-semibold tabular-nums ${isRefunded ? 'text-stone-400 dark:text-stone-500 line-through' : 'text-stone-900 dark:text-stone-100'}`}>
              ${reservation.totalPrice}
            </span>
            {isRefunded && (
              <span className="text-[10px] font-medium text-success-soft-foreground bg-success-soft px-1.5 py-0.5 rounded-full">Refunded</span>
            )}
            {isRefundRequested && (
              <span className="text-[10px] font-medium text-warning-soft-foreground bg-warning-soft px-1.5 py-0.5 rounded-full">Refund Requested</span>
            )}
            {isDisputed && (
              <span className="text-[10px] font-medium text-danger-soft-foreground bg-danger-soft px-1.5 py-0.5 rounded-full">Disputed</span>
            )}
          </div>
          {canRefund && (
            <button
              onClick={(e) => { e.stopPropagation(); onRefund(); }}
              disabled={disabled}
              className="mt-1 text-[11px] font-medium text-stone-500  dark:text-stone-500 hover:text-danger-soft-foreground transition-colors"
            >
              Request refund
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReserveCard;
