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
          bg: 'bg-emerald-100/60', 
          border: 'border-emerald-200/40',
          text: 'text-emerald-700', 
          label: 'Confirmed',
          hover: 'hover:bg-emerald-100/80'
        };
      case 'declined':
        return { 
          bg: 'bg-rose-100/60', 
          border: 'border-rose-200/40',
          text: 'text-rose-700', 
          label: 'Declined',
          hover: 'hover:bg-rose-100/80'
        };
      default:
        return { 
          bg: 'bg-amber-100/60', 
          border: 'border-amber-200/40',
          text: 'text-amber-700', 
          label: 'Pending',
          hover: 'hover:bg-amber-100/80'
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

  // Pill styling base class matching SmartBadgeWorker
  const pillBase = 'backdrop-blur-sm rounded-lg py-1.5 text-xs font-medium w-24 px-3 text-center transition-all duration-200 cursor-pointer hover:scale-105';

  return (
    <div
      onClick={onCardClick}
      className="cursor-pointer bg-white rounded-2xl shadow hover:shadow-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] max-w-[250px]"
    >
      {/* Match your existing card height structure */}
      <div className="relative h-[350px]">
        
        {/* Note indicator - always visible, changes color based on note presence */}
        <div className="absolute top-4 right-4 z-20">
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

        {/* Top section - image, listing name and location (moved down) */}
        <div className="absolute top-16 left-5 right-5 flex items-center gap-3">
          <img
            src={listing.imageSrc}
            alt={listing.title}
            className="w-12 h-12 rounded-lg object-cover shadow-sm flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {listing.title}
            </h3>
            <p className="text-xs text-gray-600 truncate">
              {listing.location}
            </p>
          </div>
        </div>

        {/* Subtle separator */}
        <div className="absolute top-32 left-5 right-5 h-px bg-gray-100"></div>

        {/* Service details - more compact and sleek */}
        <div className="absolute top-36 left-5 right-5">
          <div className="space-y-2">
            {/* Service name - smaller and more refined */}
            <p className="font-medium text-gray-900 text-base leading-tight">
              {reservation.serviceName}
            </p>
            
            {/* Professional info - more compact */}
            <p className="text-xs text-gray-500 font-medium">
              {employeeName}
            </p>
            
            {/* Price - smaller but still prominent */}
            <div className="mt-2">
              <span className="text-xl font-medium text-gray-900 tracking-tight">
                ${reservation.totalPrice}
              </span>
            </div>
            
            {/* Date and time - more compact */}
            <p className="text-xs text-gray-600 font-medium leading-relaxed">
              {format(new Date(reservation.date), 'MMM d, yyyy')} • {(() => {
                const [hours, minutes] = reservation.time.split(':');
                const hour = parseInt(hours, 10);
                const period = hour >= 12 ? 'PM' : 'AM';
                const hour12 = hour % 12 || 12;
                return `${hour12}:${minutes} ${period}`;
              })()}
            </p>
          </div>
        </div>

        {/* Confirmed pill - top left corner when confirmed */}
        {(isConfirmed || isDeclined) && (
          <div className="absolute top-4 left-4">
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
          </div>
        )}

        {/* Bottom action buttons - show when pending or when confirmed (for cancel) */}
        {showActions && (
          <div className="absolute bottom-5 pt-2 left-5 right-5">
            <div className={`flex gap-4 pt-3 border-t border-gray-100 transition-all duration-300 ${
              isConfirmed ? 'justify-center' : 'justify-center'
            }`}>
              {/* Green checkmark button - hide after confirmation */}
              {showActionButtons && (
                <button
                  disabled={disabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAccept();
                  }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                    disabled
                      ? 'bg-gray-100 cursor-not-allowed'
                      : 'bg-green-100 hover:bg-green-200 hover:shadow-md'
                  } ${isTransitioning ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M8 12.5L10.5 15L16 9" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${
                  disabled
                    ? 'bg-gray-100 cursor-not-allowed'
                    : isConfirmed 
                      ? 'bg-gray-100 hover:bg-gray-200 hover:shadow-md' // Gray cancel style after confirmation
                      : 'bg-red-100 hover:bg-red-200 hover:shadow-md'    // Red decline style when pending
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
          </div>
        )}
      </div>

    </div>
  );
};

export default ReserveCard;