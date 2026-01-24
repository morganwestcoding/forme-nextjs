'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { SafeReservation, SafeUser } from '@/app/types';

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
  disabled?: boolean;
  showAcceptDecline?: boolean;
  showCancel?: boolean;
  onCardClick?: () => void;
}

type UiStatus = 'pending' | 'accepted' | 'declined';

const normalizeStatus = (status: string): UiStatus => {
  if (status === 'accepted') return 'accepted';
  if (status === 'declined') return 'declined';
  return 'pending';
};

const ReserveCard: React.FC<ReserveCardProps> = ({
  reservation,
  listing,
  onAccept,
  onDecline,
  onCancel,
  disabled,
  showAcceptDecline,
  showCancel,
  onCardClick,
}) => {
  const uiStatus = normalizeStatus(reservation.status);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [localStatus, setLocalStatus] = useState<UiStatus>(uiStatus);

  const employeeName = listing.employees?.find(emp => emp.id === reservation.employeeId)?.fullName;
  const cardImage = listing.imageSrc || listing.galleryImages?.[0] || '/placeholder.jpg';

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

  const statusConfig = {
    accepted: { label: 'Confirmed', bg: 'bg-emerald-500/90 text-white border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.4)]' },
    declined: { label: 'Declined', bg: 'bg-black/60 text-white/90 border-white/20' },
    pending: { label: 'Pending', bg: 'bg-amber-500/90 text-white border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.4)]' },
  };

  const status = statusConfig[localStatus];

  return (
    <div
      onClick={onCardClick}
      className="group cursor-pointer rounded-xl border border-stone-300/90 p-3 transition-all duration-300 hover:border-stone-400 hover:shadow-sm"
      style={{
        background: 'linear-gradient(to bottom, #FAFAF9, #F7F7F6)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.7)',
      }}
    >
      <div className="flex flex-row gap-4 items-center w-full relative">
        {/* Image card */}
        <div className="relative overflow-hidden rounded-lg bg-neutral-900 flex-shrink-0 w-[120px] h-[120px] transition-[transform,filter] duration-500 ease-out group-hover:scale-[1.02]">
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
              className={`inline-flex items-center justify-center text-[10px] font-semibold px-2.5 h-[22px] rounded-md backdrop-blur-md border ${status.bg}`}
              style={{ lineHeight: '22px' }}
            >
              {status.label}
            </span>
          </div>
        </div>

        {/* Text content */}
        <div className="flex flex-col justify-center min-w-0 flex-1 gap-0.5">
          {/* Date & Time */}
          <span className="text-[12px] text-neutral-400">
            {format(new Date(reservation.date), 'EEE, MMM d')} · {formatTime(reservation.time)}
          </span>

          {/* Service name */}
          <h1 className="text-neutral-900 text-[16px] leading-snug font-semibold tracking-[-0.01em] line-clamp-1">
            {reservation.serviceName}
          </h1>

          {/* Business name */}
          <p className="text-neutral-400 text-[12px] line-clamp-1">
            {listing.title}
          </p>

          {/* Employee & Price */}
          <div className="mt-2 flex items-center gap-2 text-[12px]">
            {employeeName && (
              <>
                <span className="text-neutral-500">with {employeeName}</span>
                <span className="text-neutral-300">|</span>
              </>
            )}
            <span className="font-semibold text-neutral-900 tabular-nums">${reservation.totalPrice}</span>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="mt-2 flex gap-2">
              {isPending && !isTransitioning ? (
                <>
                  <button
                    disabled={disabled}
                    onClick={handleAccept}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                      disabled
                        ? 'bg-neutral-100 text-neutral-400'
                        : 'bg-neutral-900 text-white hover:bg-neutral-800'
                    }`}
                  >
                    Accept
                  </button>
                  <button
                    disabled={disabled}
                    onClick={handleReject}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                      disabled
                        ? 'bg-neutral-100 text-neutral-400'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {showAcceptDecline ? 'Decline' : 'Cancel'}
                  </button>
                </>
              ) : (
                <button
                  disabled={disabled}
                  onClick={handleReject}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
                    disabled
                      ? 'bg-neutral-100 text-neutral-400'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReserveCard;
