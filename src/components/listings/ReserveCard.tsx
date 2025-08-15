'use client';

import React from 'react';
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

  const getStatusBadgeStyles = (status: UiStatus) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: UiStatus) => {
    switch (status) {
      case 'accepted':
        return 'accepted';
      case 'declined':
        return 'declined';
      default:
        return '...pending';
    }
  };

  const hasNote = Boolean(reservation.note && reservation.note.trim().length > 0);

  return (
    <div
      onClick={onCardClick}
      className="cursor-pointer rounded-2xl shadow-lg hover:shadow-xl overflow-hidden transition-all duration-200"
    >
      <div className="p-4 flex flex-col gap-4 bg-slate-100 backdrop-blur-md border border-white/30">
        {/* Listing Information */}
        <div className="bg-white rounded-xl p-3 border border-gray-200">
          <div className="flex items-center gap-3">
            <img
              src={listing.imageSrc}
              alt={listing.title}
              className="w-12 h-12 rounded-full shadow-sm object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{listing.title}</h4>
              <p className="text-xs text-gray-600">{listing.location}</p>
            </div>

            {/* Note indicator (always in the same place) */}
            <div
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                hasNote ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-400'
              }`}
              title={hasNote ? 'Note attached' : 'No note'}
            >
              {/* tiny note icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M8 7H16M8 11H16M8 15H13M20 12V8.8C20 6.11984 20 4.77976 19.318 3.8399C19.0555 3.47773 18.7223 3.14451 18.3601 2.88197C17.4202 2.2 16.0802 2.2 13.4 2.2H10.6C7.91984 2.2 6.57976 2.2 5.6399 2.88197C5.27773 3.14451 4.94451 3.47773 4.68197 3.8399C4 4.77976 4 6.11984 4 8.8V15.2C4 17.8802 4 19.2202 4.68197 20.1601C4.94451 20.5223 5.27773 20.8555 5.6399 21.118C6.57976 21.8 7.91984 21.8 10.6 21.8H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M19 16L15.5 19.5M19 16L17 22L15.5 19.5M19 16L22 17L15.5 19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>{hasNote ? 'Note' : 'No note'}</span>
            </div>
          </div>
        </div>

        {/* Reservation Details */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <span className="text-xs text-gray-500 block mb-1">Service</span>
            <span className="font-medium text-sm text-gray-900">{reservation.serviceName}</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <span className="text-xs text-gray-500 block mb-1">Time</span>
            <span className="font-medium text-sm text-gray-900">{reservation.time}</span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <span className="text-xs text-gray-500 block mb-1">Employee</span>
            <span className="font-medium text-sm text-gray-900">
              {listing.employees?.find(emp => emp.id === reservation.employeeId)?.fullName || 'Not assigned'}
            </span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <span className="text-xs text-gray-500 block mb-1">Date</span>
            <span className="font-medium text-sm text-gray-900">
              {format(new Date(reservation.date), 'MMM d, yyyy')}
            </span>
          </div>
        </div>

        {/* Note content (only if present) */}
        {hasNote && (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <span className="text-xs text-gray-500 block mb-1">Note</span>
            <p className="text-sm text-gray-900">{reservation.note}</p>
          </div>
        )}

        {/* Price + status */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-gray-600 text-sm">Total</span>
            <span className="font-semibold text-lg text-gray-900">${reservation.totalPrice}</span>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusBadgeStyles(uiStatus)}`}>
            {getStatusText(uiStatus)}
          </span>
        </div>

        {/* Incoming view: Accept / Decline OR Accepted pill (with Cancel always available) */}
        {showAcceptDecline ? (
          uiStatus === 'accepted' ? (
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                disabled
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-green-500 text-white cursor-default flex items-center justify-center gap-2"
              >
                {/* accepted icon in white */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" color="currentColor" fill="none">
                  <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z" stroke="white" strokeWidth="1.5"></path>
                  <path d="M8 12.5L10.5 15L16 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
                Accepted
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // still allow cancel even after accepted
                  // rely on parent passing onCancel
                }}
                disabled={!onCancel}
                className="px-4 py-3 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex justify-between gap-3 pt-2">
              <button
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  onAccept?.();
                }}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  disabled
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
                }`}
              >
                Accept
              </button>
              <button
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  onDecline?.();
                }}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  disabled
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg'
                }`}
              >
                Decline
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel?.();
                }}
                disabled={!onCancel}
                className="px-4 py-3 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Cancel
              </button>
            </div>
          )
        ) : null}

        {/* Outgoing view: status + Cancel (parent sets showCancel=true) */}
        {showCancel && !showAcceptDecline && (
          <div className="pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCancel?.();
              }}
              disabled={disabled}
              className={`w-full py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                disabled
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg'
              }`}
            >
              Cancel Reservation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReserveCard;
