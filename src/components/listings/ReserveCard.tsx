'use client';

import React, { useState } from 'react';
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

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  const handleAccept = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setLocalStatus('accepted');
      setIsTransitioning(false);
      onAccept?.();
    }, 150);
  };

  const handleReject = () => {
    if (onDecline) onDecline();
    else if (onCancel) onCancel();
  };

  const showActions = showAcceptDecline || showCancel;
  const isPending = localStatus === 'pending';

  const statusConfig = {
    accepted: { label: 'Confirmed', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    declined: { label: 'Declined', color: 'text-neutral-500', bg: 'bg-neutral-100' },
    pending: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50' },
  };

  const status = statusConfig[localStatus];

  return (
    <div
      onClick={onCardClick}
      className="group cursor-pointer overflow-hidden rounded-xl bg-white border border-neutral-200 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-md max-w-[250px]"
    >
      <div className="h-[280px] flex flex-col p-4">
        {/* Top row - Status & Price */}
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md ${status.color} ${status.bg}`}>
            {status.label}
          </span>
          <span className="text-lg font-semibold text-neutral-900">
            ${reservation.totalPrice}
          </span>
        </div>

        {/* Date & Time - Hero */}
        <div className="mt-5">
          <div className="text-2xl font-bold text-neutral-900 leading-tight">
            {format(new Date(reservation.date), 'EEE, MMM d')}
          </div>
          <div className="text-base text-neutral-600 mt-0.5">
            {formatTime(reservation.time)}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Service */}
        <div className="text-sm font-semibold text-neutral-900 truncate">
          {reservation.serviceName}
        </div>

        {/* Business */}
        <div className="text-xs text-neutral-500 truncate mt-1">
          {listing.title}
        </div>

        {/* Employee */}
        {employeeName && (
          <div className="text-xs text-neutral-500 truncate mt-0.5">
            with {employeeName}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="mt-4">
            {isPending && !isTransitioning ? (
              <div className="flex gap-2">
                <button
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAccept();
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    disabled
                      ? 'bg-neutral-100 text-neutral-400'
                      : 'bg-neutral-900 text-white hover:bg-neutral-800'
                  }`}
                >
                  Accept
                </button>
                <button
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReject();
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    disabled
                      ? 'bg-neutral-100 text-neutral-400'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {showAcceptDecline ? 'Decline' : 'Cancel'}
                </button>
              </div>
            ) : (
              <button
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReject();
                }}
                className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-colors ${
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
  );
};

export default ReserveCard;
