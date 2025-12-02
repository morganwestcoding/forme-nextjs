'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { SafeReservation, SafeUser } from '@/app/types';

// --- Keep your ReserveCardListing as-is ---
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

// Accept SafeReservation directly (status is string)
interface ReserveCardProps {
  reservation: SafeReservation;
  listing: ReserveCardListing;
  currentUser?: SafeUser | null;
  onAccept?: () => void;
  onDecline?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
  showAcceptDecline?: boolean; // incoming (store owner view)
  showCancel?: boolean;        // outgoing (customer view)
  onCardClick?: () => void;
}

// Normalize any string into our UI's three states
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
  const [showConfirmedPill, setShowConfirmedPill] = useState(false);

  const getStatusPill = (status: UiStatus) => {
    switch (status) {
      case 'accepted':
        return {
          bg: 'backdrop-blur-md bg-emerald-500/10',
          border: 'border-emerald-500/20',
          text: 'text-emerald-700',
          label: 'Confirmed',
          hover: 'hover:bg-emerald-500/20 hover:shadow-lg'
        };
      case 'declined':
        return {
          bg: 'backdrop-blur-md bg-rose-500/10',
          border: 'border-rose-500/20',
          text: 'text-rose-700',
          label: 'Declined',
          hover: 'hover:bg-rose-500/20 hover:shadow-lg'
        };
      default:
        return {
          bg: 'backdrop-blur-md bg-amber-500/20',
          border: 'border-amber-500/30',
          text: 'text-amber-800',
          label: 'Pending',
          hover: 'hover:bg-amber-500/30 hover:shadow-lg'
        };
    }
  };

  const statusPill = getStatusPill(uiStatus);
  const hasNote = Boolean(reservation.note && reservation.note.trim().length > 0);
  const employeeName = listing.employees?.find(emp => emp.id === reservation.employeeId)?.fullName || 'Not assigned';

  // Handle accept with transition
  const handleAccept = () => {
    setIsTransitioning(true);
    // Start the transition
    setTimeout(() => {
      setShowConfirmedPill(true);
      onAccept?.();
    }, 200); // 200ms delay for smooth transition
  };

  // Determine which action to show (consolidate decline/cancel)
  const handleReject = () => {
    if (onDecline) onDecline();
    else if (onCancel) onCancel();
  };

  const showActions = showAcceptDecline || showCancel;
  const isConfirmed = uiStatus === 'accepted' || showConfirmedPill;
  const isDeclined = uiStatus === 'declined';
  const showActionButtons = showActions && uiStatus === 'pending' && !isTransitioning;

  // Pill styling with glass morphism
  const pillBase = 'rounded-lg py-1.5 text-xs font-semibold w-24 px-3 text-center transition-all duration-200 border shadow-sm';

  return (
    <div
      onClick={onCardClick}
      className="group cursor-pointer rounded-2xl bg-white border border-gray-200 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:border-gray-300 max-w-[250px] relative"
    >
      {/* Subtle texture pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 11px),
            repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 11px)
          `
        }}
      />

      {/* Content using flex layout */}
      <div className="relative flex flex-col p-5 min-h-[350px]">

        {/* Top row: Status pill (if confirmed/declined) and Note icon */}
        <div className="flex items-start justify-between mb-3">
          {/* Status pill - left side when confirmed/declined */}
          <div className="flex-shrink-0">
            {(isConfirmed || isDeclined) && (
              <div
                className={[
                  pillBase,
                  statusPill.bg,
                  `border ${statusPill.border}`,
                  statusPill.text,
                  statusPill.hover,
                  showConfirmedPill ? 'animate-in fade-in slide-in-from-top-2 duration-300' : '',
                ].join(' ')}
              >
                <span className="font-semibold">{statusPill.label}</span>
              </div>
            )}
          </div>

          {/* Note icon - right side */}
          <div className="flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              color={hasNote ? "#374151" : "#D1D5DB"}
              fill="none"
            >
              <path d="M12.5 5H11.5C7.72876 5 5.84315 5 4.67157 6.17157C3.5 7.34315 3.5 9.22876 3.5 13V14C3.5 17.7712 3.5 19.6569 4.67157 20.8284C5.84315 22 7.72876 22 11.5 22L12.5 22C16.2712 22 18.1569 22 19.3284 20.8284C20.5 19.6569 20.5 17.7712 20.5 14V13C20.5 9.22876 20.5 7.34315 19.3284 6.17157C18.1569 5 16.2712 5 12.5 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M11 7.5C11 8.32843 11.6716 9 12.5 9C13.3284 9 14 8.32843 14 7.5V4C14 2.89543 13.1046 2 12 2C10.8954 2 10 2.89543 10 4V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
              <path d="M7.5 17.5H12.5M7.5 13.5H16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </div>
        </div>

        {/* Listing info */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={listing.imageSrc}
            alt={listing.title}
            className="w-12 h-12 rounded-lg object-cover shadow-md ring-2 ring-white/50 flex-shrink-0 transition-transform duration-200 group-hover:scale-105"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate tracking-tight">
              {listing.title}
            </h3>
            <p className="text-xs text-gray-500 truncate font-medium">
              {listing.location}
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-gray-100 mb-4" />

        {/* Service details - grows to fill space */}
        <div className="flex-1 space-y-2 mb-4">
          <p className="font-semibold text-gray-900 text-base leading-tight tracking-tight">
            {reservation.serviceName}
          </p>

          <p className="text-xs text-gray-500 font-medium tracking-wide">
            {employeeName}
          </p>

          <div className="mt-2">
            <span className="text-xl font-semibold text-gray-900 tracking-tight">
              ${reservation.totalPrice}
            </span>
          </div>

          <p className="text-xs text-gray-600 font-medium leading-relaxed tracking-wide">
            {format(new Date(reservation.date), 'MMM d, yyyy')} • {(() => {
              const [hours, minutes] = reservation.time.split(':');
              const hour = parseInt(hours, 10);
              const period = hour >= 12 ? 'PM' : 'AM';
              const hour12 = hour % 12 || 12;
              return `${hour12}:${minutes} ${period}`;
            })()}
          </p>
        </div>

        {/* Action buttons at bottom */}
        {showActions && (
          <div className="flex gap-4 pt-4 border-t border-gray-100 justify-center">
            {/* Green checkmark button - hide after confirmation */}
            {showActionButtons && (
              <button
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAccept();
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border ${
                  disabled
                    ? 'bg-gray-100/50 border-gray-200 cursor-not-allowed'
                    : 'bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 hover:shadow-lg hover:scale-105'
                } ${isTransitioning ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M8 12.5L10.5 15L16 9" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}

            {/* Red X button - changes to gray cancel style after confirmation */}
            <button
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                handleReject();
              }}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm border ${
                disabled
                  ? 'bg-gray-100/50 border-gray-200 cursor-not-allowed'
                  : isConfirmed
                    ? 'bg-gray-500/10 border-gray-500/20 hover:bg-gray-500/20 hover:shadow-lg hover:scale-105'
                    : 'bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20 hover:shadow-lg hover:scale-105'
              } ${isConfirmed ? 'translate-x-0' : ''}`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke={isConfirmed ? "#6b7280" : "#dc2626"}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default ReserveCard;