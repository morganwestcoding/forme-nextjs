'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import { SafeListing, SafeReservation, SafeUser, SafeService } from '@/app/types';
import { Heart, Clock, Star, User, Scissors, Droplet, SprayCan, Waves, Palette, Flower, Dumbbell } from 'lucide-react';
import useReservationModal from '@/app/hooks/useReservationModal';
import Avatar from '../ui/avatar';

interface ListingCardProps {
  data: SafeListing;
  reservation?: SafeReservation;
  currentUser?: SafeUser | null;
  categories?: { label: string; color: string }[];
  actionId?: string;
  actionLabel?: string;
  onAction?: (id: string) => void;
  onAccept?: () => void;
  onDecline?: () => void;
  disabled?: boolean;
  showAcceptDecline?: boolean;
}

const ListingCard: React.FC<ListingCardProps> = ({
  data,
  reservation,
  currentUser,
  categories,
  actionId,
  onAccept,
  onDecline,
  disabled,
  showAcceptDecline,
}) => {
  const router = useRouter();
  const reservationModal = useReservationModal();

  const handleOpenReservation = () => {
    reservationModal.onOpen(data, currentUser);
  };

  const [city, state] = data.location?.split(',').map(s => s.trim()) || [];

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
      onClick={() => router.push(`/listings/${data.id}`)}
      className="cursor-pointer bg-white rounded-xl shadow-lg hover:shadow-2xl overflow-hidden relative"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={data.imageSrc || '/placeholder.jpg'}
          alt={data.title}
          fill
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 card__overlay" />
      </div>

      <div className="relative z-10">
        <div className="relative h-[345px] overflow-hidden">
          <div className="absolute top-4 left-4 z-20">
            <div className="bg-black/40 border border-white backdrop-blur-sm rounded-lg text-center justify-center w-20 py-1.5 text-white">
              <span className="text-xs text-center">{data.category}</span>
            </div>
          </div>

          <div className="absolute bottom-5 left-5 right-5 text-white z-20">
            <div className="flex items-center space-x-2 mb-1">
              <h1 className="text-xl font-medium drop-shadow-lg">{data.title}</h1>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#60A5FA">
                <path d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 12.8929L10.8 14.5L15 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-xs drop-shadow-md font-thin flex items-center mb-3">
              {city}, {state} • 2.3 miles away
            </p>
            <div className="flex items-center justify-between bg-black/20 border-white border backdrop-blur-sm rounded-lg px-4 py-3 text-white">
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center space-x-1">
                  <Heart size={16} />
                  <span className="text-sm font-medium">3.8k</span>
                </div>
                <span className="text-xs opacity-70">Likes</span>
              </div>
              <div className="w-px h-8 bg-white/30"></div>
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center space-x-1">
                  <Star size={16} />
                  <span className="text-sm font-medium">4.7</span>
                </div>
                <span className="text-xs opacity-70">Rating</span>
              </div>
              <div className="w-px h-8 bg-white/30"></div>
              <div className="flex flex-col items-center space-y-1 text-center">
                <div className="flex items-center space-x-1">
                  <Clock size={14} className="text-white/80" />
                  <span className="text-xs text-white font-medium">Open</span>
                </div>
                <span className="text-xs text-white/50 font-light leading-none">
                  Closes 6:00PM
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-4 pt-2 -mt-3">
        <button
        onClick={(e) => {
          e.stopPropagation();
          reservationModal.onOpen(data, currentUser);}}
      className="w-full bg-[#60A5FA]/50 backdrop-blur-md text-white p-3 rounded-xl
      flex items-center justify-center hover:bg-white/10 transition-all
      shadow-lg border border-white/10"
>
              <div className="flex items-center text-center gap-3">
                <div className="flex flex-col items-center text-center">
                  <span className="font-medium text-sm">Explore Services</span>
                </div>
              </div>
            </button>
        </div>

        {reservation && (
          <div className="p-4 flex flex-col gap-4 backdrop-blur-md bg-black/40 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={reservation.user.image ?? undefined} />
                <div>
                  <h3 className="font-medium">{reservation.user.name}</h3>
                  <p className="text-sm text-gray-300">{format(new Date(reservation.date), 'PP')}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyles(reservation.status)}`}>
                {getStatusText(reservation.status)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/10 p-3 rounded-lg">
                <span className="text-xs text-gray-300 block mb-1">Service</span>
                <span className="font-medium text-sm">{reservation.serviceName}</span>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <span className="text-xs text-gray-300 block mb-1">Time</span>
                <span className="font-medium text-sm">{reservation.time}</span>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <span className="text-xs text-gray-300 block mb-1">Employee</span>
                <span className="font-medium text-sm">
                  {data.employees?.find(emp => emp.id === reservation.employeeId)?.fullName || 'Not assigned'}
                </span>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <span className="text-xs text-gray-300 block mb-1">Date</span>
                <span className="font-medium text-sm">{format(new Date(reservation.date), 'MMM d, yyyy')}</span>
              </div>
            </div>

            {reservation.note && (
              <div className="bg-white/10 p-3 rounded-lg">
                <span className="text-xs text-gray-300 block mb-1">Note</span>
                <p className="text-sm">{reservation.note}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="text-gray-300 text-sm">Total</span>
              <span className="font-semibold text-base">${reservation.totalPrice}</span>
            </div>
            {showAcceptDecline && (
  <div className="p-4 flex justify-between gap-4">
    <button
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onAccept?.();
      }}
      className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
        disabled
          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
          : 'bg-green-500 hover:bg-green-600 text-white'
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
      className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${
        disabled
          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
          : 'bg-red-500 hover:bg-red-600 text-white'
      }`}
    >
      Decline
    </button>
  </div>
)}

          </div>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
