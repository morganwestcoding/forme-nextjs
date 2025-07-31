'use client';

import React from 'react';
import { format } from 'date-fns';
import { SafeReservation, SafeUser } from '@/app/types';
import Avatar from '../ui/avatar';

// Flexible listing type for ReserveCard that doesn't require all SafeListing properties
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
  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'accepted';
      case 'declined':
        return 'declined';
      default:
        return '...pending';
    }
  };

  return (
    <div
      onClick={onCardClick}
      className="cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden transition-all duration-200"
    >
      <div className="p-4 flex flex-col gap-4 bg-gradient-to-br from-gray-50 to-gray-100">
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
            <span className="font-medium text-sm text-gray-900">{format(new Date(reservation.date), 'MMM d, yyyy')}</span>
          </div>
        </div>

        {/* Note Section */}
        {reservation.note && (
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <span className="text-xs text-gray-500 block mb-1">Note</span>
            <p className="text-sm text-gray-900">{reservation.note}</p>
          </div>
        )}

        {/* Total Price and Status */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <span className="text-gray-600 text-sm">Total</span>
            <span className="font-semibold text-lg text-gray-900">${reservation.totalPrice}</span>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusBadgeStyles(reservation.status)}`}>
            {getStatusText(reservation.status)}
          </span>
        </div>

        {/* Accept/Decline Buttons */}
        {showAcceptDecline && (
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
          </div>
        )}

        {/* Cancel Button */}
        {showCancel && (
          <div className="pt-2">
            <button
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                onCancel?.();
              }}
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