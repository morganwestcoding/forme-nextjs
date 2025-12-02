'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { SafeReservation, SafeUser } from '@/app/types';
import { Calendar02Icon, UserFullViewIcon } from 'hugeicons-react';

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
  currentUser,
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

  const hasNote = Boolean(reservation.note && reservation.note.trim().length > 0);
  const employeeName = listing.employees?.find(emp => emp.id === reservation.employeeId)?.fullName || 'Not assigned';

  // Format time
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  // Handle accept with optimistic UI
  const handleAccept = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setLocalStatus('accepted');
      setIsTransitioning(false);
      onAccept?.();
    }, 150);
  };

  // Handle decline/cancel
  const handleReject = () => {
    if (onDecline) onDecline();
    else if (onCancel) onCancel();
  };

  const showActions = showAcceptDecline || showCancel;
  const isPending = localStatus === 'pending';

  // Status configuration
  const statusConfig = {
    accepted: {
      dot: 'bg-emerald-500',
      ring: 'ring-emerald-500/20',
      text: 'text-emerald-700',
      label: 'Confirmed',
      bg: 'bg-emerald-50',
    },
    declined: {
      dot: 'bg-rose-500',
      ring: 'ring-rose-500/20',
      text: 'text-rose-700',
      label: 'Declined',
      bg: 'bg-rose-50',
    },
    pending: {
      dot: 'bg-amber-500',
      ring: 'ring-amber-500/20',
      text: 'text-amber-700',
      label: 'Pending',
      bg: 'bg-amber-50',
    },
  };

  const config = statusConfig[localStatus];

  return (
    <div
      onClick={onCardClick}
      className="group cursor-pointer rounded-xl bg-white border border-gray-200 overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:-translate-y-1 hover:shadow-md hover:border-gray-300 max-w-[250px]"
    >
      {/* Header Image with Gradient Overlay */}
      <div className="relative h-[120px] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <img
          src={listing.imageSrc}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to top,
              rgba(0,0,0,0.60) 0%,
              rgba(0,0,0,0.45) 20%,
              rgba(0,0,0,0.25) 50%,
              rgba(0,0,0,0.10) 75%,
              rgba(0,0,0,0.00) 100%)`
          }}
        />

        {/* Business info overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-sm font-semibold text-white drop-shadow leading-tight tracking-tight truncate">
            {listing.title}
          </h3>
          <p className="text-[11px] text-white/90 drop-shadow truncate font-light mt-0.5">
            {listing.location}
          </p>
        </div>

        {/* Note indicator - top right */}
        {hasNote && (
          <div className="absolute top-2 right-2">
            <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M12 5H11C7.72876 5 5.84315 5 4.67157 6.17157C3.5 7.34315 3.5 9.22876 3.5 13V14C3.5 17.7712 3.5 19.6569 4.67157 20.8284C5.84315 22 7.72876 22 11 22L12 22C15.7712 22 17.6569 22 18.8284 20.8284C20 19.6569 20 17.7712 20 14V13C20 9.22876 20 7.34315 18.8284 6.17157C17.6569 5 15.7712 5 12 5Z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M7 17H12M7 13H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">

        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${config.bg} transition-all duration-200`}>
            <div className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
            <span className={`text-[11px] font-semibold ${config.text} tracking-wide`}>
              {config.label}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" className="text-emerald-500" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
              <path d="M15 9.5C15 8.11929 13.8807 7 12.5 7C11.1193 7 10 8.11929 10 9.5C10 10.8807 11.1193 12 12.5 12C13.8807 12 15 13.1193 15 14.5C15 15.8807 13.8807 17 12.5 17C11.1193 17 10 15.8807 10 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
              <path d="M12.5 7V5.5M12.5 18.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"></path>
            </svg>
            <span className="text-lg font-semibold text-gray-900 tracking-tight">
              ${reservation.totalPrice}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100" />

        {/* Service Name */}
        <div>
          <p className="text-[13px] font-semibold text-gray-900 leading-snug tracking-tight">
            {reservation.serviceName}
          </p>
        </div>

        {/* Employee */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
            <UserFullViewIcon size={12} color="#6b7280" />
          </div>
          <span className="text-xs text-gray-600 font-medium truncate">
            {employeeName}
          </span>
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
            <Calendar02Icon size={11} color="#6b7280" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-900 font-medium leading-tight">
              {format(new Date(reservation.date), 'MMM d, yyyy')}
            </span>
            <span className="text-[10px] text-gray-500 font-medium leading-tight">
              {formatTime(reservation.time)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="pt-3 border-t border-gray-100">
            {isPending && !isTransitioning ? (
              // Pending state - show both buttons
              <div className="flex gap-2">
                <button
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAccept();
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    disabled
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 hover:bg-emerald-500/20 hover:shadow-md hover:scale-[1.02]'
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M8 12.5L10.5 15L16 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Accept
                </button>
                <button
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReject();
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    disabled
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-rose-500/10 text-rose-700 border border-rose-500/20 hover:bg-rose-500/20 hover:shadow-md hover:scale-[1.02]'
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {showAcceptDecline ? 'Decline' : 'Cancel'}
                </button>
              </div>
            ) : (
              // Confirmed/Declined state - show only cancel
              <button
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReject();
                }}
                className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  disabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-500/10 text-gray-700 border border-gray-500/20 hover:bg-gray-500/20 hover:shadow-md hover:scale-[1.02]'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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
